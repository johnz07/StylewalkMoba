const { Router } = require("express");
const db = require("../config/db");
const authController = require("../controllers/auth.controller");
const categoriasController = require("../controllers/categorias.controller");
const produtosController = require("../controllers/produtos.controller");
const { requireAdmin, requireAuth } = require("../middlewares/auth");

const router = Router();

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

module.exports = router;
