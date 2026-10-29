import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

// Cada linha do carrinho é um produto + tamanho.
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

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
