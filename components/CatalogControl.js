import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

export default function CatalogControl({ label, leadingIcon, onPress, trailingIcon }) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={styles.control}>
      <View style={styles.content}>
        {leadingIcon ? <View style={styles.icon}>{leadingIcon}</View> : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      {trailingIcon ? <View style={styles.icon}>{trailingIcon}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  control: { alignItems: "center", borderColor: theme.colors.catalogControlBorder, borderRadius: theme.lancamentos.radius.control, borderWidth: theme.spacing.hairline, flex: theme.flex.full, flexDirection: "row", height: theme.lancamentos.size.toolbarHeight, justifyContent: "space-between", paddingHorizontal: theme.spacing.sm },
  content: { alignItems: "center", flexDirection: "row", gap: theme.spacing.xs },
  icon: { alignItems: "center", justifyContent: "center" },
  label: { color: theme.colors.catalogIcon, ...theme.typography.catalogControl },
});
