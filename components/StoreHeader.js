import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import SearchIcon from "../assets/Search.svg";
import AccountIcon from "../assets/person.svg";
import BagIcon from "../assets/Shopping-bag.svg";
import MenuIcon from "../assets/List.svg";
import { copy, theme } from "../theme";

export default function StoreHeader({ onBagPress, onSearchPress, onAccountPress, onMenuPress }) {
  return (
    <View style={styles.header}>
      <Text style={styles.brand}>{copy.brand}</Text>
      <View style={styles.actions}>
        <Pressable accessibilityLabel={copy.searchLabel} accessibilityRole="button" onPress={onSearchPress} style={styles.iconButton}>
          <SearchIcon height={theme.size.icon} width={theme.size.icon} />
        </Pressable>
        <Pressable accessibilityLabel={copy.accountLabel} accessibilityRole="button" onPress={onAccountPress} style={styles.iconButton}>
          <AccountIcon height={theme.size.accountIcon} width={theme.size.accountIcon} />
        </Pressable>
        <Pressable accessibilityLabel={copy.bagLabel} accessibilityRole="button" onPress={onBagPress} style={styles.iconButton}>
          <BagIcon height={theme.size.icon} width={theme.size.icon} />
        </Pressable>
        <Pressable accessibilityLabel={copy.menuLabel} accessibilityRole="button" onPress={onMenuPress} style={styles.iconButton}>
          <MenuIcon height={theme.size.menuIcon} width={theme.size.menuIcon} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    height: theme.size.headerHeight,
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
  },
  brand: {
    color: theme.colors.canvas,
    ...theme.typography.brand,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: theme.size.accountIcon,
    minWidth: theme.size.accountIcon,
  },
});
