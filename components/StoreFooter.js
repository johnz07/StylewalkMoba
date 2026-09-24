import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ChevronDown from "../assets/Chevron-down.svg";
import { copy, theme } from "../theme";

function FooterSection({ title }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.section}>
      <Pressable accessibilityRole="button" onPress={() => setIsOpen((currentValue) => !currentValue)} style={styles.sectionButton}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <ChevronDown height={theme.size.chevron} style={isOpen ? styles.chevronOpen : null} width={theme.size.chevron} />
      </Pressable>
      {isOpen ? <Text style={styles.sectionContent}>{copy.footerDescription}</Text> : null}
    </View>
  );
}

export default function StoreFooter() {
  return (
    <View style={styles.footer}>
      <Text style={styles.brand}>{copy.footerBrand}</Text>
      <Text style={styles.description}>{copy.footerDescription}</Text>
      <FooterSection title={copy.categories} />
      <FooterSection title={copy.information} />
      <FooterSection title={copy.contact} />
      <View style={styles.legalLinks}>
        <Text style={styles.legal}>{copy.privacy}</Text>
        <Text style={styles.legal}>{copy.cookiePolicy}</Text>
        <Text style={styles.legal}>{copy.terms}</Text>
      </View>
      <Text style={styles.copyright}>{copy.copyright}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: theme.colors.ink,
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  brand: {
    color: theme.colors.canvas,
    ...theme.typography.footerTitle,
  },
  description: {
    color: theme.colors.canvas,
    ...theme.typography.footerBody,
  },
  section: {
    borderBottomColor: theme.colors.footerRule,
    borderBottomWidth: theme.spacing.hairline,
  },
  sectionButton: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.canvas,
    ...theme.typography.footerLink,
  },
  sectionContent: {
    color: theme.colors.canvas,
    paddingBottom: theme.spacing.sm,
    ...theme.typography.footerBody,
  },
  chevronOpen: {
    transform: [{ rotate: theme.rotation.open }],
  },
  legalLinks: {
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  legal: {
    color: theme.colors.canvas,
    ...theme.typography.legal,
  },
  copyright: {
    color: theme.colors.canvas,
    marginTop: theme.spacing.xl,
    textAlign: "center",
    ...theme.typography.legal,
  },
});
