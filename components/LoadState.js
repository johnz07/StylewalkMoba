import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { copy, theme } from "../theme";

// Estado de carregamento ou de erro de uma busca na API, com "Tentar novamente".
export default function LoadState({ message, onRetry, status }) {
  if (status === "loading") {
    return (
      <View accessibilityLabel={copy.loadingLabel} style={styles.container}>
        <ActivityIndicator color={theme.colors.brand} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text accessibilityLiveRegion="polite" style={styles.message}>{message || copy.apiGenericError}</Text>
      {onRetry ? (
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>{copy.retryAction}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: theme.spacing.lg, justifyContent: "center", paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.section },
  message: { color: theme.colors.mutedText, textAlign: "center", ...theme.typography.productBody },
  retryButton: { backgroundColor: theme.colors.ink, borderRadius: theme.radius.pill, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md },
  retryText: { color: theme.colors.canvas, ...theme.typography.heroButton },
});
