import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import Svg, { Ellipse, Path } from "react-native-svg";
import FormTextField from "../components/FormTextField";
import StoreFooter from "../components/StoreFooter";
import StoreHeader from "../components/StoreHeader";
import { useAuth } from "../context/AuthContext";
import { copy, theme } from "../theme";
import { finishAuth } from "../utils/navigation";

function EyeIcon() {
  return (
    <Svg height={theme.cadastro.size.eyeIcon} viewBox="0 0 24 24" width={theme.cadastro.size.eyeIcon}>
      <Path d="M2 12s3.5-5 10-5 10 5 10 5-3.5 5-10 5S2 12 2 12Z" fill="none" stroke={theme.colors.cadastroEye} strokeWidth={theme.spacing.hairline} />
      <Ellipse cx="12" cy="12" fill="none" rx="2.5" ry="2.5" stroke={theme.colors.cadastroEye} strokeWidth={theme.spacing.hairline} />
    </Svg>
  );
}

function PasswordAccessory({ isVisible, onPress }) {
  return (
    <Pressable accessibilityLabel={isVisible ? copy.hidePasswordLabel : copy.showPasswordLabel} accessibilityRole="button" hitSlop={theme.cadastro.hitSlop.eye} onPress={onPress}>
      <EyeIcon />
    </Pressable>
  );
}

