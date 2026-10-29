import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { StoreProvider } from "./context/StoreContext";
import Admin from "./screens/Admin";
import Cadastro from "./screens/Cadastro";
import Carrinho from "./screens/Carrinho";
import Checkout from "./screens/Checkout";
import Home from "./screens/Home";
import Lancamentos from "./screens/Lancamentos";
import Login from "./screens/Login";
import PedidoConfirmado from "./screens/PedidoConfirmado";
import Produto from "./screens/Produto";

const Stack = createNativeStackNavigator();

// Jornada: a loja é pública (Home > Lançamentos > Produto > Carrinho).
// Login/Cadastro só são exigidos ao finalizar a compra; Checkout, PedidoConfirmado
// e Admin são protegidos dentro da própria tela (components/RequireAuth).
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StoreProvider>
          <CartProvider>
            <NavigationContainer>
              <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
                {/* Loja (pública) */}
                <Stack.Screen component={Home} name="Home" />
                <Stack.Screen component={Lancamentos} name="Lancamentos" />
                <Stack.Screen component={Produto} name="Produto" />
                <Stack.Screen component={Carrinho} name="Carrinho" />

                {/* Autenticação */}
                <Stack.Screen component={Login} name="Login" />
                <Stack.Screen component={Cadastro} name="Cadastro" />

                {/* Cliente logado */}
                <Stack.Screen component={Checkout} name="Checkout" />
                <Stack.Screen component={PedidoConfirmado} name="PedidoConfirmado" options={{ gestureEnabled: false }} />

                {/* Admin */}
                <Stack.Screen component={Admin} name="Admin" />
              </Stack.Navigator>
            </NavigationContainer>
          </CartProvider>
        </StoreProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
