import React, { useCallback, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ArrowRightIcon from "../assets/arrow-right.svg";
import CartItem from "../components/CartItem";
import StoreFooter from "../components/StoreFooter";
import StoreHeader from "../components/StoreHeader";
import { copy, theme } from "../theme";

const initialCartItems = [
  { id: "air-zoom-pegasus", image: require("../assets/Product-Image5.png"), name: copy.cartFirstItemName, price: copy.cartFirstItemPrice, quantity: theme.cart.quantity.default, size: copy.cartFirstItemSize, unitPrice: theme.cart.price.firstItem },
  { id: "ultra-boost-running", image: require("../assets/Product-Image10.png"), name: copy.cartSecondItemName, price: copy.cartSecondItemPrice, quantity: theme.cart.quantity.default, size: copy.cartSecondItemSize, unitPrice: theme.cart.price.secondItem },
];

function formatPrice(value) {
  return value.toLocaleString(copy.cartLocale, theme.cart.currencyFormat);
}

export default function Carrinho({ navigation }) {
  const insets = useSafeAreaInsets();
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.unitPrice * item.quantity, theme.cart.price.empty),
    [cartItems],
  );

  const changeQuantity = useCallback((itemId, change) => {
    setCartItems((currentItems) => currentItems.map((item) => item.id === itemId
      ? { ...item, quantity: Math.max(theme.cart.quantity.minimum, item.quantity + change) }
      : item));
  }, []);

  const removeItem = useCallback((itemId) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
  }, []);

  const applyCoupon = useCallback(() => {
    const normalizedCoupon = couponCode.trim();
    setAppliedCoupon(normalizedCoupon);
    setStatusMessage(normalizedCoupon ? copy.cartCouponApplied : copy.cartCouponRequired);
  }, [couponCode]);

  const checkout = useCallback(() => {
    setStatusMessage(cartItems.length ? copy.cartCheckoutFeedback : copy.cartEmptyFeedback);
  }, [cartItems.length]);

  return (
    <View style={styles.screen}>
      <View style={[styles.headerArea, { paddingTop: Math.max(insets.top, StatusBar.currentHeight || theme.cart.size.statusBarFallback) }]}>
        <StoreHeader onAccountPress={() => navigation.navigate("Login")} onBagPress={() => setStatusMessage(copy.cartBagFeedback)} />
      </View>
      <ScrollView bounces={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" style={styles.scrollView}>
        <View style={styles.cartContent}>
          <Text style={styles.title}>{copy.cartTitle}</Text>
          <Text style={styles.subtitle}>{copy.cartItemCount(cartItems.length)}</Text>

          <View style={styles.itemList}>
            {cartItems.map((item) => (
              <CartItem
                item={item}
                key={item.id}
                onDecrement={() => changeQuantity(item.id, theme.cart.quantity.decrement)}
                onIncrement={() => changeQuantity(item.id, theme.cart.quantity.increment)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </View>

          <Text style={styles.couponLabel}>{copy.cartCouponLabel}</Text>
          <View style={styles.couponRow}>
            <TextInput
              accessibilityLabel={copy.cartCouponInputLabel}
              onChangeText={setCouponCode}
              placeholder={copy.cartCouponPlaceholder}
              placeholderTextColor={theme.colors.cartPlaceholder}
              style={styles.couponInput}
              value={couponCode}
            />
            <Pressable accessibilityLabel={copy.cartApplyCouponLabel} accessibilityRole="button" onPress={applyCoupon} style={styles.couponButton}>
              <Text style={styles.couponButtonText}>{copy.cartApplyCoupon}</Text>
            </Pressable>
          </View>
          {appliedCoupon ? <Text accessibilityLiveRegion="polite" style={styles.couponFeedback}>{statusMessage}</Text> : null}

          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>{copy.cartSummaryTitle}</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{copy.cartSubtotal}</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{copy.cartDelivery}</Text>
              <Text style={styles.deliveryValue}>{copy.cartFreeDelivery}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{copy.cartTotal}</Text>
              <Text style={styles.totalValue}>{formatPrice(subtotal)}</Text>
            </View>
          </View>

          <Pressable accessibilityLabel={copy.cartCheckoutLabel} accessibilityRole="button" onPress={checkout} style={styles.checkoutButton}>
            <Text style={styles.checkoutText}>{copy.cartCheckout}</Text>
          </Pressable>
          {statusMessage && !appliedCoupon ? <Text accessibilityLiveRegion="polite" style={styles.status}>{statusMessage}</Text> : null}
          <Pressable accessibilityLabel={copy.cartContinueShoppingLabel} accessibilityRole="button" onPress={() => navigation.navigate("Home")} style={styles.continueShopping}>
            <Text style={styles.continueShoppingText}>{copy.cartContinueShopping}</Text>
            <ArrowRightIcon height={theme.cart.size.continueIcon} width={theme.cart.size.continueIcon} />
          </Pressable>
        </View>
        <StoreFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.ink,
    flex: theme.flex.full,
  },
  headerArea: {
    backgroundColor: theme.colors.ink,
  },
  scrollView: {
    backgroundColor: theme.colors.cartCanvas,
  },
  content: {
    flexGrow: theme.flex.full,
  },
  cartContent: {
    backgroundColor: theme.colors.cartCanvas,
    paddingBottom: theme.cart.spacing.contentBottom,
    paddingHorizontal: theme.cart.spacing.screenHorizontal,
    paddingTop: theme.cart.spacing.contentTop,
  },
  title: {
    color: theme.colors.cartInk,
    ...theme.typography.cartTitle,
  },
  subtitle: {
    color: theme.colors.cartMuted,
    ...theme.typography.cartSubtitle,
  },
  itemList: {
    gap: theme.cart.spacing.itemGap,
    marginTop: theme.cart.spacing.subtitleToItems,
  },
  couponLabel: {
    color: theme.colors.cartInk,
    marginTop: theme.cart.spacing.itemsToCoupon,
    ...theme.typography.cartCouponLabel,
  },
  couponRow: {
    flexDirection: "row",
    gap: theme.cart.spacing.couponGap,
    marginTop: theme.cart.spacing.couponLabelToInput,
  },
  couponInput: {
    backgroundColor: theme.colors.cartCard,
    borderColor: theme.colors.cartCardBorder,
    borderRadius: theme.cart.radius.coupon,
    borderWidth: theme.spacing.hairline,
    color: theme.colors.cartInk,
    flex: theme.flex.full,
    height: theme.cart.size.couponHeight,
    paddingHorizontal: theme.cart.spacing.couponInset,
    ...theme.typography.cartCouponInput,
  },
  couponButton: {
    alignItems: "center",
    backgroundColor: theme.colors.cartCouponButton,
    borderRadius: theme.cart.radius.coupon,
    height: theme.cart.size.couponHeight,
    justifyContent: "center",
    width: theme.cart.size.couponButtonWidth,
  },
  couponButtonText: {
    color: theme.colors.brand,
    ...theme.typography.cartCouponButton,
  },
  couponFeedback: {
    color: theme.colors.cartSuccess,
    marginTop: theme.cart.spacing.feedbackTop,
    ...theme.typography.cartFeedback,
  },
  summary: {
    backgroundColor: theme.colors.cartCard,
    borderColor: theme.colors.cartCardBorder,
    borderRadius: theme.cart.radius.summary,
    borderWidth: theme.spacing.hairline,
    gap: theme.cart.spacing.summaryGap,
    marginTop: theme.cart.spacing.couponToSummary,
    padding: theme.cart.spacing.summaryInset,
  },
  summaryTitle: {
    color: theme.colors.cartInk,
    ...theme.typography.cartSummaryTitle,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    color: theme.colors.cartMuted,
    ...theme.typography.cartSummaryBody,
  },
  summaryValue: {
    color: theme.colors.cartInk,
    ...theme.typography.cartSummaryBodyStrong,
  },
  deliveryValue: {
    color: theme.colors.cartSuccess,
    ...theme.typography.cartSummaryBodyStrong,
  },
  totalRow: {
    borderTopColor: theme.colors.cartDivider,
    borderTopWidth: theme.spacing.hairline,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: theme.cart.spacing.totalTop,
  },
  totalLabel: {
    color: theme.colors.cartInk,
    ...theme.typography.cartTotal,
  },
  totalValue: {
    color: theme.colors.brand,
    ...theme.typography.cartTotal,
  },
  checkoutButton: {
    alignItems: "center",
    backgroundColor: theme.colors.brand,
    borderRadius: theme.cart.radius.checkout,
    height: theme.cart.size.checkoutHeight,
    justifyContent: "center",
    marginTop: theme.cart.spacing.summaryToCheckout,
  },
  checkoutText: {
    color: theme.colors.cartCard,
    ...theme.typography.cartCheckout,
  },
  status: {
    color: theme.colors.cartSuccess,
    marginTop: theme.cart.spacing.feedbackTop,
    textAlign: "center",
    ...theme.typography.cartFeedback,
  },
  continueShopping: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.cart.spacing.continueGap,
    justifyContent: "center",
    marginTop: theme.cart.spacing.checkoutToContinue,
  },
  continueShoppingText: {
    color: theme.colors.brand,
    ...theme.typography.cartContinue,
  },
});
