import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { copy, theme } from "../theme";
import { formatPrice } from "../utils/format";

export default function AdminInventoryCard({ item, onDelete, onEdit }) {
  return (
    <View style={styles.card}>
      <View style={styles.detailsRow}>
        <Image accessibilityLabel={item.name} source={item.image} style={styles.image} />
        <View style={styles.itemDetails}>
          <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
          <Text numberOfLines={1} style={styles.category}>{item.category}</Text>
        </View>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable accessibilityLabel={copy.adminEditLabel} accessibilityRole="button" onPress={onEdit} style={styles.editButton}>
          <Text style={styles.editText}>{copy.adminEdit}</Text>
        </Pressable>
        <Pressable accessibilityLabel={copy.adminDeleteLabel} accessibilityRole="button" onPress={onDelete} style={styles.deleteButton}>
          <Text style={styles.deleteText}>{copy.adminDelete}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.adminCard,
    borderColor: theme.colors.adminBorder,
    borderRadius: theme.admin.radius.card,
    borderWidth: theme.spacing.hairline,
    padding: theme.admin.spacing.cardInset,
  },
  detailsRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  image: {
    borderRadius: theme.admin.radius.image,
    height: theme.admin.size.cardImage,
    resizeMode: "cover",
    width: theme.admin.size.cardImage,
  },
  itemDetails: {
    flex: theme.flex.full,
    gap: theme.admin.spacing.cardTextGap,
    marginLeft: theme.admin.spacing.cardContentGap,
  },
  name: {
    color: theme.colors.adminInk,
    ...theme.admin.typography.cardName,
  },
  category: {
    color: theme.colors.adminMuted,
    ...theme.admin.typography.cardCategory,
  },
  price: {
    color: theme.colors.adminBrand,
    marginLeft: theme.admin.spacing.cardContentGap,
    ...theme.admin.typography.cardPrice,
  },
  actions: {
    flexDirection: "row",
    gap: theme.admin.spacing.actionGap,
    marginTop: theme.admin.spacing.actionsTop,
  },
  editButton: {
    alignItems: "center",
    backgroundColor: theme.colors.adminEditSurface,
    borderRadius: theme.admin.radius.action,
    flex: theme.flex.full,
    height: theme.admin.size.actionHeight,
    justifyContent: "center",
  },
  deleteButton: {
    alignItems: "center",
    backgroundColor: theme.colors.adminDeleteSurface,
    borderRadius: theme.admin.radius.action,
    flex: theme.flex.full,
    height: theme.admin.size.actionHeight,
    justifyContent: "center",
  },
  editText: {
    color: theme.colors.adminBrand,
    ...theme.admin.typography.action,
  },
  deleteText: {
    color: theme.colors.adminDanger,
    ...theme.admin.typography.action,
  },
});
