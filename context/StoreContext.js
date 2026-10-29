import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { initialProducts } from "../data/products";

const StoreContext = createContext(null);

// Catálogo (editável pelo admin) e favoritos (não exigem login).
export function StoreProvider({ children }) {
  const [products, setProducts] = useState(initialProducts);
  const [favoriteIds, setFavoriteIds] = useState([]);

  const getProduct = useCallback((productId) => products.find((product) => product.id === productId), [products]);

  const saveProduct = useCallback((product) => {
    setProducts((currentProducts) => (currentProducts.some((item) => item.id === product.id)
      ? currentProducts.map((item) => (item.id === product.id ? { ...item, ...product } : item))
      : [...currentProducts, product]));
  }, []);

  const deleteProduct = useCallback((productId) => {
    setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId));
  }, []);

  const toggleFavorite = useCallback((productId) => {
    setFavoriteIds((currentIds) => (currentIds.includes(productId)
      ? currentIds.filter((id) => id !== productId)
      : [...currentIds, productId]));
  }, []);

  const value = useMemo(
    () => ({ products, favoriteIds, getProduct, saveProduct, deleteProduct, toggleFavorite }),
    [products, favoriteIds, getProduct, saveProduct, deleteProduct, toggleFavorite],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
