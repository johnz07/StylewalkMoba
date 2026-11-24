import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadJSON, removeKey, saveJSON, storageKeys } from "../storage";

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.restoreAllMocks();
});

describe("storage", () => {
  it("salva e lê um JSON", async () => {
    await saveJSON(storageKeys.cart, [{ key: "1-42", quantity: 2 }]);
    await expect(loadJSON(storageKeys.cart, [])).resolves.toEqual([{ key: "1-42", quantity: 2 }]);
  });

  it("devolve o fallback quando a chave não existe", async () => {
    await expect(loadJSON("inexistente", ["padrão"])).resolves.toEqual(["padrão"]);
  });

  it("devolve o fallback quando o conteúdo está corrompido", async () => {
    await AsyncStorage.setItem(storageKeys.favorites, "{quebrado");
    await expect(loadJSON(storageKeys.favorites, [])).resolves.toEqual([]);
  });

  it("remove a chave", async () => {
    await saveJSON(storageKeys.session, { token: "abc" });
    await removeKey(storageKeys.session);
    await expect(loadJSON(storageKeys.session, null)).resolves.toBeNull();
  });

  it("falha de gravação não derruba o app", async () => {
    jest.spyOn(AsyncStorage, "setItem").mockRejectedValue(new Error("disco cheio"));
    await expect(saveJSON(storageKeys.cart, [])).resolves.toBeUndefined();
  });
});
