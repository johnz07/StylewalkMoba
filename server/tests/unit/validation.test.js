const HttpError = require("../../src/utils/httpError");
const {
  isValidEmail, parseBirthDate, parseId, validateOrder, validateProduct, validateRegistration,
} = require("../../src/utils/validation");

const expectHttpError = (fn, status, message) => {
  let error;
  try {
    fn();
  } catch (caught) {
    error = caught;
  }
  expect(error).toBeInstanceOf(HttpError);
  expect(error.status).toBe(status);
  if (message) expect(error.message).toMatch(message);
};

describe("isValidEmail", () => {
  it.each(["a@b.com", "nome.sobrenome@dominio.com.br"])("aceita %s", (email) => expect(isValidEmail(email)).toBe(true));
  it.each(["", "sem-arroba", "a@b", "a b@c.com"])("recusa %j", (email) => expect(isValidEmail(email)).toBe(false));
});

describe("parseBirthDate", () => {
  it("converte DD/MM/AAAA para AAAA-MM-DD", () => expect(parseBirthDate("25/12/1999")).toBe("1999-12-25"));
  it("mantém AAAA-MM-DD", () => expect(parseBirthDate("1999-12-25")).toBe("1999-12-25"));
  it("devolve null quando vazio", () => expect(parseBirthDate("  ")).toBeNull());
  it("recusa data inexistente", () => expectHttpError(() => parseBirthDate("31/02/2000"), 400, /inválida/));
  it("recusa data no futuro", () => expectHttpError(() => parseBirthDate("01/01/2999"), 400));
  it("recusa formato desconhecido", () => expectHttpError(() => parseBirthDate("2000/01/01"), 400));
});

describe("parseId", () => {
  it("aceita inteiro positivo", () => expect(parseId("7", "x")).toBe(7));
  it.each(["0", "-1", "1.5", "abc", undefined])("trata %j como não encontrado", (value) => {
    expectHttpError(() => parseId(value, "Não achei"), 404, "Não achei");
  });
});

describe("validateRegistration", () => {
  const valid = { firstName: " Ana ", lastName: "Silva", email: " ANA@Teste.com ", password: "1234", cpf: "123.456.789-09", phone: "(11) 91234-5678" };

  it("normaliza os campos", () => {
    const user = validateRegistration(valid);
    expect(user).toMatchObject({ firstName: "Ana", email: "ana@teste.com", cpf: "12345678909", phone: "11912345678", birthDate: null });
  });
  it("normaliza o endereço (UF em maiúsculas, 2 letras)", () => {
    const user = validateRegistration({ ...valid, address: { state: "sp-x", city: " Santos " } });
    expect(user.address).toMatchObject({ state: "SP", city: "Santos" });
  });
  it("exige nome, e-mail e senha", () => {
    expectHttpError(() => validateRegistration({ ...valid, firstName: "" }), 400, /Preencha/);
    expectHttpError(() => validateRegistration({ ...valid, email: "" }), 400, /Preencha/);
    expectHttpError(() => validateRegistration({ ...valid, password: "" }), 400, /Preencha/);
  });
  it("recusa e-mail inválido, senha curta e CPF incompleto", () => {
    expectHttpError(() => validateRegistration({ ...valid, email: "ruim" }), 400, /e-mail válido/);
    expectHttpError(() => validateRegistration({ ...valid, password: "123" }), 400, /pelo menos/);
    expectHttpError(() => validateRegistration({ ...valid, cpf: "123" }), 400, /CPF/);
  });
});

describe("validateProduct", () => {
  const valid = { name: " Tênis X ", price: "199,90", categoryId: "2", badge: "novo", featured: true, sizes: [42, 40, 40] };

  it("normaliza preço, categoria e tamanhos", () => {
    expect(validateProduct(valid)).toMatchObject({ name: "Tênis X", price: 199.9, categoryId: 2, badge: "novo", featured: true, sizes: [40, 42] });
  });
  it("usa tamanhos padrão e categoria nula quando omitidos", () => {
    const product = validateProduct({ name: "A", price: 10 });
    expect(product.categoryId).toBeNull();
    expect(product.sizes).toEqual([37, 38, 39, 40, 41, 42, 43, 44]);
  });
  it("arredonda o preço em centavos", () => expect(validateProduct({ name: "A", price: 10.456 }).price).toBe(10.46));
  it("recusa nome vazio, preço inválido, selo inválido e tamanhos inválidos", () => {
    expectHttpError(() => validateProduct({ ...valid, name: " " }), 400, /nome/);
    expectHttpError(() => validateProduct({ ...valid, price: -1 }), 400, /preço/);
    expectHttpError(() => validateProduct({ ...valid, price: "abc" }), 400, /preço/);
    expectHttpError(() => validateProduct({ ...valid, badge: "gratis" }), 400, /Selo/);
    expectHttpError(() => validateProduct({ ...valid, sizes: [] }), 400, /tamanho/);
    expectHttpError(() => validateProduct({ ...valid, sizes: [40.5] }), 400, /tamanho/);
    expectHttpError(() => validateProduct({ ...valid, categoryId: "x" }), 400, /Categoria/);
  });
});

describe("validateOrder", () => {
  const address = { zipCode: "01001-000", street: "Praça da Sé", number: "100", city: "São Paulo", state: "sp" };
  const valid = { items: [{ productId: "3", size: "42", quantity: 2, price: 1 }], couponCode: " style20 ", address };

  it("converte os itens e ignora o preço enviado pelo app", () => {
    const order = validateOrder(valid);
    expect(order.items).toEqual([{ productId: 3, size: 42, quantity: 2 }]);
    expect(order.couponCode).toBe("style20");
    expect(order.address.state).toBe("SP");
  });
  it("cupom é opcional", () => expect(validateOrder({ ...valid, couponCode: "" }).couponCode).toBeNull());
  it("recusa carrinho vazio ou ausente", () => {
    expectHttpError(() => validateOrder({ ...valid, items: [] }), 400, /vazio/);
    expectHttpError(() => validateOrder({}), 400, /vazio/);
  });
  it.each([
    [{ productId: 0, size: 42, quantity: 1 }],
    [{ productId: 1, size: 0, quantity: 1 }],
    [{ productId: 1, size: 42, quantity: 0 }],
    [{ productId: 1, size: 42, quantity: 1.5 }],
    [{ productId: 1, size: 42, quantity: 100 }],
    [{ productId: "abc", size: 42, quantity: 1 }],
  ])("recusa item inválido %j", (item) => expectHttpError(() => validateOrder({ ...valid, items: [item] }), 400, /inválidos/));
  it("exige CEP, endereço, número e cidade", () => {
    for (const field of ["zipCode", "street", "number", "city"]) {
      expectHttpError(() => validateOrder({ ...valid, address: { ...address, [field]: "" } }), 400, /Preencha/);
    }
  });
});
