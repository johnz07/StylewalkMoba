import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { loadJSON, saveJSON, storageKeys } from "../utils/storage";
import { useStore } from "./StoreContext";

const CartContext = createContext(null);

// Cada linha do carrinho é um produto + tamanho. O carrinho fica salvo no aparelho
// e é sincronizado com o catálogo da API (preço/nome/foto atuais; some se o produto foi excluído).
export function CartProvider({ children }) {
  const { products, status: storeStatus } = useStore();
  const [items, setItems] = useState([]);
  const isHydrated = useRef(false);

  useEffect(() => {
    loadJSON(storageKeys.cart, []).then((savedItems) => {
      setItems((currentItems) => (currentItems.length ? currentItems : savedItems));
      isHydrated.current = true;
    });
  }, []);

  useEffect(() => {
    if (isHydrated.current) saveJSON(storageKeys.cart, items);
  }, [items]);

  useEffect(() => {
    if (storeStatus !== "ready") return;
    setItems((currentItems) => {
      const synced = currentItems
        .filter((item) => products.some((product) => product.id === item.productId))
        .map((item) => {
          const product = products.find((candidate) => candidate.id === item.productId);
          return { ...item, name: product.name, image: product.image, price: product.price };
        });
      const changed = synced.length !== currentItems.length
        || synced.some((item, index) => item.price !== currentItems[index].price || item.name !== currentItems[index].name);
      return changed ? synced : currentItems;
    });
  }, [products, storeStatus]);

  const addItem = useCallback((product, size) => {
    const key = `${product.id}-${size}`;
    setItems((currentItems) => {
      if (currentItems.some((item) => item.key === key)) {
        return currentItems.map((item) => (item.key === key ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...currentItems, { key, productId: product.id, name: product.name, image: product.image, price: product.price, size, quantity: 1 }];
    });
  }, []);

  const changeQuantity = useCallback((key, change) => {
    setItems((currentItems) => currentItems.map((item) => (item.key === key ? { ...item, quantity: Math.max(1, item.quantity + change) } : item)));
  }, []);

  const removeItem = useCallback((key) => {
    setItems((currentItems) => currentItems.filter((item) => item.key !== key));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
    addItem,
    changeQuantity,
    removeItem,
    clearCart,
  }), [items, addItem, changeQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
