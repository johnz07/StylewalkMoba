// Recria o banco do zero: aplica db/schema.sql e insere os dados iniciais (seed).
// Uso: npm run db:setup  (apaga todos os dados existentes!)
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { pool, withTransaction } = require("../src/config/db");

const categories = ["Masculino", "Feminino", "Unissex"];

// Mesmos produtos que o app tinha mockados em data/products.js.
const products = [
  {
    name: "UltraBoost Runner",
    description: "Conforto máximo para suas corridas diárias.",
    category: "Masculino",
    price: 899.9,
    image: "/images/product-image.png",
    featuredImage: "/images/image-container.png",
    featured: true,
  },
  {
    name: "Air Zoom Pegasus",
    description: "Leveza e resposta para treinos intensos.",
    category: "Feminino",
    price: 749.9,
    image: "/images/product-image2.png",
    featuredImage: "/images/image-container1.png",
    featured: true,
  },
  {
    name: "Classic Leather",
    description: "Estilo casual para o dia a dia.",
    category: "Unissex",
    price: 399.9,
    image: "/images/product-image1.png",
    featured: false,
  },
  {
    name: "Future Rider",
    description: "Design retrô com tecnologia moderna.",
    category: "Feminino",
    price: 499.9,
    image: "/images/product-image3.png",
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

async function seed(client) {
  const categoryIds = {};
  for (const name of categories) {
    const { rows } = await client.query("INSERT INTO categorias (nome) VALUES ($1) RETURNING id", [name]);
    categoryIds[name] = rows[0].id;
  }

  for (const product of products) {
    await client.query(
      `INSERT INTO produtos (nome, descricao, preco, categoria_id, imagem_url, imagem_destaque_url, destaque)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [product.name, product.description, product.price, categoryIds[product.category], product.image, product.featuredImage || null, product.featured],
    );
  }

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const { rows } = await client.query(
      "INSERT INTO usuarios (nome, sobrenome, email, senha_hash, perfil) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [user.firstName, user.lastName, user.email, passwordHash, user.role],
    );
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
}

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await withTransaction(async (client) => {
    await client.query(schema);
    await seed(client);
  });
  console.log("Banco recriado: schema aplicado e dados iniciais inseridos.");
}

main()
  .catch((error) => {
    console.error("Falha ao preparar o banco:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
