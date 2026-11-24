// O Mercado Pago é substituído por um dublê: os testes não chamam a API externa.
jest.mock("../../src/services/mercadopago.service");

const mercadoPago = require("../../src/services/mercadopago.service");
const { address, api, bearer, closeDatabase, db, loginAdmin, loginCustomer } = require("./helpers");

afterAll(closeDatabase);

let customer;
let product;

beforeAll(async () => {
  customer = await loginCustomer();
  [product] = (await api().get("/produtos").query({ busca: "Court Clean" })).body; // R$ 349,90
});

beforeEach(() => {
  jest.resetAllMocks();
  mercadoPago.createPreference.mockResolvedValue({ id: "pref-teste", initPoint: "https://mp.test/init", sandboxInitPoint: "https://mp.test/sandbox" });
});

const orderBody = (overrides = {}) => ({
  items: [{ productId: product.id, size: 42, quantity: 2, price: 0.01, name: "Preço forjado" }],
  address,
  ...overrides,
});

const findOrder = async (pedidoId) => (await db.query("SELECT * FROM pedidos WHERE id = $1", [pedidoId])).rows[0];

describe("GET /cupons/:codigo", () => {
  it("devolve o cupom sem diferenciar maiúsculas", async () => {
    const response = await api().get("/cupons/style20");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ codigo: "STYLE20", percentual: 20, ativo: true });
  });

  it("devolve 404 para cupom inexistente", async () => {
    const response = await api().get("/cupons/NAOEXISTE");
    expect(response.status).toBe(404);
    expect(response.body.error).toMatch(/não encontrado/);
  });
});

describe("POST /pedidos", () => {
  it("exige login", async () => {
    const response = await api().post("/pedidos").send(orderBody());
    expect(response.status).toBe(401);
  });

  it("cria o pedido com o preço do banco e devolve o link do Mercado Pago", async () => {
    const response = await api().post("/pedidos").set(bearer(customer)).send(orderBody());

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      total: 699.8,
      init_point: "https://mp.test/init",
      sandbox_init_point: "https://mp.test/sandbox",
    });
    expect(response.body.orderId).toBe(`SW-${String(response.body.pedidoId).padStart(6, "0")}`);

    const order = await findOrder(response.body.pedidoId);
    expect(order).toMatchObject({ status: "pending", subtotal: 699.8, desconto: 0, total: 699.8, mp_preference_id: "pref-teste", entrega_uf: "SP" });
    const { rows: items } = await db.query("SELECT * FROM itens_pedido WHERE pedido_id = $1", [order.id]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ produto_id: product.id, tamanho: 42, quantidade: 2, preco_unitario: 349.9 });

    expect(mercadoPago.createPreference).toHaveBeenCalledWith({
      orderId: order.id,
      items: [expect.objectContaining({ name: product.name, quantity: 2, unitPrice: 349.9 })],
    });
  });

  it("aplica o cupom no total gravado", async () => {
    const response = await api().post("/pedidos").set(bearer(customer)).send(orderBody({ couponCode: "bemvindo10" }));
    expect(response.status).toBe(201);
    expect(response.body.total).toBe(629.82);
    expect(await findOrder(response.body.pedidoId)).toMatchObject({ subtotal: 699.8, desconto: 69.98, total: 629.82, cupom_codigo: "BEMVINDO10" });
  });

  it("recusa cupom inválido, carrinho vazio, produto inexistente e tamanho indisponível", async () => {
    const send = (body) => api().post("/pedidos").set(bearer(customer)).send(body);

    expect((await send(orderBody({ couponCode: "NAOEXISTE" }))).body.error).toMatch(/Cupom inválido/);
    expect((await send(orderBody({ items: [] }))).body.error).toMatch(/Carrinho vazio/);
    expect((await send(orderBody({ items: [{ productId: 999999, size: 42, quantity: 1 }] }))).status).toBe(400);
    expect((await send(orderBody({ items: [{ productId: product.id, size: 20, quantity: 1 }] }))).body.error).toMatch(/Tamanho 20/);
    expect((await send(orderBody({ address: { ...address, city: "" } }))).status).toBe(400);
    expect(mercadoPago.createPreference).not.toHaveBeenCalled();
  });

  it("devolve 502 e mantém o pedido pendente se o Mercado Pago falhar", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mercadoPago.createPreference.mockRejectedValue(new Error("token inválido"));
    const before = (await db.query("SELECT count(*)::int AS total FROM pedidos")).rows[0].total;

    const response = await api().post("/pedidos").set(bearer(customer)).send(orderBody());
    expect(response.status).toBe(502);
    expect(response.body.error).toMatch(/Mercado Pago/);
    const after = (await db.query("SELECT count(*)::int AS total FROM pedidos")).rows[0].total;
    expect(after).toBe(before + 1);
    console.error.mockRestore();
  });
});

describe("POST /webhooks/mercadopago", () => {
  it("atualiza o status do pedido quando o pagamento é aprovado", async () => {
    const created = await api().post("/pedidos").set(bearer(customer)).send(orderBody());
    mercadoPago.getPayment.mockResolvedValue({ external_reference: String(created.body.pedidoId), status: "approved" });

    const response = await api().post("/webhooks/mercadopago").send({ data: { id: "123456" } });
    expect(response.status).toBe(200);
    expect(await findOrder(created.body.pedidoId)).toMatchObject({ status: "approved", mp_payment_id: "123456" });
  });

  it("responde 200 mesmo sem pagamento ou quando a consulta falha", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect((await api().post("/webhooks/mercadopago").send({})).status).toBe(200);
    mercadoPago.getPayment.mockRejectedValue(new Error("fora do ar"));
    expect((await api().post("/webhooks/mercadopago").send({ data: { id: "1" } })).status).toBe(200);
    console.error.mockRestore();
  });
});

describe("GET /relatorios/export", () => {
  it("é restrito ao administrador", async () => {
    expect((await api().get("/relatorios/export")).status).toBe(401);
    expect((await api().get("/relatorios/export").set(bearer(customer))).status).toBe(403);
  });

  it("devolve o JSON do dashboard com o histórico do seed", async () => {
    const admin = await loginAdmin();
    const response = await api().get("/relatorios/export").set(bearer(admin));

    expect(response.status).toBe(200);
    expect(Object.keys(response.body)).toEqual(["gerado_em", "categorias", "produtos", "pedidos", "itens_pedido"]);
    expect(response.body.categorias.length).toBeGreaterThanOrEqual(3);
    expect(response.body.produtos.length).toBeGreaterThanOrEqual(9);
    expect(response.body.pedidos.length).toBeGreaterThanOrEqual(60);
    expect(response.body.pedidos[0]).toMatchObject({
      id: expect.any(Number), status: expect.any(String), total: expect.any(Number), entrega_uf: expect.any(String), criado_em: expect.any(String),
    });
    const statuses = new Set(response.body.pedidos.map((order) => order.status));
    expect(statuses.has("approved")).toBe(true);
    const orderIds = new Set(response.body.pedidos.map((order) => order.id));
    expect(response.body.itens_pedido.every((item) => orderIds.has(item.pedido_id))).toBe(true);
  });
});
