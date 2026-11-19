import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

// Campo de escolha única do formulário do admin (ex.: categoria, selo), em chips.
export default function AdminOptionField({ label, onSelect, options, value }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View accessibilityLabel={label} accessibilityRole="radiogroup" style={styles.row}>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              key={String(option.value)}
              onPress={() => onSelect(option.value)}
              style={[styles.chip, isSelected ? styles.chipSelected : null]}
            >
              <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : null]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.admin.spacing.labelToInput },
  label: { color: theme.colors.adminInk, ...theme.admin.typography.fieldLabel },
  row: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  chip: {
    backgroundColor: theme.colors.adminInput,
    borderColor: theme.colors.adminBorder,
    borderRadius: theme.radius.pill,
    borderWidth: theme.spacing.hairline,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  chipSelected: { backgroundColor: theme.colors.adminBrand, borderColor: theme.colors.adminBrand },
  chipText: { color: theme.colors.adminInk, ...theme.admin.typography.fieldInput },
  chipTextSelected: { color: theme.colors.adminHeaderText },
});
