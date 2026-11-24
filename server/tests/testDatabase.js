// Banco usado nos testes: separado do de desenvolvimento, para o `db:setup` dos testes nunca apagar seus dados.
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || "postgres://stylewalk:stylewalk@localhost:5432/stylewalk_test";
const TEST_JWT_SECRET = "segredo-de-teste";

module.exports = { TEST_DATABASE_URL, TEST_JWT_SECRET };
