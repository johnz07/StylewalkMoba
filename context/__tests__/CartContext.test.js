import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";
import { CartProvider, useCart } from "../CartContext";
import { storageKeys } from "../../utils/storage";

// O catálogo vem da API; aqui ele é controlado pelo teste.
const mockStore = { products: [], status: "ready" };
jest.mock("../StoreContext", () => ({ useStore: () => mockStore }));

const shoe = { id: 1, name: "Court Clean", price: 349.9, image: "img" };
const runner = { id: 2, name: "UltraBoost", price: 899.9, image: "img" };

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

async function renderCart() {
  const hook = await renderHook(() => useCart(), { wrapper });
  // espera a leitura inicial do AsyncStorage terminar antes de usar o carrinho
  await act(async () => {});
  return hook;
}

beforeEach(async () => {
  await AsyncStorage.clear();
  mockStore.products = [shoe, runner];
  mockStore.status = "ready";
});

describe("CartContext", () => {
  it("começa vazio", async () => {
    const { result } = await renderCart();
    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it("adiciona produto por tamanho e soma a quantidade do mesmo item", async () => {
    const { result } = await renderCart();
    await act(() => result.current.addItem(shoe, 42));
    await act(() => result.current.addItem(shoe, 42));
    await act(() => result.current.addItem(shoe, 40));

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items.find((item) => item.key === "1-42")).toMatchObject({ productId: 1, size: 42, quantity: 2 });
    expect(result.current.itemCount).toBe(3);
  });

  it("calcula o subtotal", async () => {
    const { result } = await renderCart();
    await act(() => result.current.addItem(shoe, 42));
    await act(() => result.current.addItem(shoe, 42));
    await act(() => result.current.addItem(runner, 41));
    expect(result.current.subtotal).toBeCloseTo(2 * 349.9 + 899.9, 2);
  });

  it("altera a quantidade sem passar de 1 para baixo", async () => {
    const { result } = await renderCart();
    await act(() => result.current.addItem(shoe, 42));
    await act(() => result.current.changeQuantity("1-42", 2));
    expect(result.current.items[0].quantity).toBe(3);
    await act(() => result.current.changeQuantity("1-42", -10));
    expect(result.current.items[0].quantity).toBe(1);
  });

  it("remove um item e esvazia o carrinho", async () => {
    const { result } = await renderCart();
    await act(() => result.current.addItem(shoe, 42));
    await act(() => result.current.addItem(runner, 41));
    await act(() => result.current.removeItem("1-42"));
    expect(result.current.items.map((item) => item.key)).toEqual(["2-41"]);
    await act(() => result.current.clearCart());
    expect(result.current.items).toEqual([]);
  });

  it("salva o carrinho no aparelho e o restaura ao reabrir", async () => {
    const first = await renderCart();
    await act(() => first.result.current.addItem(shoe, 42));
    await waitFor(async () => expect(JSON.parse(await AsyncStorage.getItem(storageKeys.cart))).toHaveLength(1));
    await first.unmount();

    const second = await renderCart();
    await waitFor(() => expect(second.result.current.items).toHaveLength(1));
    expect(second.result.current.items[0]).toMatchObject({ key: "1-42", quantity: 1 });
  });

  it("sincroniza com o catálogo: preço atual e remove produto excluído", async () => {
    await AsyncStorage.setItem(storageKeys.cart, JSON.stringify([
      { key: "1-42", productId: 1, name: "Nome antigo", price: 100, size: 42, quantity: 1 },
      { key: "99-40", productId: 99, name: "Excluído", price: 50, size: 40, quantity: 1 },
    ]));
    // Como no app: o carrinho sai do aparelho primeiro e o catálogo chega depois, vindo da API.
    mockStore.products = [];
    mockStore.status = "loading";
    const hook = await renderCart();
    await waitFor(() => expect(hook.result.current.items).toHaveLength(2));

    mockStore.products = [shoe, runner];
    mockStore.status = "ready";
    await hook.rerender();

    await waitFor(() => expect(hook.result.current.items).toHaveLength(1));
    expect(hook.result.current.items[0]).toMatchObject({ productId: 1, name: "Court Clean", price: 349.9 });
  });

  it("não sincroniza enquanto o catálogo não carregou", async () => {
    mockStore.products = [];
    mockStore.status = "loading";
    await AsyncStorage.setItem(storageKeys.cart, JSON.stringify([{ key: "1-42", productId: 1, name: "X", price: 1, size: 42, quantity: 1 }]));
    const { result } = await renderCart();

    await waitFor(() => expect(result.current.items).toHaveLength(1));
  });
});
