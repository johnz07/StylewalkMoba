const { expect, test } = require("@playwright/test");

const CUSTOMER = { email: "cliente@stylewalk.com.br", password: "1234" };
const ADMIN = { email: "admin@admin.com.br", password: "0000" };

// Erros de JavaScript e `console.error` no navegador (ex.: avisos do React) fazem o teste falhar.
const consoleErrors = new WeakMap();

// Cada teste começa com o navegador limpo (sem sessão nem carrinho salvos).
test.beforeEach(async ({ page }) => {
  const errors = [];
  consoleErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    // 4xx esperados (login errado, cupom inexistente) aparecem como "Failed to load resource".
    if (message.type() === "error" && !/Failed to load resource/.test(message.text())) errors.push(`console.error: ${message.text()}`);
  });
  await page.goto("/");
  await expect(page.getByLabel("Abrir sacola").last()).toBeVisible();
});

// O stack mantém as telas anteriores montadas (escondidas): considera só o texto visível.
const visibleText = (page, text) => page.getByText(text).filter({ visible: true }).first();

test.afterEach(async ({ page }) => {
  expect(consoleErrors.get(page)).toEqual([]);
});

async function login(page, { email, password }) {
  await page.getByLabel("Nome de usuário").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByLabel("Entrar na sua conta").click();
}

async function addProductToCart(page, productName, size = 42) {
  await page.getByLabel(productName, { exact: true }).first().click();
  await page.getByLabel(`Tamanho ${size}`).click();
  await page.getByLabel("ADICIONAR AO CARRINHO").click();
  await page.getByLabel("Abrir sacola").last().click();
  await expect(visibleText(page, "Seu carrinho")).toBeVisible();
}

test.describe("vitrine", () => {
  test("mostra os produtos cadastrados na API", async ({ page }) => {
    await expect(page.getByLabel("UltraBoost Runner", { exact: true }).first()).toBeVisible();
    await expect(page.getByLabel("Air Zoom Pegasus", { exact: true }).first()).toBeVisible();
  });

  test("abre o detalhe do produto com preço e tamanhos", async ({ page }) => {
    await page.getByLabel("Velocity Pro", { exact: true }).first().click();
    await expect(visibleText(page, "Velocity Pro")).toBeVisible();
    await expect(visibleText(page, /1\.499,90/)).toBeVisible();
    await expect(page.getByLabel("Tamanho 40")).toBeVisible();
  });
});

test.describe("carrinho", () => {
  test("adiciona o produto e aplica um cupom real da API", async ({ page }) => {
    await addProductToCart(page, "Court Clean");
    await expect(visibleText(page, /349,90/)).toBeVisible();

    await page.getByLabel("Código do cupom").fill("style20");
    await page.getByLabel("Aplicar cupom").click();

    await expect(visibleText(page, "Cupom STYLE20 de 20% aplicado com sucesso!")).toBeVisible();
    await expect(visibleText(page, /279,92/)).toBeVisible(); // 349,90 - 20%
  });

  test("recusa cupom inexistente", async ({ page }) => {
    await addProductToCart(page, "Court Clean");
    await page.getByLabel("Código do cupom").fill("NAOEXISTE");
    await page.getByLabel("Aplicar cupom").click();
    await expect(visibleText(page, "Cupom inválido ou expirado.")).toBeVisible();
  });

  test("mantém o carrinho depois de recarregar a página", async ({ page }) => {
    await addProductToCart(page, "Court Clean");
    await page.reload();
    await page.getByLabel("Abrir sacola").last().click();
    await expect(visibleText(page, /Court Clean/)).toBeVisible();
    await expect(visibleText(page, "Você tem 1 item na sua sacola")).toBeVisible();
  });
});

