import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FormTextField from "../components/FormTextField";
import RequireAuth from "../components/RequireAuth";
import StoreHeader from "../components/StoreHeader";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { copy, theme } from "../theme";
import { formatPrice } from "../utils/format";
import { maskCEP, fetchAddressByCEP, openCorreiosCEP } from "../utils/masks";
import { goTo } from "../utils/navigation";

const emptyAddress = { zipCode: "", street: "", number: "", complement: "", district: "", city: "", state: "" };

function CheckoutContent({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { clearCart, items, subtotal } = useCart();
  
  // Parâmetros de desconto vindos do carrinho
  const discountPercent = route.params?.discountPercent || 0;
  const appliedCoupon = route.params?.appliedCoupon || null;

  // Endereço vem do cadastro e pode ser ajustado só para este pedido.
  const [address, setAddress] = useState({ ...emptyAddress, ...user.address });
  const [errorMessage, setErrorMessage] = useState("");

  const discountAmount = (subtotal * discountPercent) / 100;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const fieldProps = (fieldName, label, placeholder, inputProps = {}) => ({
    label,
    placeholder,
    value: address[fieldName],
    onChangeText: (value) => {
      setAddress((currentAddress) => ({ ...currentAddress, [fieldName]: value }));
      setErrorMessage("");
    },
    inputProps,
  });

  // Manipulação do CEP com máscara e ViaCEP automático
  const handleCepChange = async (value) => {
    const masked = maskCEP(value);
    setAddress((current) => ({ ...current, zipCode: masked }));
    setErrorMessage("");

    const clean = masked.replace(/\D/g, "");
    if (clean.length === 8) {
      const data = await fetchAddressByCEP(clean);
      if (data) {
        setAddress((current) => ({
          ...current,
          zipCode: masked,
          street: data.logradouro || current.street,
          district: data.bairro || current.district,
          city: data.localidade || current.city,
          state: data.uf || current.state,
        }));
      }
    }
  };

  const confirmOrder = () => {
    if (!address.zipCode.trim() || !address.street.trim() || !address.number.trim() || !address.city.trim()) {
      setErrorMessage(copy.checkoutAddressRequired);
      return;
    }
    // TODO: aqui entra a integração com o Mercado Pago (criar preferência no backend e abrir o checkout).
    const orderId = `SW-${String(Date.now()).slice(-6)}`;
    const total = finalTotal;
    clearCart();
    navigation.reset({ index: 1, routes: [{ name: "Home" }, { name: "PedidoConfirmado", params: { orderId, total } }] });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", default: undefined })} style={styles.screen}>
      <View style={[styles.headerArea, { paddingTop: Math.max(insets.top, StatusBar.currentHeight || 0) }]}>
        <StoreHeader />
      </View>
      <ScrollView bounces={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" style={styles.scrollView}>
        <Pressable accessibilityRole="button" onPress={() => goTo(navigation, "Carrinho")}><Text style={styles.backLink}>{copy.checkoutBack}</Text></Pressable>
        <Text style={styles.title}>{copy.checkoutTitle}</Text>
        <Text style={styles.subtitle}>{copy.checkoutGreeting(user.firstName)}</Text>

        {items.length ? (
          <>
            <Text style={styles.sectionTitle}>{copy.deliveryTitle}</Text>
            <View style={styles.card}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>{copy.zipCodeLabel}</Text>
                <Pressable accessibilityRole="button" onPress={openCorreiosCEP}>
                  <Text style={styles.zipLink}>{copy.zipCodeHelp}</Text>
                </Pressable>
              </View>
              <FormTextField
                label=""
                placeholder={copy.zipCodePlaceholder}
                value={address.zipCode}
                onChangeText={handleCepChange}
                inputProps={{ keyboardType: "numeric" }}
              />
              <FormTextField {...fieldProps("street", copy.addressLabel, copy.addressPlaceholder)} />
              <View style={styles.fieldRow}>
                <FormTextField containerStyle={styles.halfField} {...fieldProps("number", copy.numberLabel, copy.numberPlaceholder, { keyboardType: "numeric" })} />
                <FormTextField containerStyle={styles.halfField} {...fieldProps("complement", copy.complementLabel, copy.complementPlaceholder)} />
              </View>
              <FormTextField {...fieldProps("district", copy.districtLabel, copy.districtPlaceholder)} />
              <View style={styles.fieldRow}>
                <FormTextField containerStyle={styles.halfField} {...fieldProps("city", copy.cityLabel, copy.cityPlaceholder)} />
                <FormTextField containerStyle={styles.halfField} {...fieldProps("state", copy.stateLabel, copy.statePlaceholder)} />
              </View>
            </View>

            <Text style={styles.sectionTitle}>{copy.checkoutPaymentTitle}</Text>
            <View style={styles.card}>
              <Text style={styles.paymentTitle}>{copy.checkoutPaymentMethod}</Text>
              <Text style={styles.muted}>{copy.checkoutPaymentNotice}</Text>
            </View>

            <Text style={styles.sectionTitle}>{copy.cartSummaryTitle}</Text>
            <View style={styles.card}>
              {items.map((item) => (
                <View key={item.key} style={styles.summaryRow}>
                  <Text numberOfLines={1} style={styles.itemName}>{`${item.quantity}x ${item.name} (${item.size})`}</Text>
                  <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
                </View>
              ))}
              {discountPercent > 0 ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.muted}>Desconto ({appliedCoupon || `${discountPercent}%`})</Text>
                  <Text style={styles.freeDelivery}>- {formatPrice(discountAmount)}</Text>
                </View>
              ) : null}
              <View style={styles.summaryRow}>
                <Text style={styles.muted}>{copy.cartDelivery}</Text>
                <Text style={styles.freeDelivery}>{copy.cartFreeDelivery}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalText}>{copy.cartTotal}</Text>
                <Text style={[styles.totalText, styles.totalValue]}>{formatPrice(finalTotal)}</Text>
              </View>
            </View>

            {errorMessage ? <Text accessibilityLiveRegion="polite" style={styles.error}>{errorMessage}</Text> : null}
            <Pressable accessibilityLabel={copy.checkoutConfirm} accessibilityRole="button" onPress={confirmOrder} style={styles.confirmButton}>
              <Text style={styles.confirmText}>{copy.checkoutConfirm}</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.card}>
            <Text style={styles.muted}>{copy.cartEmptyFeedback}</Text>
            <Pressable accessibilityRole="button" onPress={() => goTo(navigation, "Home")}><Text style={styles.backLink}>{copy.cartContinueShopping}</Text></Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function Checkout(props) {
  return (
    <RequireAuth>
      <CheckoutContent {...props} />
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.colors.ink, flex: theme.flex.full },
  headerArea: { backgroundColor: theme.colors.ink },
  scrollView: { backgroundColor: theme.colors.cartCanvas },
  content: { flexGrow: theme.flex.full, padding: theme.spacing.lg, paddingBottom: theme.spacing.section },
  backLink: { color: theme.colors.brand, ...theme.typography.catalogBack },
  title: { color: theme.colors.cartInk, marginTop: theme.spacing.md, ...theme.typography.cartTitle },
  subtitle: { color: theme.colors.cartMuted, ...theme.typography.cartSubtitle },
  sectionTitle: { color: theme.colors.cartInk, marginBottom: theme.spacing.sm, marginTop: theme.spacing.xl, ...theme.typography.cartSummaryTitle },
  card: { backgroundColor: theme.colors.cartCard, borderColor: theme.colors.cartCardBorder, borderRadius: theme.radius.medium, borderWidth: theme.spacing.hairline, gap: theme.spacing.md, padding: theme.spacing.lg },
  fieldRow: { flexDirection: "row", gap: theme.spacing.md },
  halfField: { flex: theme.flex.full },
  labelRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  label: { color: theme.colors.cartInk, ...theme.typography.cartSummaryBodyStrong },
  zipLink: { color: theme.colors.brand, ...theme.typography.cartSummaryBody },
  paymentTitle: { color: theme.colors.cartInk, ...theme.typography.cartSummaryBodyStrong },
  muted: { color: theme.colors.cartMuted, ...theme.typography.cartSummaryBody },
  summaryRow: { alignItems: "center", flexDirection: "row", gap: theme.spacing.md, justifyContent: "space-between" },
  itemName: { color: theme.colors.cartInk, flex: theme.flex.full, ...theme.typography.cartSummaryBody },
  itemPrice: { color: theme.colors.cartInk, ...theme.typography.cartSummaryBodyStrong },
  freeDelivery: { color: theme.colors.cartSuccess, ...theme.typography.cartSummaryBodyStrong },
  totalRow: { borderTopColor: theme.colors.cartDivider, borderTopWidth: theme.spacing.hairline, paddingTop: theme.spacing.md },
  totalText: { color: theme.colors.cartInk, ...theme.typography.cartTotal },
  totalValue: { color: theme.colors.brand },
  error: { color: theme.colors.danger, marginTop: theme.spacing.lg, textAlign: "center", ...theme.typography.cartFeedback },
  confirmButton: { alignItems: "center", backgroundColor: theme.colors.brand, borderRadius: theme.radius.small, height: 48, justifyContent: "center", marginTop: theme.spacing.lg },
  confirmText: { color: theme.colors.canvas, ...theme.typography.cartCheckout },
});