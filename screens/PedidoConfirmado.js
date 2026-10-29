import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RequireAuth from "../components/RequireAuth";
import { copy, theme } from "../theme";
import { formatPrice } from "../utils/format";

function PedidoConfirmadoContent({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { orderId, total } = route.params ?? {};

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom, paddingTop: insets.top }]}>
      <View style={styles.card}>
        <View style={styles.checkCircle}><Text style={styles.checkMark}>✓</Text></View>
        <Text style={styles.title}>{copy.orderConfirmedTitle}</Text>
        <Text style={styles.body}>{copy.orderConfirmedBody}</Text>
        {orderId ? <Text style={styles.detail}>{copy.orderNumber(orderId)}</Text> : null}
        {total !== undefined ? <Text style={styles.total}>{formatPrice(total)}</Text> : null}
        <Pressable
          accessibilityLabel={copy.orderBackToStore}
          accessibilityRole="button"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: "Home" }] })}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{copy.orderBackToStore}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function PedidoConfirmado(props) {
  return (
    <RequireAuth>
      <PedidoConfirmadoContent {...props} />
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.colors.cartCanvas, flex: theme.flex.full, justifyContent: "center", paddingHorizontal: theme.spacing.xxl },
  card: { alignItems: "center", backgroundColor: theme.colors.cartCard, borderRadius: theme.radius.medium, gap: theme.spacing.md, padding: theme.spacing.xxl },
  checkCircle: { alignItems: "center", backgroundColor: theme.colors.cartSuccess, borderRadius: theme.radius.pill, height: 64, justifyContent: "center", width: 64 },
  checkMark: { color: theme.colors.canvas, fontSize: 32, fontWeight: "900" },
  title: { color: theme.colors.cartInk, textAlign: "center", ...theme.typography.cartTitle },
  body: { color: theme.colors.cartMuted, textAlign: "center", ...theme.typography.cartSummaryBody },
  detail: { color: theme.colors.cartInk, ...theme.typography.cartSummaryBodyStrong },
  total: { color: theme.colors.brand, ...theme.typography.cartTotal },
  button: { alignItems: "center", alignSelf: "stretch", backgroundColor: theme.colors.ink, borderRadius: theme.radius.small, height: 48, justifyContent: "center", marginTop: theme.spacing.md },
  buttonText: { color: theme.colors.canvas, ...theme.typography.cartCheckout },
});
