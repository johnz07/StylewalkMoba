import AsyncStorage from "@react-native-async-storage/async-storage";

// Chaves de tudo que o app guarda no aparelho (sobrevive a recarregar/fechar o app).
export const storageKeys = {
  session: "stylewalk:session", // { token, user }
  cart: "stylewalk:cart",
  favorites: "stylewalk:favorites",
};

// Lê um JSON salvo; devolve `fallback` se não existir ou estiver corrompido.
export async function loadJSON(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// Falha ao salvar não deve derrubar o app: só perde a persistência.
export async function saveJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignora
  }
}

export async function removeKey(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignora
  }
}
