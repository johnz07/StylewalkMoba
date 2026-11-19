// Fonte única de produtos (mock). Loja, carrinho e admin leem daqui via StoreContext.
// Cada produto tem UMA foto, usada no card e na tela de detalhes.
export const defaultSizes = [37, 38, 39, 40, 41, 42, 43, 44];

export const placeholderImage = require("../assets/Image-Placeholder.png");

// Selos exibidos no card e usados pelos atalhos da Home (Lançamento exclusivo, Novo, Limitado).
export const badges = ["exclusivo", "novo", "limitado"];

export const initialProducts = [
  {
    id: "ultraboost-runner",
    name: "UltraBoost Runner",
    description: "Conforto máximo para suas corridas diárias.",
    category: "Masculino",
    price: 899.9,
    image: require("../assets/image-container.png"),
    badge: "novo",
    featured: true,
    sizes: defaultSizes,
  },
  {
    id: "air-zoom-pegasus",
    name: "Air Zoom Pegasus",
    description: "Leveza e resposta para treinos intensos.",
    category: "Feminino",
    price: 749.9,
    image: require("../assets/image-container1.png"),
    badge: "novo",
    featured: true,
    sizes: defaultSizes,
  },
  {
    id: "velocity-pro",
    name: "Velocity Pro",
    description: "Placa de carbono e espuma responsiva para bater recordes.",
    category: "Masculino",
    price: 1499.9,
    image: require("../assets/product-image.png"),
    badge: "exclusivo",
    featured: true,
    sizes: defaultSizes,
  },
  {
    id: "rose-glide",
    name: "Rose Glide",
    description: "Amortecimento macio e visual delicado para o dia todo.",
    category: "Feminino",
    price: 649.9,
    image: require("../assets/product-image2.png"),
    badge: "limitado",
    featured: true,
    sizes: defaultSizes,
  },
  {
    id: "neon-knit",
    name: "Neon Knit",
    description: "Cabedal em tricô respirável e cor vibrante.",
    category: "Feminino",
    price: 459.9,
    image: require("../assets/product-neon-knit.jpg"),
    badge: "novo",
    featured: true,
    sizes: defaultSizes,
  },
  {
    id: "urban-trek",
    name: "Urban Trek",
    description: "Tecido técnico e solado firme para a rotina na cidade.",
    category: "Masculino",
    price: 579.9,
    image: require("../assets/product-urban-trek.jpg"),
    badge: "novo",
    featured: true,
    sizes: defaultSizes,
  },
  {
    id: "court-clean",
    name: "Court Clean",
    description: "Couro branco minimalista que combina com tudo.",
    category: "Unissex",
    price: 349.9,
    image: require("../assets/product-court-clean.jpg"),
    badge: "exclusivo",
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
    badge: null,
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
    badge: "limitado",
    featured: false,
    sizes: defaultSizes,
  },
];

// Categorias padrão do menu (hambúrguer) e do filtro de Lançamentos.
export const categories = ["Masculino", "Feminino", "Unissex"];
