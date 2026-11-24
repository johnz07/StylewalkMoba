import * as WebBrowser from "expo-web-browser";
import { fetchAddressByCEP, maskCEP, maskCPF, maskDate, maskPhone, openCorreiosCEP } from "../masks";

jest.mock("expo-web-browser", () => ({ openBrowserAsync: jest.fn() }));

describe("máscaras", () => {
  it.each([
    [maskCPF, "12345678909", "123.456.789-09"],
    [maskCPF, "123.456", "123.456"],
    [maskCPF, "123456789012345", "123.456.789-01"],
    [maskPhone, "11912345678", "(11) 91234-5678"],
    [maskPhone, "119", "(11) 9"],
    [maskCEP, "01001000", "01001-000"],
    [maskCEP, "01001", "01001"],
    [maskCEP, "01001-000999", "01001-000"],
    [maskDate, "25121999", "25/12/1999"],
    [maskDate, "2512", "25/12"],
  ])("%p aplica a máscara em %j -> %j", (mask, input, expected) => expect(mask(input)).toBe(expected));

  it.each([maskCPF, maskPhone, maskCEP, maskDate])("%p devolve vazio para valor vazio e ignora letras", (mask) => {
    expect(mask("")).toBe("");
    expect(mask(undefined)).toBe("");
    expect(mask("abc")).toBe("");
  });
});

describe("fetchAddressByCEP", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => console.error.mockRestore());

  it("consulta o ViaCEP com o CEP só com números", async () => {
    const address = { logradouro: "Praça da Sé", bairro: "Sé", localidade: "São Paulo", uf: "SP" };
    global.fetch.mockResolvedValue({ json: async () => address });

    await expect(fetchAddressByCEP("01001-000")).resolves.toEqual(address);
    expect(global.fetch).toHaveBeenCalledWith("https://viacep.com.br/ws/01001000/json/");
  });

  it("não consulta CEP incompleto", async () => {
    await expect(fetchAddressByCEP("0100")).resolves.toBeNull();
    await expect(fetchAddressByCEP(undefined)).resolves.toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("devolve null quando o CEP não existe (erro: true)", async () => {
    global.fetch.mockResolvedValue({ json: async () => ({ erro: true }) });
    await expect(fetchAddressByCEP("99999999")).resolves.toBeNull();
  });

  it("devolve null quando a rede falha", async () => {
    global.fetch.mockRejectedValue(new Error("sem internet"));
    await expect(fetchAddressByCEP("01001000")).resolves.toBeNull();
  });
});

describe("openCorreiosCEP", () => {
  it("abre a busca de CEP dos Correios", async () => {
    await openCorreiosCEP();
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith("https://buscacepinter.correios.com.br/app/endereco/index.php");
  });
});
