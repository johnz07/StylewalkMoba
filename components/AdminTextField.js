import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { theme } from "../theme";

export default function AdminTextField({ label, multiline = false, onChangeText, placeholder, value }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.adminPlaceholder}
        style={[styles.input, multiline ? styles.multilineInput : null]}
        textAlignVertical={multiline ? "top" : "center"}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.admin.spacing.labelToInput,
  },
  label: {
    color: theme.colors.adminInk,
    ...theme.admin.typography.fieldLabel,
  },
  input: {
    backgroundColor: theme.colors.adminInput,
    borderColor: theme.colors.adminBorder,
    borderRadius: theme.admin.radius.input,
    borderWidth: theme.spacing.hairline,
    color: theme.colors.adminInk,
    height: theme.admin.size.inputHeight,
    paddingHorizontal: theme.admin.spacing.inputHorizontal,
    ...theme.admin.typography.fieldInput,
  },
  multilineInput: {
    height: theme.admin.size.multilineInputHeight,
    paddingTop: theme.admin.spacing.multilineTop,
  },
});
