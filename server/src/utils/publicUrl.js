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

// Caminho inverso, ao salvar: uma URL de imagem desta própria API (ex.: o admin editou um
// produto do seed) volta a ser relativa, para continuar valendo em outro endereço (IP/nuvem).
function toStoredImagePath(req, value) {
  if (typeof value !== "string") return value;
  const ownPrefix = `${req.protocol}://${req.get("host")}/images/`;
  return value.trim().startsWith(ownPrefix) ? `/images/${value.trim().slice(ownPrefix.length)}` : value;
}

module.exports = { toPublicUrl, withPublicImages, toStoredImagePath };
