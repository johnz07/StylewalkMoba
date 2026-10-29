// Vai para a tela, voltando até ela se já estiver na pilha (evita empilhar Home > Carrinho > Home > ...).
export function goTo(navigation, routeName, params) {
  navigation.navigate(routeName, params, { pop: true });
}

// Depois de login/cadastro: admin vai para o painel; cliente volta para onde estava
// (ou segue para a tela que pediu login, ex.: Checkout), tirando Login/Cadastro da pilha.
export function finishAuth(navigation, user, redirectTo) {
  if (user.role === "admin") {
    navigation.reset({ index: 0, routes: [{ name: "Admin" }] });
    return;
  }

  const routes = navigation.getState().routes.filter((route) => route.name !== "Login" && route.name !== "Cadastro");
  if (redirectTo) {
    routes.push({ name: redirectTo });
  }
  if (!routes.length) {
    routes.push({ name: "Home" });
  }
  navigation.reset({ index: routes.length - 1, routes });
}
