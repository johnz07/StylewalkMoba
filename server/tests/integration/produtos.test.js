const { api, bearer, closeDatabase, loginAdmin, loginCustomer } = require("./helpers");

afterAll(closeDatabase);

describe("catálogo público", () => {
  it("GET /categorias lista as categorias do seed", async () => {
    const response = await api().get("/categorias");
    expect(response.status).toBe(200);
    expect(response.body.map((category) => category.name)).toEqual(expect.arrayContaining(["Masculino", "Feminino", "Unissex"]));
  });

  it("GET /produtos lista os 9 produtos com URL de imagem completa", async () => {
    const response = await api().get("/produtos");
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(9);
    expect(response.body[0]).toMatchObject({ id: expect.any(Number), name: expect.any(String), price: expect.any(Number) });
    expect(response.body[0].imageUrl).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/images\//);
  });

  it("filtra por categoria, selo e busca sem acento", async () => {
    const feminino = await api().get("/produtos").query({ categoria: "Feminino" });
    expect(feminino.body.length).toBeGreaterThan(0);
    expect(feminino.body.every((product) => product.category === "Feminino")).toBe(true);

    const exclusivos = await api().get("/produtos").query({ selo: "exclusivo" });
    expect(exclusivos.body.every((product) => product.badge === "exclusivo")).toBe(true);

    const busca = await api().get("/produtos").query({ busca: "pegasus" });
    expect(busca.body.map((product) => product.name)).toEqual(["Air Zoom Pegasus"]);
    const semAcento = await api().get("/produtos").query({ busca: "algodao nao existe" });
    expect(semAcento.body).toEqual([]);
  });

  it("ordena por preço", async () => {
    const asc = await api().get("/produtos").query({ ordem: "preco_asc" });
    const prices = asc.body.map((product) => product.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    const desc = await api().get("/produtos").query({ ordem: "preco_desc" });
    expect(desc.body.map((product) => product.price)).toEqual([...prices].reverse());
  });

  it("GET /produtos/:id devolve o produto ou 404", async () => {
    const [first] = (await api().get("/produtos")).body;
    const found = await api().get(`/produtos/${first.id}`);
    expect(found.status).toBe(200);
    expect(found.body.name).toBe(first.name);

    expect((await api().get("/produtos/999999")).status).toBe(404);
    expect((await api().get("/produtos/abc")).status).toBe(404);
  });
});

describe("CRUD de produtos (admin)", () => {
  const newProduct = { name: "Tênis de Teste", description: "Criado pelo teste", price: "259,90", badge: "novo", featured: false, sizes: [40, 41] };

  it("bloqueia quem não é admin", async () => {
    expect((await api().post("/produtos").send(newProduct)).status).toBe(401);
    const customer = await loginCustomer();
    const forbidden = await api().post("/produtos").set(bearer(customer)).send(newProduct);
    expect(forbidden.status).toBe(403);
  });

  it("cria, consulta, altera e exclui (exclusão lógica)", async () => {
    const admin = await loginAdmin();
    const [category] = (await api().get("/categorias")).body;

    const created = await api().post("/produtos").set(bearer(admin)).send({ ...newProduct, categoryId: category.id });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ name: "Tênis de Teste", price: 259.9, category: category.name, sizes: [40, 41] });
    expect(created.headers.location).toBe(`/produtos/${created.body.id}`);

    const updated = await api().put(`/produtos/${created.body.id}`).set(bearer(admin)).send({ ...newProduct, name: "Tênis Alterado", price: 300, categoryId: category.id });
    expect(updated.status).toBe(200);
    expect(updated.body).toMatchObject({ name: "Tênis Alterado", price: 300 });

    const removed = await api().delete(`/produtos/${created.body.id}`).set(bearer(admin));
    expect(removed.status).toBe(204);
    expect((await api().get(`/produtos/${created.body.id}`)).status).toBe(404);
    expect((await api().delete(`/produtos/${created.body.id}`).set(bearer(admin))).status).toBe(404);
  });

  it("valida os dados e a categoria", async () => {
    const admin = await loginAdmin();
    const semNome = await api().post("/produtos").set(bearer(admin)).send({ ...newProduct, name: "" });
    expect(semNome.status).toBe(400);
    const categoriaInvalida = await api().post("/produtos").set(bearer(admin)).send({ ...newProduct, categoryId: 99999 });
    expect(categoriaInvalida.status).toBe(400);
    expect(categoriaInvalida.body.error).toBe("Categoria inválida.");
    expect((await api().put("/produtos/999999").set(bearer(admin)).send(newProduct)).status).toBe(404);
  });
});
