// Cliente da API REST do StyleWalk (server/). Toda comunicação com o backend passa por aqui.
import Constants from "expo-constants";
import { Platform } from "react-native";
import { copy } from "../theme";

const API_PORT = 3000;
const REQUEST_TIMEOUT_MS = 10000;

// Endereço da API, em ordem de prioridade:
// 1. EXPO_PUBLIC_API_URL no .env (obrigatório para a API na nuvem);
// 2. na web, o mesmo host da página (localhost);
// 3. no celular (Expo Go), o IP do PC que roda o `npx expo start`;
// 4. localhost.
function resolveApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:${API_PORT}`;
  }
  const devServerHost = Constants.expoConfig?.hostUri?.split(":")[0];
  return `http://${devServerHost || "localhost"}:${API_PORT}`;
}

export const API_URL = resolveApiUrl();

// Erro com a mensagem (em português) devolvida pela API ou uma mensagem padrão.
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

let authToken = null;
let onUnauthorized = null;

export function setAuthToken(token) {
  authToken = token;
}

// Chamado quando uma requisição autenticada volta 401 (token expirado): o AuthContext faz logout.
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function request(path, { method = "GET", body, query } = {}) {
  const search = query ? new URLSearchParams(Object.entries(query).filter(([, value]) => value !== undefined && value !== "")).toString() : "";
  const url = `${API_URL}${path}${search ? `?${search}` : ""}`;
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(url, { body: body === undefined ? undefined : JSON.stringify(body), headers, method, signal: controller.signal });
  } catch {
    throw new ApiError(copy.apiOffline, 0);
  } finally {
    clearTimeout(timeout);
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && authToken && onUnauthorized) onUnauthorized();
    throw new ApiError(data?.error || copy.apiGenericError, response.status);
  }
  return data;
}

export const api = {
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),
  register: (data) => request("/auth/register", { method: "POST", body: data }),
  me: () => request("/auth/me"),

  listCategories: () => request("/categorias"),
  listProducts: (filters) => request("/produtos", { query: filters }),
  createProduct: (product) => request("/produtos", { method: "POST", body: product }),
  updateProduct: (id, product) => request(`/produtos/${id}`, { method: "PUT", body: product }),
  deleteProduct: (id) => request(`/produtos/${id}`, { method: "DELETE" }),
};
