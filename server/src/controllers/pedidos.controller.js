const pedidosService = require("../services/pedidos.service");

// POST /pedidos: cria o pedido e devolve o link de pagamento do Mercado Pago.
async function create(req, res) {
  res.status(201).json(await pedidosService.create(req.user.id, req.body));
}

// POST /webhooks/mercadopago: o Mercado Pago só precisa de 200; falhas ficam no log.
async function mercadoPagoWebhook(req, res) {
  const paymentId = req.body?.data?.id || req.query?.["data.id"];
  if (paymentId) {
    try {
      await pedidosService.syncPayment(paymentId);
    } catch (error) {
      console.error("Erro no webhook do Mercado Pago:", error);
    }
  }
  res.sendStatus(200);
}

module.exports = { create, mercadoPagoWebhook };
