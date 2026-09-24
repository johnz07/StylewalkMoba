import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { theme } from "../theme";

export default function FormTextField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry = false,
  trailingAccessory,
  containerStyle,
  inputProps,
}) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputShell}>
        <TextInput
          accessibilityLabel={label}
          autoCapitalize="words"
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.cadastroPlaceholder}
          secureTextEntry={secureTextEntry}
          style={[styles.input, trailingAccessory ? styles.inputWithAccessory : null]}
          value={value}
          {...inputProps}
        />
        {trailingAccessory ? <View style={styles.accessory}>{trailingAccessory}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.cadastro.spacing.labelToInput,
  },
  label: {
    color: theme.colors.cadastroInk,
    ...theme.typography.cadastroLabel,
  },
  inputShell: {
    justifyContent: "center",
  },
  input: {
    borderColor: theme.colors.cadastroBorder,
    borderRadius: theme.cadastro.radius.input,
    borderWidth: theme.spacing.hairline,
    color: theme.colors.cadastroInk,
    height: theme.cadastro.size.inputHeight,
    paddingHorizontal: theme.cadastro.spacing.inputHorizontal,
    ...theme.typography.cadastroInput,
  },
  inputWithAccessory: {
    paddingRight: theme.cadastro.spacing.inputWithAccessoryRight,
  },
  accessory: {
    position: "absolute",
    right: theme.cadastro.spacing.accessoryRight,
  },
});
