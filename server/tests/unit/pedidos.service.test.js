jest.mock("../../src/models/cupom.model");
jest.mock("../../src/models/pedido.model");
jest.mock("../../src/models/produto.model");
jest.mock("../../src/services/mercadopago.service");

const cupomModel = require("../../src/models/cupom.model");
const pedidoModel = require("../../src/models/pedido.model");
const produtoModel = require("../../src/models/produto.model");
const mercadoPago = require("../../src/services/mercadopago.service");
const pedidosService = require("../../src/services/pedidos.service");

describe("calculateTotals", () => {
  const lines = [
    { unitPrice: 899.9, quantity: 1 },
    { unitPrice: 349.9, quantity: 2 },
  ];

  it("soma subtotal sem desconto", () => {
    expect(pedidosService.calculateTotals(lines)).toEqual({ subtotal: 1599.7, discount: 0, total: 1599.7 });
  });
  it("aplica o percentual do cupom", () => {
    expect(pedidosService.calculateTotals(lines, 20)).toEqual({ subtotal: 1599.7, discount: 319.94, total: 1279.76 });
  });
  it("evita erro de ponto flutuante (0.1 + 0.2)", () => {
    expect(pedidosService.calculateTotals([{ unitPrice: 0.1, quantity: 1 }, { unitPrice: 0.2, quantity: 1 }]).total).toBe(0.3);
  });
  it("arredonda o desconto em centavos", () => {
    expect(pedidosService.calculateTotals([{ unitPrice: 10.01, quantity: 1 }], 10)).toEqual({ subtotal: 10.01, discount: 1, total: 9.01 });
  });
  it("cupom de 100% zera o total", () => {
    expect(pedidosService.calculateTotals(lines, 100).total).toBe(0);
  });
});

describe("mapPaymentStatus", () => {
  it.each([
    ["approved", "approved"],
    ["rejected", "rejected"],
    ["cancelled", "rejected"],
    ["pending", "pending"],
    ["in_process", "pending"],
    [undefined, "pending"],
  ])("%s -> %s", (input, expected) => expect(pedidosService.mapPaymentStatus(input)).toBe(expected));
});

describe("create", () => {
  const address = { zipCode: "01001-000", street: "Praça da Sé", number: "100", city: "São Paulo", state: "SP" };
  const product = { id: 5, name: "Court Clean", price: 349.9, sizes: [40, 41, 42] };
  const body = (overrides = {}) => ({ items: [{ productId: 5, size: 42, quantity: 2, price: 0.01 }], address, ...overrides });

  beforeEach(() => {
    jest.resetAllMocks();
    produtoModel.findById.mockResolvedValue(product);
    pedidoModel.create.mockResolvedValue(12);
    pedidoModel.setPreferenceId.mockResolvedValue();
    mercadoPago.createPreference.mockResolvedValue({ id: "pref-1", initPoint: "https://mp/init", sandboxInitPoint: "https://mp/sandbox" });
  });

  it("usa o preço do banco, ignorando o enviado pelo app", async () => {
    const result = await pedidosService.create(9, body());

    expect(pedidoModel.create).toHaveBeenCalledWith(expect.objectContaining({
      userId: 9,
      totals: { subtotal: 699.8, discount: 0, total: 699.8 },
      couponCode: null,
      lines: [{ productId: 5, name: "Court Clean", size: 42, quantity: 2, unitPrice: 349.9 }],
    }));
    expect(result).toEqual({
      orderId: "SW-000012",
      pedidoId: 12,
      total: 699.8,
      init_point: "https://mp/init",
      sandbox_init_point: "https://mp/sandbox",
    });
    expect(pedidoModel.setPreferenceId).toHaveBeenCalledWith(12, "pref-1");
  });

  it("aplica cupom ativo (código gravado como no banco)", async () => {
    cupomModel.findByCode.mockResolvedValue({ codigo: "STYLE20", percentual: 20, ativo: true });
    const result = await pedidosService.create(9, body({ couponCode: "style20" }));

    expect(result.total).toBe(559.84);
    expect(pedidoModel.create).toHaveBeenCalledWith(expect.objectContaining({ couponCode: "STYLE20", totals: { subtotal: 699.8, discount: 139.96, total: 559.84 } }));
  });

  it.each([null, { codigo: "OLD", percentual: 10, ativo: false }])("recusa cupom inexistente ou inativo (%j)", async (coupon) => {
    cupomModel.findByCode.mockResolvedValue(coupon);
    await expect(pedidosService.create(9, body({ couponCode: "OLD" }))).rejects.toMatchObject({ status: 400, message: "Cupom inválido ou inativo." });
    expect(pedidoModel.create).not.toHaveBeenCalled();
  });

  it("recusa produto que não existe mais", async () => {
    produtoModel.findById.mockResolvedValue(null);
    await expect(pedidosService.create(9, body())).rejects.toMatchObject({ status: 400, message: expect.stringMatching(/não está mais disponível/) });
    expect(pedidoModel.create).not.toHaveBeenCalled();
  });

  it("recusa tamanho que o produto não tem", async () => {
    await expect(pedidosService.create(9, body({ items: [{ productId: 5, size: 30, quantity: 1 }] }))).rejects.toMatchObject({ status: 400, message: expect.stringMatching(/Tamanho 30/) });
  });

  it("devolve 502 se o Mercado Pago falhar (pedido fica pendente)", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mercadoPago.createPreference.mockRejectedValue(new Error("invalid token"));

    await expect(pedidosService.create(9, body())).rejects.toMatchObject({ status: 502 });
    expect(pedidoModel.setPreferenceId).not.toHaveBeenCalled();
    console.error.mockRestore();
  });
});

describe("syncPayment", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    pedidoModel.updatePayment.mockResolvedValue(true);
  });

  it("atualiza o pedido de acordo com o pagamento", async () => {
    mercadoPago.getPayment.mockResolvedValue({ external_reference: "12", status: "approved" });
    await expect(pedidosService.syncPayment("999")).resolves.toBe(true);
    expect(pedidoModel.updatePayment).toHaveBeenCalledWith(12, "approved", "999");
  });
  it("ignora pagamento sem external_reference válido", async () => {
    mercadoPago.getPayment.mockResolvedValue({ external_reference: "abc", status: "approved" });
    await expect(pedidosService.syncPayment("999")).resolves.toBe(false);
    expect(pedidoModel.updatePayment).not.toHaveBeenCalled();
  });
});
