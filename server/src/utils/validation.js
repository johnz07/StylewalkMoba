// Validações puras (sem banco), reaproveitadas pelos services e testadas isoladamente.
const HttpError = require("./httpError");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 4;

const text = (value) => (typeof value === "string" ? value.trim() : "");
const digits = (value) => text(value).replace(/\D/g, "");

function isValidEmail(email) {
  return emailPattern.test(email);
}

// Aceita "DD/MM/AAAA" (com ou sem espaços) ou "AAAA-MM-DD"; devolve "AAAA-MM-DD" ou null se vazio.
function parseBirthDate(value) {
  const raw = text(value).replace(/\s/g, "");
  if (!raw) return null;
  const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/) || raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new HttpError(400, "Data de nascimento inválida.");
  const [day, month, year] = raw.includes("/") ? [match[1], match[2], match[3]] : [match[3], match[2], match[1]];
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const isRealDate = date.getUTCFullYear() === Number(year) && date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day);
  if (!isRealDate || date > new Date()) throw new HttpError(400, "Data de nascimento inválida.");
  return `${year}-${month}-${day}`;
}

function normalizeAddress(address = {}) {
  return {
    zipCode: text(address.zipCode),
    street: text(address.street),
    number: text(address.number),
    complement: text(address.complement),
    district: text(address.district),
    city: text(address.city),
    state: text(address.state).toUpperCase().slice(0, 2),
  };
}

// Dados de cadastro: nome, e-mail e senha obrigatórios; o resto é opcional.
function validateRegistration(data = {}) {
  const user = {
    firstName: text(data.firstName),
    lastName: text(data.lastName),
    email: text(data.email).toLowerCase(),
    password: typeof data.password === "string" ? data.password : "",
    cpf: digits(data.cpf) || null,
    phone: digits(data.phone) || null,
    birthDate: parseBirthDate(data.birthDate),
    address: normalizeAddress(data.address),
  };
  if (!user.firstName || !user.email || !user.password) throw new HttpError(400, "Preencha nome, e-mail e senha.");
  if (!isValidEmail(user.email)) throw new HttpError(400, "Digite um e-mail válido.");
  if (user.password.length < MIN_PASSWORD_LENGTH) throw new HttpError(400, `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
  if (user.cpf && user.cpf.length !== 11) throw new HttpError(400, "CPF deve ter 11 dígitos.");
  return user;
}

// Dados de produto enviados pelo admin (criar e alterar).
function validateProduct(data = {}) {
  const price = typeof data.price === "string" ? Number(data.price.replace(",", ".")) : data.price;
  const product = {
    name: text(data.name),
    description: text(data.description),
    price,
    categoryId: data.categoryId === undefined || data.categoryId === null || data.categoryId === "" ? null : Number(data.categoryId),
    imageUrl: text(data.imageUrl) || null,
    featuredImageUrl: text(data.featuredImageUrl) || null,
    featured: data.featured === true,
    sizes: data.sizes === undefined ? [37, 38, 39, 40, 41, 42, 43, 44] : data.sizes,
  };
  if (!product.name) throw new HttpError(400, "Informe o nome do produto.");
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) throw new HttpError(400, "Informe um preço válido.");
  product.price = Math.round(price * 100) / 100;
  if (product.categoryId !== null && !Number.isInteger(product.categoryId)) throw new HttpError(400, "Categoria inválida.");
  const validSizes = Array.isArray(product.sizes) && product.sizes.length > 0 && product.sizes.every((size) => Number.isInteger(size) && size > 0);
  if (!validSizes) throw new HttpError(400, "Informe ao menos um tamanho válido.");
  product.sizes = [...new Set(product.sizes)].sort((a, b) => a - b);
  return product;
}

// IDs de rota: inteiros positivos; qualquer outra coisa é tratada como "não encontrado".
function parseId(value, notFoundMessage) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(404, notFoundMessage);
  return id;
}

module.exports = { isValidEmail, parseBirthDate, validateRegistration, validateProduct, parseId, MIN_PASSWORD_LENGTH };
