const { api, bearer, closeDatabase, loginAdmin } = require("./helpers");

afterAll(closeDatabase);

describe("GET /health", () => {
  it("confirma API e banco no ar", async () => {
    const response = await api().get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

describe("rota inexistente", () => {
  it("responde 404 no formato padrão", async () => {
    const response = await api().get("/nao-existe");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Rota não encontrada." });
  });
});

describe("POST /auth/register", () => {
  const email = `novo.${Date.now()}@teste.com`;
  const body = {
    firstName: "Maria", lastName: "Souza", email, password: "senha123", cpf: "123.456.789-09",
    phone: "(11) 91234-5678", birthDate: "10/05/1995",
    address: { zipCode: "01001-000", street: "Praça da Sé", number: "10", city: "São Paulo", state: "SP" },
  };

  it("cadastra o cliente e já devolve token e perfil (sem senha)", async () => {
    const response = await api().post("/auth/register").send(body);
    expect(response.status).toBe(201);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({ firstName: "Maria", email, role: "customer" });
    expect(JSON.stringify(response.body)).not.toMatch(/senha|password|hash/i);
  });

  it("recusa e-mail repetido com 409", async () => {
    const response = await api().post("/auth/register").send(body);
    expect(response.status).toBe(409);
    expect(response.body.error).toMatch(/já está cadastrado/);
  });

  it("recusa dados inválidos com 400", async () => {
    const response = await api().post("/auth/register").send({ ...body, email: "invalido", password: "1" });
    expect(response.status).toBe(400);
    expect(response.body.error).toEqual(expect.any(String));
  });

  it("recusa JSON malformado com 400", async () => {
    const response = await api().post("/auth/register").set("Content-Type", "application/json").send("{ruim");
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/JSON inválido/);
  });
});

describe("POST /auth/login e GET /auth/me", () => {
  it("entra com a conta do seed e consulta o próprio perfil", async () => {
    const login = await api().post("/auth/login").send({ email: " CLIENTE@stylewalk.com.br ", password: "1234" });
    expect(login.status).toBe(200);
    expect(login.body.user).toMatchObject({ email: "cliente@stylewalk.com.br", role: "customer" });

    const me = await api().get("/auth/me").set(bearer(login.body.token));
    expect(me.status).toBe(200);
    expect(me.body.email).toBe("cliente@stylewalk.com.br");
  });

  it("reconhece o administrador", async () => {
    const token = await loginAdmin();
    const me = await api().get("/auth/me").set(bearer(token));
    expect(me.body.role).toBe("admin");
  });

  it("recusa senha errada e usuário inexistente com a mesma mensagem", async () => {
    const wrongPassword = await api().post("/auth/login").send({ email: "cliente@stylewalk.com.br", password: "errada" });
    const unknown = await api().post("/auth/login").send({ email: "ninguem@teste.com", password: "1234" });
    expect(wrongPassword.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrongPassword.body).toEqual(unknown.body);
  });

  it("exige e-mail e senha", async () => {
    const response = await api().post("/auth/login").send({});
    expect(response.status).toBe(400);
  });

  it("/auth/me exige token válido", async () => {
    expect((await api().get("/auth/me")).status).toBe(401);
    expect((await api().get("/auth/me").set(bearer("token-falso"))).status).toBe(401);
  });
});
