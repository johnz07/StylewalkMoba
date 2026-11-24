// Integração com o Mercado Pago (Checkout Pro, ambiente de desenvolvedor).
const { MercadoPagoConfig, Payment, Preference } = require("mercadopago");
const env = require("../config/env");

// Cliente criado só no primeiro uso, para a API subir (e os testes rodarem) sem o token.
let client = null;
function getClient() {
  if (!client) client = new MercadoPagoConfig({ accessToken: env.mpAccessToken });
  return client;
}

// Cria a preferência de pagamento e devolve os links do checkout.
async function createPreference({ orderId, items }) {
  const preference = await new Preference(getClient()).create({
    body: {
      items: items.map((item) => ({ title: item.name, quantity: item.quantity, unit_price: item.unitPrice, currency_id: "BRL" })),
      external_reference: String(orderId),
      back_urls: {
        success: "https://www.mercadopago.com.br",
        failure: "https://www.mercadopago.com.br",
        pending: "https://www.mercadopago.com.br",
      },
      auto_return: "approved",
    },
  });
  return { id: preference.id, initPoint: preference.init_point, sandboxInitPoint: preference.sandbox_init_point };
}

function getPayment(paymentId) {
  return new Payment(getClient()).get({ id: paymentId });
}

module.exports = { createPreference, getPayment };