test.describe("login e checkout", () => {
  test("finalizar compra sem sessão leva ao login e recusa senha errada", async ({ page }) => {
    await addProductToCart(page, "Court Clean");
    await page.getByLabel("Finalizar compra").click();

    await expect(visibleText(page, "Bem-vindo")).toBeVisible();
    await login(page, { email: CUSTOMER.email, password: "senha-errada" });
    await expect(visibleText(page, "E-mail ou senha inválidos.")).toBeVisible();
  });

  test("compra completa: carrinho, login, endereço do cadastro e pedido confirmado", async ({ page }) => {
    // O Mercado Pago é externo: a criação do pedido é simulada (a API real é coberta nos testes de integração).
    let orderRequest;
    await page.route("**/pedidos", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      orderRequest = route.request().postDataJSON();
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ orderId: "SW-000123", pedidoId: 123, total: 279.92 }),
      });
    });

    await addProductToCart(page, "Court Clean", 41);
    await page.getByLabel("Código do cupom").fill("STYLE20");
    await page.getByLabel("Aplicar cupom").click();
    await expect(visibleText(page, "Cupom STYLE20 de 20% aplicado com sucesso!")).toBeVisible();
    await page.getByLabel("Finalizar compra").click();

    await login(page, CUSTOMER);

    // Checkout com o endereço salvo no cadastro
    await expect(visibleText(page, "Confirmar pedido")).toBeVisible();
    await expect(page.getByLabel("Endereço (Rua, Avenida)")).toHaveValue("Praça da Sé");
    await expect(visibleText(page, "1x Court Clean (41)")).toBeVisible();
    await page.getByLabel("Confirmar pedido").click();

    await expect(visibleText(page, "Pedido confirmado!")).toBeVisible();
    await expect(visibleText(page, /SW-000123/)).toBeVisible();

    expect(orderRequest.couponCode).toBe("STYLE20");
    expect(orderRequest.items).toEqual([expect.objectContaining({ size: 41, quantity: 1 })]);
    expect(orderRequest.address).toMatchObject({ city: "São Paulo", state: "SP" });

    // O carrinho é esvaziado depois de confirmar
    await page.getByLabel("Voltar para a loja").click();
    await page.getByLabel("Abrir sacola").last().click();
    await expect(visibleText(page, "Você tem 0 itens na sua sacola")).toBeVisible();
  });

  test("checkout exige endereço completo", async ({ page }) => {
    await addProductToCart(page, "Court Clean");
    await page.getByLabel("Finalizar compra").click();
    await login(page, CUSTOMER);

    await page.getByLabel("Número", { exact: true }).fill("");
    await page.getByLabel("Confirmar pedido").click();
    await expect(visibleText(page, "Preencha CEP, endereço, número e cidade.")).toBeVisible();
    await expect(visibleText(page, "Pedido confirmado!")).toHaveCount(0);
  });
});

test.describe("administrador", () => {
  async function openAdminPanel(page) {
    await page.getByLabel("Abrir conta").last().click();
    await page.getByText("Entrar", { exact: true }).click();
    await login(page, ADMIN);
    await expect(visibleText(page, "Exportar JSON")).toBeVisible();
  }

  test("entra direto no painel e baixa o relatório JSON do dashboard", async ({ page }) => {
    await openAdminPanel(page);

    const downloadPromise = page.waitForEvent("download");
    await page.getByText("Exportar JSON").click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^stylewalk-relatorio-\d+\.json$/);
    const report = JSON.parse(require("fs").readFileSync(await download.path(), "utf8"));
    expect(Object.keys(report)).toEqual(["gerado_em", "categorias", "produtos", "pedidos", "itens_pedido"]);
    expect(report.produtos.length).toBeGreaterThanOrEqual(9);
    expect(report.pedidos.length).toBeGreaterThanOrEqual(60);
    await expect(visibleText(page, "Relatório baixado com sucesso!")).toBeVisible();
  });

  test("cliente comum não vê o painel admin", async ({ page }) => {
    await page.getByLabel("Abrir conta").last().click();
    await page.getByText("Entrar", { exact: true }).click();
    await login(page, CUSTOMER);

    await page.getByLabel("Abrir conta").last().click();
    await expect(visibleText(page, CUSTOMER.email)).toBeVisible();
    await expect(visibleText(page, "Painel admin")).toHaveCount(0);
  });
});
