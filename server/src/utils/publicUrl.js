// Imagens do seed ficam salvas como caminho relativo ("/images/x.png") e viram URL completa
// com o endereço pelo qual o app acessou a API (IP da rede local, localhost ou domínio na nuvem).
function toPublicUrl(req, value) {
  if (!value || /^https?:\/\//i.test(value)) return value || null;
  return `${req.protocol}://${req.get("host")}${value.startsWith("/") ? "" : "/"}${value}`;
}

function withPublicImages(req, product) {
  return {
    ...product,
    imageUrl: toPublicUrl(req, product.imageUrl),
  };
}

module.exports = { toPublicUrl, withPublicImages };
