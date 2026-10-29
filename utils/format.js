import { copy, theme } from "../theme";

export function formatPrice(value) {
  return value.toLocaleString(copy.cartLocale, theme.cart.currencyFormat);
}

// Converte textos como "R$ 1.099,90" ou "499.9" em número.
export function parsePrice(text) {
  const normalized = String(text).replace(/[^\d,.]/g, "");
  const value = normalized.includes(",")
    ? Number(normalized.replace(/\./g, "").replace(",", "."))
    : Number(normalized);
  return Number.isFinite(value) ? value : 0;
}
