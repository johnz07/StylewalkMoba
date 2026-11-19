// Constantes do catálogo. Os produtos e as categorias vêm da API (GET /produtos e GET /categorias).

// Imagem usada quando o produto não tem foto (ou a URL não carrega).
export const placeholderImage = require("../assets/Image-Placeholder.png");

// Selos exibidos no card e usados pelos atalhos da Home (Lançamento exclusivo, Novo, Limitado).
export const badges = ["exclusivo", "novo", "limitado"];

// Converte o produto da API para o formato que as telas usam (`image` pronto para o <Image>).
export function toAppProduct(product) {
  return {
    ...product,
    image: product.imageUrl ? { uri: product.imageUrl } : placeholderImage,
  };
}
