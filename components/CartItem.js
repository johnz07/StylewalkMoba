import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import MinusIcon from "../assets/minus.svg";
import PlusIcon from "../assets/plus.svg";
import TrashIcon from "../assets/trash.svg";
import { copy, theme } from "../theme";

export default function CartItem({ item, onDecrement, onIncrement, onRemove }) {
  return (
    <View style={styles.card}>
      <Image accessibilityLabel={item.name} source={item.image} style={styles.image} />
      <View style={styles.details}>
        <Text numberOfLines={theme.cart.size.itemTitleLines} style={styles.name}>{item.name}</Text>
        <Text style={styles.size}>{`${copy.cartSizeLabel}: ${item.size}`}</Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable accessibilityLabel={`${copy.cartRemoveItemLabel}: ${item.name}`} accessibilityRole="button" hitSlop={theme.cart.hitSlop.icon} onPress={onRemove} style={styles.removeButton}>
          <TrashIcon height={theme.cart.size.removeIcon} width={theme.cart.size.removeIcon} />
        </Pressable>
        <View style={styles.quantityControl}>
          <Pressable accessibilityLabel={copy.cartDecreaseQuantityLabel} accessibilityRole="button" hitSlop={theme.cart.hitSlop.icon} onPress={onDecrement} style={styles.quantityButton}>
            <MinusIcon height={theme.cart.size.quantityIcon} width={theme.cart.size.quantityIcon} />
          </Pressable>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <Pressable accessibilityLabel={copy.cartIncreaseQuantityLabel} accessibilityRole="button" hitSlop={theme.cart.hitSlop.icon} onPress={onIncrement} style={styles.quantityButton}>
            <PlusIcon height={theme.cart.size.quantityIcon} width={theme.cart.size.quantityIcon} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cartCard,
    borderColor: theme.colors.cartCardBorder,
    borderRadius: theme.cart.radius.item,
    borderWidth: theme.spacing.hairline,
    flexDirection: "row",
    minHeight: theme.cart.size.itemHeight,
    padding: theme.cart.spacing.itemInset,
  },
  image: {
    borderRadius: theme.cart.radius.image,
    height: theme.cart.size.itemImage,
    width: theme.cart.size.itemImage,
  },
  details: {
    flex: theme.flex.full,
    gap: theme.cart.spacing.detailGap,
    marginLeft: theme.cart.spacing.itemContentGap,
  },
  name: {
    color: theme.colors.cartInk,
    ...theme.typography.cartItemTitle,
  },
  size: {
    color: theme.colors.cartMuted,
    ...theme.typography.cartItemBody,
  },
  price: {
    color: theme.colors.brand,
    ...theme.typography.cartPrice,
  },
  actions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginLeft: theme.cart.spacing.actionGap,
  },
  removeButton: {
    alignItems: "center",
    height: theme.cart.size.removeTouch,
    justifyContent: "center",
    width: theme.cart.size.removeTouch,
  },
  quantityControl: {
    alignItems: "center",
    backgroundColor: theme.colors.cartQuantitySurface,
    borderRadius: theme.cart.radius.quantity,
    flexDirection: "row",
    height: theme.cart.size.quantityHeight,
  },
  quantityButton: {
    alignItems: "center",
    height: theme.cart.size.quantityHeight,
    justifyContent: "center",
    width: theme.cart.size.quantityButton,
  },
  quantity: {
    color: theme.colors.cartInk,
    textAlign: "center",
    width: theme.cart.size.quantityValue,
    ...theme.typography.cartQuantity,
  },
});