export default function Cadastro({ navigation, route }) {
  const { register } = useAuth();
  const redirectTo = route.params?.redirectTo;
  const [errorMessage, setErrorMessage] = useState("");
  const [formValues, setFormValues] = useState({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  const updateField = (fieldName) => (value) => {
    setFormValues((currentValues) => ({ ...currentValues, [fieldName]: value }));
    setErrorMessage("");
  };

  const fieldProps = (fieldName, label, placeholder, inputProps = {}) => ({
    label,
    onChangeText: updateField(fieldName),
    placeholder,
    value: formValues[fieldName] || "",
    inputProps,
  });

  const handleRegister = () => {
    const value = (fieldName) => (formValues[fieldName] || "").trim();

    if (!value("firstName") || !value("email") || !value("password")) {
      setErrorMessage(copy.cadastroRequired);
      return;
    }
    if (!value("email").includes("@")) {
      setErrorMessage(copy.cadastroInvalidEmail);
      return;
    }
    if (value("password").length < 4) {
      setErrorMessage(copy.cadastroShortPassword);
      return;
    }
    if (value("password") !== value("passwordConfirmation")) {
      setErrorMessage(copy.cadastroPasswordMismatch);
      return;
    }

    const newUser = register({
      firstName: value("firstName"),
      lastName: value("lastName"),
      cpf: value("cpf"),
      birthDate: value("birthDate"),
      email: value("email"),
      phone: value("phone"),
      password: value("password"),
      address: {
        zipCode: value("zipCode"),
        address: value("address"),
        number: value("number"),
        complement: value("complement"),
        district: value("district"),
        city: value("city"),
        state: value("state"),
      },
    });
    if (!newUser) {
      setErrorMessage(copy.cadastroEmailTaken);
      return;
    }
    finishAuth(navigation, newUser, redirectTo);
  };

  // Se veio do Login, volta para ele; senão abre o Login mantendo o destino.
  const goToLogin = () => {
    const routes = navigation.getState().routes;
    if (routes[routes.length - 2]?.name === "Login") {
      navigation.goBack();
    } else {
      navigation.navigate("Login", { redirectTo });
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", default: undefined })} style={styles.screen}>
      <View style={styles.headerArea}>
        <StoreHeader />
      </View>
      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" style={styles.scrollView}>
        <View style={styles.formContent}>
          <Text style={styles.title}>{copy.cadastroTitle}</Text>
          <Text style={styles.subtitle}>{copy.cadastroSubtitle}</Text>

          <View style={styles.fieldList}>
            <View style={styles.fieldRow}>
              <FormTextField containerStyle={styles.halfField} {...fieldProps("firstName", copy.firstNameLabel, copy.firstNamePlaceholder)} />
              <FormTextField containerStyle={styles.halfField} {...fieldProps("lastName", copy.lastNameLabel, copy.lastNamePlaceholder)} />
            </View>
            <FormTextField {...fieldProps("cpf", copy.cpfLabel, copy.cpfPlaceholder, { keyboardType: "numeric" })} />
            <FormTextField {...fieldProps("birthDate", copy.birthDateLabel, copy.birthDatePlaceholder, { keyboardType: "numeric" })} />
            <FormTextField {...fieldProps("email", copy.emailLabel, copy.emailPlaceholder, { autoCapitalize: "none", keyboardType: "email-address" })} />
            <FormTextField {...fieldProps("phone", copy.phoneLabel, copy.phonePlaceholder, { keyboardType: "phone-pad" })} />
          </View>

          <Text style={styles.sectionTitle}>{copy.deliveryTitle}</Text>
          <View style={styles.fieldList}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{copy.zipCodeLabel}</Text>
              <Pressable accessibilityRole="button"><Text style={styles.zipLink}>{copy.zipCodeHelp}</Text></Pressable>
            </View>
            <FormTextField containerStyle={styles.fieldWithoutLabel} {...fieldProps("zipCode", "", copy.zipCodePlaceholder, { keyboardType: "numeric" })} />
            <FormTextField {...fieldProps("address", copy.addressLabel, copy.addressPlaceholder)} />
            <View style={styles.fieldRow}>
              <FormTextField containerStyle={styles.halfField} {...fieldProps("number", copy.numberLabel, copy.numberPlaceholder, { keyboardType: "numeric" })} />
              <FormTextField containerStyle={styles.halfField} {...fieldProps("complement", copy.complementLabel, copy.complementPlaceholder)} />
            </View>
            <FormTextField {...fieldProps("district", copy.districtLabel, copy.districtPlaceholder)} />
            <View style={styles.fieldRow}>
              <FormTextField containerStyle={styles.halfField} {...fieldProps("city", copy.cityLabel, copy.cityPlaceholder)} />
              <FormTextField containerStyle={styles.halfField} {...fieldProps("state", copy.stateLabel, copy.statePlaceholder)} />
            </View>
          </View>

          <Text style={styles.sectionTitle}>{copy.securityTitle}</Text>
          <View style={styles.fieldRow}>
            <FormTextField
              containerStyle={styles.halfField}
              secureTextEntry={!isPasswordVisible}
              trailingAccessory={<PasswordAccessory isVisible={isPasswordVisible} onPress={() => setIsPasswordVisible((currentValue) => !currentValue)} />}
              {...fieldProps("password", copy.passwordLabel, copy.cadastroPasswordPlaceholder, { autoCapitalize: "none" })}
            />
            <FormTextField
              containerStyle={styles.halfField}
              secureTextEntry={!isConfirmationVisible}
              trailingAccessory={<PasswordAccessory isVisible={isConfirmationVisible} onPress={() => setIsConfirmationVisible((currentValue) => !currentValue)} />}
              {...fieldProps("passwordConfirmation", copy.passwordConfirmationLabel, copy.cadastroPasswordPlaceholder, { autoCapitalize: "none" })}
            />
          </View>

          {errorMessage ? <Text accessibilityLiveRegion="polite" style={styles.error}>{errorMessage}</Text> : null}
          <Pressable accessibilityLabel={copy.createAccountLabel} accessibilityRole="button" onPress={handleRegister} style={styles.submitButton}>
            <Text style={styles.submitText}>{copy.createAccountAction}</Text>
          </Pressable>
          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>{copy.loginPrompt}</Text>
            <Pressable accessibilityRole="button" onPress={goToLogin}><Text style={styles.loginLink}>{copy.loginLink}</Text></Pressable>
          </View>
        </View>
        <StoreFooter />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.colors.ink, flex: theme.flex.full },
  headerArea: { 
    backgroundColor: theme.colors.ink,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) : 44,
  },
  scrollView: { backgroundColor: theme.colors.cadastroCanvas },
  scrollContent: { flexGrow: theme.flex.full },
  formContent: {
    backgroundColor: theme.colors.cadastroCanvas,
    paddingBottom: theme.cadastro.spacing.contentBottom,
    paddingHorizontal: theme.cadastro.spacing.screenHorizontal,
    paddingTop: theme.cadastro.spacing.contentTop,
  },
  title: { color: theme.colors.cadastroInk, ...theme.typography.cadastroTitle },
  subtitle: { color: theme.colors.cadastroMuted, marginTop: theme.cadastro.spacing.titleToSubtitle, ...theme.typography.cadastroSubtitle },
  fieldList: { gap: theme.cadastro.spacing.fieldToField, marginTop: theme.cadastro.spacing.subtitleToFields },
  fieldRow: { flexDirection: "row", gap: theme.cadastro.spacing.fieldColumnGap },
  halfField: { flex: theme.flex.full },
  sectionTitle: { color: theme.colors.cadastroInk, marginTop: theme.cadastro.spacing.sectionTop, ...theme.typography.cadastroSectionTitle },
  labelRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  label: { color: theme.colors.cadastroInk, ...theme.typography.cadastroLabel },
  zipLink: { color: theme.colors.cadastroLink, ...theme.typography.cadastroZipLink },
  fieldWithoutLabel: { marginTop: theme.cadastro.spacing.zipLabelToInput },
  submitButton: { alignItems: "center", backgroundColor: theme.colors.ink, borderRadius: theme.cadastro.radius.button, height: theme.cadastro.size.buttonHeight, justifyContent: "center", marginTop: theme.cadastro.spacing.submitTop },
  error: { color: theme.colors.danger, marginTop: theme.spacing.lg, textAlign: "center", ...theme.typography.cadastroLoginPrompt },
  submitText: { color: theme.colors.canvas, ...theme.typography.cadastroButton },
  loginRow: { alignItems: "center", flexDirection: "row", justifyContent: "center", marginTop: theme.cadastro.spacing.submitToLogin },
  loginPrompt: { color: theme.colors.cadastroPlaceholder, marginRight: theme.cadastro.spacing.loginGap, ...theme.typography.cadastroLoginPrompt },
  loginLink: { color: theme.colors.cadastroLink, ...theme.typography.cadastroLoginLink },
});