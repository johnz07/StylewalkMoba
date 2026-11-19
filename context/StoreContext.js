import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toAppProduct } from "../data/products";
import { api } from "../services/api";
import { loadJSON, saveJSON, storageKeys } from "../utils/storage";

const StoreContext = createContext(null);

// Catálogo vindo da API (CRUD do admin grava no banco) e favoritos salvos no aparelho.
export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"
  const [errorMessage, setErrorMessage] = useState("");
  const [favoriteIds, setFavoriteIds] = useState([]);
  const favoritesLoaded = useRef(false);

  // Busca produtos e categorias na API. Usado ao abrir o app e no "Tentar novamente".
  const reload = useCallback(async () => {
    setStatus("loading");
    try {
      const [productList, categoryList] = await Promise.all([api.listProducts(), api.listCategories()]);
      setProducts(productList.map(toAppProduct));
      setCategories(categoryList);
      setStatus("ready");
    } catch (error) {
      setErrorMessage(error.message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    reload();
    loadJSON(storageKeys.favorites, []).then((savedIds) => {
      setFavoriteIds((currentIds) => [...new Set([...savedIds, ...currentIds])]);
      favoritesLoaded.current = true;
    });
  }, [reload]);

  useEffect(() => {
    if (favoritesLoaded.current) saveJSON(storageKeys.favorites, favoriteIds);
  }, [favoriteIds]);

  const getProduct = useCallback((productId) => products.find((product) => product.id === productId), [products]);

  // Cria (sem id) ou altera (com id) no banco e atualiza a lista local com a resposta da API.
  const saveProduct = useCallback(async (id, data) => {
    const saved = toAppProduct(id ? await api.updateProduct(id, data) : await api.createProduct(data));
    setProducts((currentProducts) => (id
      ? currentProducts.map((product) => (product.id === id ? saved : product))
      : [saved, ...currentProducts]));
    return saved;
  }, []);

  const deleteProduct = useCallback(async (productId) => {
    await api.deleteProduct(productId);
    setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId));
  }, []);

  const toggleFavorite = useCallback((productId) => {
    setFavoriteIds((currentIds) => (currentIds.includes(productId)
      ? currentIds.filter((id) => id !== productId)
      : [...currentIds, productId]));
  }, []);

  const value = useMemo(
    () => ({ products, categories, status, errorMessage, reload, favoriteIds, getProduct, saveProduct, deleteProduct, toggleFavorite }),
    [products, categories, status, errorMessage, reload, favoriteIds, getProduct, saveProduct, deleteProduct, toggleFavorite],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
