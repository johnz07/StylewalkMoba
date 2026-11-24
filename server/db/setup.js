// Recria o banco do zero: aplica db/schema.sql e insere os dados iniciais (seed).
// Uso: npm run db:setup  (apaga todos os dados existentes!)
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { pool, withTransaction } = require("../src/config/db");

const categories = ["Masculino", "Feminino", "Unissex"];

// Mesmo catálogo do app (data/products.js). Cada produto tem uma única foto.
const products = [
  {
    name: "UltraBoost Runner",
    description: "Conforto máximo para suas corridas diárias.",
    category: "Masculino",
    price: 899.9,
    image: "/images/image-container.png",
    badge: "novo",
    featured: true,
  },
  {
    name: "Air Zoom Pegasus",
    description: "Leveza e resposta para treinos intensos.",
    category: "Feminino",
    price: 749.9,
    image: "/images/image-container1.png",
    badge: "novo",
    featured: true,
  },
  {
    name: "Velocity Pro",
    description: "Placa de carbono e espuma responsiva para bater recordes.",
    category: "Masculino",
    price: 1499.9,
    image: "/images/product-image.png",
    badge: "exclusivo",
    featured: true,
  },
  {
    name: "Rose Glide",
    description: "Amortecimento macio e visual delicado para o dia todo.",
    category: "Feminino",
    price: 649.9,
    image: "/images/product-image2.png",
    badge: "limitado",
    featured: true,
  },
  {
    name: "Neon Knit",
    description: "Cabedal em tricô respirável e cor vibrante.",
    category: "Feminino",
    price: 459.9,
    image: "/images/product-neon-knit.jpg",
    badge: "novo",
    featured: true,
  },
  {
    name: "Urban Trek",
    description: "Tecido técnico e solado firme para a rotina na cidade.",
    category: "Masculino",
    price: 579.9,
    image: "/images/product-urban-trek.jpg",
    badge: "novo",
    featured: true,
  },
  {
    name: "Court Clean",
    description: "Couro branco minimalista que combina com tudo.",
    category: "Unissex",
    price: 349.9,
    image: "/images/product-court-clean.jpg",
    badge: "exclusivo",
    featured: true,
  },
  {
    name: "Classic Leather",
    description: "Estilo casual para o dia a dia.",
    category: "Unissex",
    price: 399.9,
    image: "/images/product-image1.png",
    badge: null,
    featured: false,
  },
  {
    name: "Future Rider",
    description: "Design retrô com tecnologia moderna.",
    category: "Feminino",
    price: 499.9,
    image: "/images/product-image3.png",
    badge: "limitado",
    featured: false,
  },
];

const users = [
  { firstName: "Admin", lastName: "", email: "admin@admin.com.br", password: "0000", role: "admin" },
  {
    firstName: "Cliente",
    lastName: "Demo",
    email: "cliente@stylewalk.com.br",
    password: "1234",
    role: "customer",
    address: { zipCode: "01001-000", street: "Praça da Sé", number: "100", complement: "", district: "Sé", city: "São Paulo", state: "SP" },
  },
];

const coupons = [
  { code: "BEMVINDO10", percent: 10 },
  { code: "STYLE20", percent: 20 },
];

// Destinos dos pedidos fictícios (histórico para o dashboard ter dados).
const deliveryCities = [
  { zipCode: "01001-000", street: "Praça da Sé", district: "Sé", city: "São Paulo", state: "SP" },
  { zipCode: "20040-020", street: "Rua da Assembleia", district: "Centro", city: "Rio de Janeiro", state: "RJ" },
  { zipCode: "30130-010", street: "Avenida Afonso Pena", district: "Centro", city: "Belo Horizonte", state: "MG" },
  { zipCode: "80010-000", street: "Rua XV de Novembro", district: "Centro", city: "Curitiba", state: "PR" },
  { zipCode: "90010-000", street: "Rua dos Andradas", district: "Centro Histórico", city: "Porto Alegre", state: "RS" },
  { zipCode: "40020-000", street: "Avenida Sete de Setembro", district: "Centro", city: "Salvador", state: "BA" },
];

const SEED_ORDER_COUNT = 60;
const SEED_ORDER_DAYS = 180;

