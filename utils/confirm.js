import { Alert, Platform } from "react-native";

// Pergunta de confirmação (Sim/Não) que funciona no celular e no navegador.
export function confirmAction(message, { cancelLabel = "Cancelar", confirmLabel = "Confirmar" } = {}) {
  if (Platform.OS === "web") {
    return Promise.resolve(typeof window !== "undefined" && window.confirm(message));
  }
  return new Promise((resolve) => {
    Alert.alert(message, undefined, [
      { onPress: () => resolve(false), style: "cancel", text: cancelLabel },
      { onPress: () => resolve(true), style: "destructive", text: confirmLabel },
    ], { cancelable: true, onDismiss: () => resolve(false) });
  });
}
