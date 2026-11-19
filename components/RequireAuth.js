import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import LoadState from "./LoadState";

// Protege uma tela: sem login vai para o Login (e volta para cá depois);
// com role="admin", quem não é admin é mandado para a Home.
// Enquanto a sessão salva no aparelho é restaurada, mostra o carregando.
export default function RequireAuth({ children, role }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { isRestoring, user } = useAuth();
  const isAllowed = Boolean(user) && (!role || user.role === role);

  useEffect(() => {
    if (isRestoring || isAllowed) {
      return;
    }
    if (role === "admin") {
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } else {
      navigation.replace("Login", { redirectTo: route.name });
    }
  }, [isAllowed, isRestoring, navigation, role, route.name]);

  if (isRestoring) {
    return <LoadState status="loading" />;
  }
  return isAllowed ? children : null;
}
