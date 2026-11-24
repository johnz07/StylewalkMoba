import { finishAuth, goTo } from "../navigation";

const fakeNavigation = (routeNames) => ({
  navigate: jest.fn(),
  reset: jest.fn(),
  getState: () => ({ routes: routeNames.map((name) => ({ name })) }),
});

describe("goTo", () => {
  it("volta até a tela se ela já estiver na pilha", () => {
    const navigation = fakeNavigation([]);
    goTo(navigation, "Carrinho", { a: 1 });
    expect(navigation.navigate).toHaveBeenCalledWith("Carrinho", { a: 1 }, { pop: true });
  });
});

describe("finishAuth", () => {
  it("leva o admin direto para o painel", () => {
    const navigation = fakeNavigation(["Home", "Login"]);
    finishAuth(navigation, { role: "admin" });
    expect(navigation.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: "Admin" }] });
  });

  it("cliente volta para onde estava, sem Login e Cadastro na pilha", () => {
    const navigation = fakeNavigation(["Home", "Produto", "Login", "Cadastro"]);
    finishAuth(navigation, { role: "customer" });
    expect(navigation.reset).toHaveBeenCalledWith({ index: 1, routes: [{ name: "Home" }, { name: "Produto" }] });
  });

  it("segue para a tela que pediu login (ex.: Checkout)", () => {
    const navigation = fakeNavigation(["Home", "Carrinho", "Login"]);
    finishAuth(navigation, { role: "customer" }, "Checkout");
    expect(navigation.reset).toHaveBeenCalledWith({ index: 2, routes: [{ name: "Home" }, { name: "Carrinho" }, { name: "Checkout", params: undefined }] });
  });

  it("repassa os parâmetros da tela de destino (cupom aplicado no carrinho)", () => {
    const navigation = fakeNavigation(["Home", "Carrinho", "Login"]);
    const redirectParams = { discountPercent: 20, appliedCoupon: "STYLE20" };
    finishAuth(navigation, { role: "customer" }, "Checkout", redirectParams);
    expect(navigation.reset).toHaveBeenCalledWith({
      index: 2,
      routes: [{ name: "Home" }, { name: "Carrinho" }, { name: "Checkout", params: redirectParams }],
    });
  });

  it("cai na Home se a pilha ficar vazia", () => {
    const navigation = fakeNavigation(["Login"]);
    finishAuth(navigation, { role: "customer" });
    expect(navigation.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: "Home" }] });
  });
});
