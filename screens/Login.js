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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { copy, theme } from "../theme";
import { finishAuth, goTo } from "../utils/navigation";

export default function Login({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const redirectTo = route.params?.redirectTo;
  const [errorMessage, setErrorMessage] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);

  const handleSubmit = () => {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setErrorMessage(copy.loginRequired);
      return;
    }

    // Admin e clientes usam o mesmo login; o perfil (role) decide o destino.
    const loggedUser = login(cleanUsername, cleanPassword);
    if (!loggedUser) {
      setErrorMessage(copy.loginInvalid);
      return;
    }
    finishAuth(navigation, loggedUser, redirectTo);
  };

  const handleGoToCadastro = () => {
    navigation.navigate("Cadastro", { redirectTo });
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      goTo(navigation, "Home");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", default: undefined })}
      style={styles.screen}
    >
      <Pressable accessibilityRole="button" hitSlop={theme.spacing.md} onPress={handleBack} style={[styles.backButton, { top: insets.top + theme.spacing.lg }]}>
        <Text style={styles.backText}>{copy.loginBack}</Text>
      </Pressable>
      <View style={styles.card}>
        <Text style={styles.title}>{copy.loginTitle}</Text>
        {redirectTo ? <Text style={styles.subtitle}>{copy.loginCheckoutHint}</Text> : null}

        <View>
          <Text style={styles.label}>{copy.usernameLabel}</Text>
          <TextInput
            accessibilityLabel={copy.usernameInputLabel}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onBlur={() => setIsUsernameFocused(false)}
            onChangeText={(value) => { setUsername(value); setErrorMessage(""); }}
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
            onChangeText={(value) => { setPassword(value); setErrorMessage(""); }}
            placeholder={copy.passwordPlaceholder}
            placeholderTextColor={theme.colors.loginPlaceholder}
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
            secureTextEntry
            style={[styles.input, styles.passwordInput]}
            value={password}
          />
        </View>

        <Text accessibilityRole="text" style={styles.recoveryLink}>
          {copy.forgotPassword}
        </Text>

        {errorMessage ? <Text accessibilityLiveRegion="polite" style={styles.error}>{errorMessage}</Text> : null}

        <Pressable accessibilityLabel={copy.loginButtonLabel} accessibilityRole="button" onPress={handleSubmit} style={styles.loginButton}>
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
  backButton: {
    left: theme.login.spacing.screenHorizontal,
    position: "absolute",
  },
  backText: {
    color: theme.colors.loginLink,
    ...theme.typography.loginRegistration,
  },
  title: {
    color: theme.colors.loginInk,
    marginBottom: theme.login.spacing.titleToField,
    textAlign: "center",
    ...theme.typography.loginTitle,
  },
  subtitle: {
    color: theme.colors.loginLabel,
    marginBottom: theme.login.spacing.titleToField,
    marginTop: -theme.spacing.sm,
    textAlign: "center",
    ...theme.typography.loginPrompt,
  },
  error: {
    color: theme.colors.danger,
    marginTop: theme.spacing.md,
    textAlign: "center",
    ...theme.typography.loginPrompt,
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