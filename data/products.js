// Fonte única de produtos (mock). Loja, carrinho e admin leem daqui via StoreContext.
export const defaultSizes = [37, 38, 39, 40, 41, 42, 43, 44];

export const placeholderImage = require("../assets/Image-Placeholder.png");

export const initialProducts = [
  {
    id: "ultraboost-runner",
    name: "UltraBoost Runner",
    description: "Conforto máximo para suas corridas diárias.",
    category: "Masculino",
    price: 899.9,
    image: require("../assets/product-image.png"),
    featuredImage: require("../assets/image-container.png"),
    featured: true,
    sizes: defaultSizes,
  },
  {
    id: "air-zoom-pegasus",
    name: "Air Zoom Pegasus",
    description: "Leveza e resposta para treinos intensos.",
    category: "Feminino",
    price: 749.9,
    image: require("../assets/product-image2.png"),
    featuredImage: require("../assets/image-container1.png"),
    featured: true,
    sizes: defaultSizes,
  },
  {
    id: "classic-leather",
    name: "Classic Leather",
    description: "Estilo casual para o dia a dia.",
    category: "Unissex",
    price: 399.9,
    image: require("../assets/product-image1.png"),
    featured: false,
    sizes: defaultSizes,
  },
  {
    id: "future-rider",
    name: "Future Rider",
    description: "Design retrô com tecnologia moderna.",
    category: "Feminino",
    price: 499.9,
    image: require("../assets/product-image3.png"),
    featured: false,
    sizes: defaultSizes,
  },
];

// Categorias padrão do menu (hambúrguer) e do filtro de Lançamentos.
export const categories = ["Masculino", "Feminino", "Unissex"];
