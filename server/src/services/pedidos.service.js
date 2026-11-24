const cupomModel = require("../models/cupom.model");
const pedidoModel = require("../models/pedido.model");
const produtoModel = require("../models/produto.model");
const HttpError = require("../utils/httpError");
const { validateOrder } = require("../utils/validation");
const mercadoPago = require("./mercadopago.service");

const toCents = (value) => Math.round(value * 100);

// Subtotal, desconto e total em reais (arredondados em centavos). Função pura, testada isoladamente.
function calculateTotals(lines, percent = 0) {
  const subtotalCents = lines.reduce((sum, line) => sum + toCents(line.unitPrice) * line.quantity, 0);
  const discountCents = Math.round((subtotalCents * percent) / 100);
  return {
    subtotal: subtotalCents / 100,
    discount: discountCents / 100,
    total: (subtotalCents - discountCents) / 100,
  };
}

// Valida o cupom informado: precisa existir e estar ativo.
async function findCoupon(code) {
  if (!code) return null;
  const coupon = await cupomModel.findByCode(code);
  if (!coupon || !coupon.ativo) throw new HttpError(400, "Cupom inválido ou inativo.");
  return coupon;
}

// Os preços vêm do banco: o app só informa produto, tamanho e quantidade.
async function buildLines(items) {
  return Promise.all(
    items.map(async (item) => {
      const product = await produtoModel.findById(item.productId);
      if (!product) throw new HttpError(400, "Um dos produtos do carrinho não está mais disponível.");
      if (!product.sizes.includes(item.size)) throw new HttpError(400, `Tamanho ${item.size} indisponível para ${product.name}.`);
      return { productId: product.id, name: product.name, size: item.size, quantity: item.quantity, unitPrice: product.price };
    }),
  );
}

// Cria o pedido (pending) e a preferência de pagamento no Mercado Pago.
async function create(userId, data) {
  const order = validateOrder(data);
  const coupon = await findCoupon(order.couponCode);
  const lines = await buildLines(order.items);
  const totals = calculateTotals(lines, coupon ? coupon.percentual : 0);

  const orderId = await pedidoModel.create({ userId, totals, couponCode: coupon ? coupon.codigo : null, address: order.address, lines });

  let preference;
  try {
    preference = await mercadoPago.createPreference({ orderId, items: lines });
  } catch (error) {
    console.error("Erro ao criar preferência no Mercado Pago:", error);
    throw new HttpError(502, "Não foi possível iniciar o pagamento no Mercado Pago.");
  }
  await pedidoModel.setPreferenceId(orderId, preference.id);

  return {
    orderId: `SW-${String(orderId).padStart(6, "0")}`,
    pedidoId: orderId,
    total: totals.total,
    init_point: preference.initPoint,
    sandbox_init_point: preference.sandboxInitPoint,
  };
}

// Status do Mercado Pago -> status do pedido.
function mapPaymentStatus(status) {
  if (status === "approved") return "approved";
  if (status === "rejected" || status === "cancelled") return "rejected";
  return "pending";
}

// Webhook: consulta o pagamento no Mercado Pago e atualiza o pedido (external_reference = id do pedido).
async function syncPayment(paymentId) {
  const payment = await mercadoPago.getPayment(paymentId);
  const orderId = Number(payment.external_reference);
  if (!Number.isInteger(orderId) || orderId <= 0) return false;
  return pedidoModel.updatePayment(orderId, mapPaymentStatus(payment.status), String(paymentId));
}

module.exports = { calculateTotals, mapPaymentStatus, create, syncPayment };
