import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { copy, theme } from "../theme";

export default function Login({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);

  const handleSubmit = () => {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    // 🔒 Validação de Administrador
    if (cleanUsername === "admin@admin.com.br" && cleanPassword === "0000") {
      navigation.replace("Admin");
    } else {
      navigation.replace("Home");
    }
  };

  const handleGoToCadastro = () => {
    navigation.navigate("Cadastro");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", default: undefined })}
      style={styles.screen}
    >
      <View style={styles.card}>
        <Text style={styles.title}>{copy.loginTitle}</Text>

        <View>
          <Text style={styles.label}>{copy.usernameLabel}</Text>
          <TextInput
            accessibilityLabel={copy.usernameInputLabel}
            autoCapitalize="none"
            autoFocus
            onBlur={() => setIsUsernameFocused(false)}
            onChangeText={setUsername}
            onFocus={() => setIsUsernameFocused(true)}
            placeholder={copy.usernamePlaceholder}
            placeholderTextColor={theme.colors.loginPlaceholder}
            returnKeyType="next"
            style={[styles.input, styles.usernameInput, isUsernameFocused && styles.focusedInput]}
            value={username}
          />
        </View>

        <View style={styles.passwordField}>
          <Text style={styles.label}>{copy.passwordLabel}</Text>
          <TextInput
            accessibilityLabel={copy.passwordInputLabel}
            autoCapitalize="none"
            onChangeText={setPassword}
            placeholder={copy.passwordPlaceholder}
            placeholderTextColor={theme.colors.loginPlaceholder}
            returnKeyType="done"
            secureTextEntry
            style={[styles.input, styles.passwordInput]}
            value={password}
          />
        </View>

        <Text accessibilityRole="text" style={styles.recoveryLink}>
          {copy.forgotPassword}
        </Text>

        <Pressable accessibilityLabel={copy.loginButtonLabel} onPress={handleSubmit} style={styles.loginButton}>
          <Text style={styles.loginButtonText}>{copy.loginAction}</Text>
        </Pressable>

        <View style={styles.registrationRow}>
          <Text style={styles.registrationPrompt}>{copy.registrationPrompt}</Text>
          <Pressable accessibilityRole="button" onPress={handleGoToCadastro}>
            <Text style={styles.registrationLink}>
              {copy.registrationAction}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
    backgroundColor: theme.colors.loginCanvas,
    flex: theme.flex.full,
    justifyContent: "center",
    paddingHorizontal: theme.login.spacing.screenHorizontal,
  },
  card: {
    alignSelf: "stretch",
    backgroundColor: theme.colors.loginCard,
    borderRadius: theme.login.radius.card,
    elevation: theme.login.elevation.card,
    paddingHorizontal: theme.login.spacing.cardHorizontal,
    paddingVertical: theme.login.spacing.cardVertical,
    shadowColor: theme.colors.loginShadow,
    shadowOffset: theme.login.elevation.cardShadowOffset,
    shadowOpacity: theme.login.elevation.cardShadowOpacity,
    shadowRadius: theme.login.elevation.cardShadowRadius,
  },
  title: {
    color: theme.colors.loginInk,
    marginBottom: theme.login.spacing.titleToField,
    textAlign: "center",
    ...theme.typography.loginTitle,
  },
  label: {
    color: theme.colors.loginLabel,
    marginBottom: theme.login.spacing.labelToInput,
    ...theme.typography.loginLabel,
  },
  input: {
    borderColor: theme.colors.loginInputBorder,
    borderRadius: theme.login.radius.input,
    borderWidth: theme.spacing.hairline,
    color: theme.colors.loginLabel,
    paddingHorizontal: theme.login.size.inputHorizontal,
    ...theme.typography.loginInput,
  },
  usernameInput: {
    height: theme.login.size.usernameInputHeight,
  },
  focusedInput: {
    borderColor: theme.colors.loginInputFocusedBorder,
    borderWidth: theme.login.size.focusedBorder,
  },
  passwordField: {
    marginTop: theme.login.spacing.fieldToField,
  },
  passwordInput: {
    height: theme.login.size.passwordInputHeight,
  },
  recoveryLink: {
    alignSelf: "flex-end",
    color: theme.colors.loginLink,
    marginTop: theme.login.spacing.inputToRecovery,
    ...theme.typography.loginRecovery,
  },
  loginButton: {
    alignItems: "center",
    backgroundColor: theme.colors.loginBrand,
    borderRadius: theme.login.radius.button,
    height: theme.login.size.buttonHeight,
    justifyContent: "center",
    marginTop: theme.login.spacing.recoveryToButton,
  },
  loginButtonText: {
    color: theme.colors.loginCard,
    ...theme.typography.loginButton,
  },
  registrationRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.login.spacing.buttonToPrompt,
  },
  registrationPrompt: {
    color: theme.colors.loginPlaceholder,
    marginRight: theme.login.spacing.promptGap,
    ...theme.typography.loginPrompt,
  },
  registrationLink: {
    color: theme.colors.loginLink,
    ...theme.typography.loginRegistration,
  },
});