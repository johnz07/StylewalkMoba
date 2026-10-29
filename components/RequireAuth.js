import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// Protege uma tela: sem login vai para o Login (e volta para cá depois);
// com role="admin", quem não é admin é mandado para a Home.
export default function RequireAuth({ children, role }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const isAllowed = Boolean(user) && (!role || user.role === role);

  useEffect(() => {
    if (isAllowed) {
      return;
    }
    if (role === "admin") {
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } else {
      navigation.replace("Login", { redirectTo: route.name });
    }
  }, [isAllowed, navigation, role, route.name]);

  return isAllowed ? children : null;
}
