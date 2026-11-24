// A URL da API é definida antes de carregar o módulo (resolveApiUrl roda na importação).
process.env.EXPO_PUBLIC_API_URL = "http://api.teste:3000/";

const { ApiError, api, setAuthToken, setUnauthorizedHandler } = require("../api");

const jsonResponse = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

beforeEach(() => {
  global.fetch = jest.fn();
  setAuthToken(null);
  setUnauthorizedHandler(null);
});

describe("api", () => {
  it("monta a URL sem barra duplicada, com query e ignora filtros vazios", async () => {
    global.fetch.mockResolvedValue(jsonResponse(200, []));
    await api.listProducts({ categoria: "Feminino", busca: "", ordem: undefined, selo: "novo" });

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe("http://api.teste:3000/produtos?categoria=Feminino&selo=novo");
    expect(options.method).toBe("GET");
    expect(options.body).toBeUndefined();
    expect(options.headers.Authorization).toBeUndefined();
  });

  it("envia JSON e o token de autenticação", async () => {
    global.fetch.mockResolvedValue(jsonResponse(201, { orderId: "SW-000001" }));
    setAuthToken("meu-token");

    const result = await api.createOrder({ items: [{ productId: 1, size: 42, quantity: 1 }] });

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe("http://api.teste:3000/pedidos");
    expect(options.method).toBe("POST");
    expect(options.headers).toMatchObject({ "Content-Type": "application/json", Authorization: "Bearer meu-token" });
    expect(JSON.parse(options.body)).toEqual({ items: [{ productId: 1, size: 42, quantity: 1 }] });
    expect(result).toEqual({ orderId: "SW-000001" });
  });

  it("devolve null em respostas 204", async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 204, json: async () => { throw new Error("sem corpo"); } });
    await expect(api.deleteProduct(3)).resolves.toBeNull();
  });

  it("converte erro da API em ApiError com a mensagem em português", async () => {
    global.fetch.mockResolvedValue(jsonResponse(404, { error: "Cupom não encontrado" }));
    await expect(api.getCoupon("XYZ")).rejects.toMatchObject({ message: "Cupom não encontrado", status: 404 });
    await expect(api.getCoupon("XYZ")).rejects.toBeInstanceOf(ApiError);
  });

  it("usa mensagem padrão quando o erro não vem em JSON", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 500, json: async () => { throw new Error("html"); } });
    await expect(api.me()).rejects.toMatchObject({ status: 500, message: expect.any(String) });
  });

  it("avisa que a API está offline quando o fetch falha", async () => {
    global.fetch.mockRejectedValue(new TypeError("Network request failed"));
    await expect(api.listCategories()).rejects.toMatchObject({ status: 0 });
  });

  it("chama o handler de sessão expirada em 401 autenticado", async () => {
    const onUnauthorized = jest.fn();
    setUnauthorizedHandler(onUnauthorized);
    setAuthToken("expirado");
    global.fetch.mockResolvedValue(jsonResponse(401, { error: "Sessão expirada." }));

    await expect(api.me()).rejects.toMatchObject({ status: 401 });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("401 sem token (login errado) não dispara o handler", async () => {
    const onUnauthorized = jest.fn();
    setUnauthorizedHandler(onUnauthorized);
    global.fetch.mockResolvedValue(jsonResponse(401, { error: "E-mail ou senha inválidos." }));

    await expect(api.login("a@b.com", "x")).rejects.toMatchObject({ message: "E-mail ou senha inválidos." });
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
