// Acesso às tabelas pedidos e itens_pedido.
const db = require("../config/db");

// Grava o pedido (status pending) e os itens na mesma transação; devolve o id do pedido.
function create({ userId, totals, couponCode, address, lines }) {
  return db.withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO pedidos (
         usuario_id, status, subtotal, desconto, total, cupom_codigo,
         entrega_cep, entrega_logradouro, entrega_numero, entrega_complemento,
         entrega_bairro, entrega_cidade, entrega_uf
       ) VALUES ($1, 'pending', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [
        userId, totals.subtotal, totals.discount, totals.total, couponCode,
        address.zipCode, address.street, address.number, address.complement,
        address.district, address.city, address.state,
      ],
    );
    const orderId = rows[0].id;
    for (const line of lines) {
      await client.query(
        "INSERT INTO itens_pedido (pedido_id, produto_id, tamanho, quantidade, preco_unitario) VALUES ($1, $2, $3, $4, $5)",
        [orderId, line.productId, line.size, line.quantity, line.unitPrice],
      );
    }
    return orderId;
  });
}

function setPreferenceId(orderId, preferenceId) {
  return db.query("UPDATE pedidos SET mp_preference_id = $2, atualizado_em = now() WHERE id = $1", [orderId, preferenceId]);
}

// Atualiza o status e o pagamento (webhook do Mercado Pago). Devolve true se o pedido existe.
async function updatePayment(orderId, status, paymentId) {
  const { rowCount } = await db.query(
    "UPDATE pedidos SET status = $2, mp_payment_id = $3, atualizado_em = now() WHERE id = $1",
    [orderId, status, paymentId],
  );
  return rowCount > 0;
}

// Dados completos para o JSON do dashboard (item 2.2 do roteiro).
async function findReportData() {
  const [categorias, produtos, pedidos, itensPedido] = await Promise.all([
    db.query("SELECT id, nome FROM categorias ORDER BY id"),
    db.query("SELECT id, nome, preco, categoria_id, destaque, ativo FROM produtos ORDER BY id"),
    db.query(
      `SELECT id, usuario_id, status, subtotal, desconto, total, cupom_codigo, entrega_cidade, entrega_uf, criado_em
       FROM pedidos ORDER BY criado_em DESC, id DESC`,
    ),
    db.query("SELECT pedido_id, produto_id, tamanho, quantidade, preco_unitario FROM itens_pedido ORDER BY id"),
  ]);
  return { categorias: categorias.rows, produtos: produtos.rows, pedidos: pedidos.rows, itens_pedido: itensPedido.rows };
}

module.exports = { create, setPreferenceId, updatePayment, findReportData };
