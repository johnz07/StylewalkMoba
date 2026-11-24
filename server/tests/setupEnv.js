// Roda antes de cada arquivo de teste: aponta a API para o banco de teste (sobrepõe o server/.env).
const { TEST_DATABASE_URL, TEST_JWT_SECRET } = require("./testDatabase");

process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.DATABASE_SSL = "false";
process.env.JWT_SECRET = TEST_JWT_SECRET;
process.env.MP_ACCESS_TOKEN = "";