// Gerador pseudoaleatório com semente fixa: o histórico é sempre o mesmo a cada `db:setup`.
function createRandom(seed) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pedidos fictícios dos últimos meses, só para alimentar o dashboard de Análise de Dados.
async function seedOrders(client, customerId, productRows) {
  const random = createRandom(2026);
  const pick = (list) => list[Math.floor(random() * list.length)];
  const DAY_MS = 24 * 60 * 60 * 1000;

  for (let index = 0; index < SEED_ORDER_COUNT; index += 1) {
    const lines = Array.from({ length: 1 + Math.floor(random() * 3) }, () => {
      const product = pick(productRows);
      return { productId: product.id, size: 37 + Math.floor(random() * 8), quantity: 1 + Math.floor(random() * 2), unitPrice: Number(product.preco) };
    });
    const subtotalCents = lines.reduce((sum, line) => sum + Math.round(line.unitPrice * 100) * line.quantity, 0);
    const coupon = random() < 0.25 ? pick(coupons) : null;
    const discountCents = coupon ? Math.round((subtotalCents * coupon.percent) / 100) : 0;
    const roll = random();
    const status = roll < 0.75 ? "approved" : roll < 0.9 ? "pending" : "rejected";
    const city = pick(deliveryCities);
    const createdAt = new Date(Date.now() - Math.floor(random() * SEED_ORDER_DAYS * DAY_MS));

    const { rows } = await client.query(
      `INSERT INTO pedidos (
         usuario_id, status, subtotal, desconto, total, cupom_codigo, entrega_cep, entrega_logradouro, entrega_numero,
         entrega_bairro, entrega_cidade, entrega_uf, criado_em, atualizado_em
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)
       RETURNING id`,
      [
        customerId, status, subtotalCents / 100, discountCents / 100, (subtotalCents - discountCents) / 100, coupon ? coupon.code : null,
        city.zipCode, city.street, String(10 + Math.floor(random() * 990)), city.district, city.city, city.state, createdAt,
      ],
    );
    for (const line of lines) {
      await client.query(
        "INSERT INTO itens_pedido (pedido_id, produto_id, tamanho, quantidade, preco_unitario) VALUES ($1, $2, $3, $4, $5)",
        [rows[0].id, line.productId, line.size, line.quantity, line.unitPrice],
      );
    }
  }
}

async function seed(client) {
  const categoryIds = {};
  for (const name of categories) {
    const { rows } = await client.query("INSERT INTO categorias (nome) VALUES ($1) RETURNING id", [name]);
    categoryIds[name] = rows[0].id;
  }

  // Insere de trás para frente: a ordem "recentes" (id decrescente) fica igual à lista acima.
  for (const product of [...products].reverse()) {
    await client.query(
      `INSERT INTO produtos (nome, descricao, preco, categoria_id, imagem_url, selo, destaque)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [product.name, product.description, product.price, categoryIds[product.category], product.image, product.badge, product.featured],
    );
  }

  let customerId = null;
  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const { rows } = await client.query(
      "INSERT INTO usuarios (nome, sobrenome, email, senha_hash, perfil) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [user.firstName, user.lastName, user.email, passwordHash, user.role],
    );
    if (user.role === "customer") customerId = rows[0].id;
    if (user.address) {
      const { zipCode, street, number, complement, district, city, state } = user.address;
      await client.query(
        `INSERT INTO enderecos (usuario_id, cep, logradouro, numero, complemento, bairro, cidade, uf)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [rows[0].id, zipCode, street, number, complement, district, city, state],
      );
    }
  }

  for (const coupon of coupons) {
    await client.query("INSERT INTO cupons (codigo, percentual) VALUES ($1, $2)", [coupon.code, coupon.percent]);
  }

  const { rows: productRows } = await client.query("SELECT id, preco FROM produtos ORDER BY id");
  await seedOrders(client, customerId, productRows);
}

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await withTransaction(async (client) => {
    await client.query(schema);
    await seed(client);
  });
  console.log("Banco recriado: schema aplicado, dados iniciais e histórico de pedidos inseridos.");
}

main()
  .catch((error) => {
    console.error("Falha ao preparar o banco:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
