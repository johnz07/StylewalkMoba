import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Cadastro from "./screens/Cadastro";
import Carrinho from "./screens/Carrinho";
import Home from "./screens/Home";
import Lancamentos from "./screens/Lancamentos";
import Login from "./screens/Login";
import Admin from "./screens/Admin";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Admin" screenOptions={{ headerShown: false }}>
          <Stack.Screen component={Admin} name="Admin" />
          <Stack.Screen component={Carrinho} name="Carrinho" />
          <Stack.Screen component={Lancamentos} name="Lancamentos" />
          <Stack.Screen component={Cadastro} name="Cadastro" />
          <Stack.Screen component={Login} name="Login" />
          <Stack.Screen component={Home} name="Home" />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
