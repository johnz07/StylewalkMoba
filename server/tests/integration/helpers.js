const request = require("supertest");
const app = require("../../src/app");
const db = require("../../src/config/db");

const api = () => request(app);

async function login(email, password) {
  const response = await api().post("/auth/login").send({ email, password });
  if (response.status !== 200) throw new Error(`Login de ${email} falhou: ${response.status}`);
  return response.body.token;
}

const loginAdmin = () => login("admin@admin.com.br", "0000");
const loginCustomer = () => login("cliente@stylewalk.com.br", "1234");
const bearer = (token) => ({ Authorization: `Bearer ${token}` });

const address = { zipCode: "01001-000", street: "Praça da Sé", number: "100", complement: "", district: "Sé", city: "São Paulo", state: "SP" };

// Fecha o pool do pg para o Jest encerrar sem aviso de handle aberto.
const closeDatabase = () => db.pool.end();

module.exports = { api, login, loginAdmin, loginCustomer, bearer, address, closeDatabase, db };
