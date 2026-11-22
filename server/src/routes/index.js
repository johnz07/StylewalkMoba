const { Router } = require("express");
const db = require("../config/db");
const authController = require("../controllers/auth.controller");
const categoriasController = require("../controllers/categorias.controller");
const produtosController = require("../controllers/produtos.controller");
const { requireAdmin, requireAuth } = require("../middlewares/auth");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
const router = Router();

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

// Saúde da API e do banco (útil para conferir se o app enxerga o servidor).
router.get("/health", async (req, res) => {
  await db.query("SELECT 1");
  res.json({ status: "ok" });
});

// Autenticação
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/me", requireAuth, authController.me);

// Catálogo (público)
router.get("/categorias", categoriasController.list);
router.get("/produtos", produtosController.list);
router.get("/produtos/:id", produtosController.getById);

// CRUD de produtos (só admin)
router.post("/produtos", requireAuth, requireAdmin, produtosController.create);
router.put("/produtos/:id", requireAuth, requireAdmin, produtosController.update);
router.delete("/produtos/:id", requireAuth, requireAdmin, produtosController.remove);

// Cupons (público ou autenticado, para o carrinho validar)
router.get("/cupons/:codigo", async (req, res, next) => {
  try {
    const { codigo } = req.params;
    const result = await db.query(
      "SELECT codigo, percentual, ativo FROM cupons WHERE UPPER(codigo) = UPPER($1)",
      [codigo]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cupom não encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Relatório de exportação em JSON para o Dashboard (Etapa 5 / item 2.2)
router.get("/relatorios/export", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [categorias, produtos, pedidos, itensPedido] = await Promise.all([
      db.query("SELECT id, nome FROM categorias ORDER BY id"),
      db.query("SELECT id, nome, preco, categoria_id, destaque, ativo FROM produtos ORDER BY id"),
      db.query("SELECT id, usuario_id, status, subtotal, desconto, total, cupom_codigo, entrega_cidade, entrega_uf, criado_em FROM pedidos ORDER BY criado_em DESC"),
      db.query("SELECT pedido_id, produto_id, tamanho, quantidade, preco_unitario FROM itens_pedido"),
    ]);

    res.json({
      gerado_em: new Date().toISOString(),
      categorias: categorias.rows,
      produtos: produtos.rows,
      pedidos: pedidos.rows,
      itens_pedido: itensPedido.rows,
    });
  } catch (error) {
    console.error("Erro na exportação de relatórios:", error);
    next(error);
  }
});

// Criar Pedido e Preferência no Mercado Pago (Etapa 6)
router.post("/pedidos", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items, couponCode, address } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: "Carrinho vazio" });
    }

    // 1. Calcular subtotal e verificar cupom se houver
    let subtotal = 0;
    for (const item of items) {
      subtotal += Number(item.price) * Number(item.quantity);
    }

    let desconto = 0;
    let cupomUtilizado = null;
    if (couponCode) {
      const couponRes = await db.query(
        "SELECT codigo, percentual, ativo FROM cupons WHERE UPPER(codigo) = UPPER($1)",
        [couponCode]
      );
      if (couponRes.rows.length > 0 && couponRes.rows[0].ativo) {
        const percentual = Number(couponRes.rows[0].percentual);
        desconto = (subtotal * percentual) / 100;
        cupomUtilizado = couponRes.rows[0].codigo;
      }
    }

    const total = Math.max(0, subtotal - desconto);

    // 2. Inserir o pedido no banco com status 'pending'
    const pedidoQuery = `
      INSERT INTO pedidos (
        usuario_id, status, subtotal, desconto, total, cupom_codigo,
        entrega_cep, entrega_logradouro, entrega_numero, entrega_complemento,
        entrega_bairro, entrega_cidade, entrega_uf
      ) VALUES ($1, 'pending', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `;
    const pedidoValues = [
      userId, subtotal, desconto, total, cupomUtilizado,
      address.zipCode, address.street, address.number, address.complement || "",
      address.district, address.city, address.state
    ];
    const pedidoResult = await db.query(pedidoQuery, pedidoValues);
    const pedidoId = pedidoResult.rows[0].id;

    // 3. Inserir os itens do pedido
    for (const item of items) {
      const produtoId = Number(
        item.productId ?? item.produto_id ?? item.id ?? String(item.key || "").split("-")[0]
      );

      if (!produtoId || Number.isNaN(produtoId)) {
        return res.status(400).json({ error: `ID do produto inválido para o item: ${item.name}` });
      }

      await db.query(
        `INSERT INTO itens_pedido (pedido_id, produto_id, tamanho, quantidade, preco_unitario)
         VALUES ($1, $2, $3, $4, $5)`,
        [pedidoId, produtoId, item.size, item.quantity, item.price]
      );
    }W

    // 4. Criar preferência de pagamento no Mercado Pago
    const preferenceItems = items.map((item) => ({
      title: item.name,
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      currency_id: "BRL",
    }));

    const preference = new Preference(mpClient);
    const resultMP = await preference.create({
      body: {
        items: preferenceItems,
        external_reference: String(pedidoId),
        back_urls: {
          success: "https://www.mercadopago.com.br", // ou URL de retorno do app/web
          failure: "https://www.mercadopago.com.br",
          pending: "https://www.mercadopago.com.br",
        },
        auto_return: "approved",
      },
    });

    // Salvar o preference_id no banco
    await db.query("UPDATE pedidos SET mp_preference_id = $1 WHERE id = $2", [resultMP.id, pedidoId]);

    res.status(201).json({
      orderId: `SW-${String(pedidoId).padStart(6, '0')}`,
      pedidoId,
      total,
      init_point: resultMP.init_point,
      sandbox_init_point: resultMP.sandbox_init_point,
    });
  } catch (error) {
    console.error("Erro ao criar pedido/preferência MP:", error);
    next(error);
  }
});

// Webhook para atualizar o status do pedido automaticamente via Mercado Pago
router.post("/webhooks/mercadopago", async (req, res) => {
  try {
    const paymentId = req.body?.data?.id || req.query?.["data.id"];
    if (paymentId) {
      const payment = await new Payment(mpClient).get({ id: paymentId });
      const pedidoId = payment.external_reference;
      const novoStatus = payment.status === "approved" ? "approved" : payment.status === "rejected" ? "rejected" : "pending";

      await db.query(
        "UPDATE pedidos SET status = $1, mp_payment_id = $2, atualizado_em = now() WHERE id = $3",
        [novoStatus, String(paymentId), pedidoId]
      );
    }
    res.sendStatus(200);
  } catch (error) {
    console.error("Erro no webhook MP:", error);
    res.sendStatus(200);
  }
});

module.exports = router;
