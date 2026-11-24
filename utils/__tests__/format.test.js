import { formatPrice, parsePrice } from "../format";

// O Intl separa "R$" do valor com um espaço não separável; normaliza para comparar.
const normalize = (text) => text.replace(/\s/g, " ");

describe("formatPrice", () => {
  it("formata em reais no padrão brasileiro", () => {
    expect(normalize(formatPrice(1099.9))).toBe("R$ 1.099,90");
    expect(normalize(formatPrice(0))).toBe("R$ 0,00");
    expect(normalize(formatPrice(349.9))).toBe("R$ 349,90");
  });
});

describe("parsePrice", () => {
  it.each([
    ["R$ 1.099,90", 1099.9],
    ["499,9", 499.9],
    ["499.9", 499.9],
    ["1.000", 1],
    ["2.500,00", 2500],
    ["300", 300],
  ])("converte %j em %d", (text, expected) => expect(parsePrice(text)).toBe(expected));

  it("devolve 0 para texto sem número", () => {
    expect(parsePrice("")).toBe(0);
    expect(parsePrice("abc")).toBe(0);
    expect(parsePrice(undefined)).toBe(0);
  });
});
