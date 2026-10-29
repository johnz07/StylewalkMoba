import React from "react";
import { ImageBackground, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import StoreFooter from "../components/StoreFooter";
import StoreHeader from "../components/StoreHeader";
import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";
import { copy, theme } from "../theme";

export default function Home({ navigation }) {
  const { favoriteIds, products, toggleFavorite } = useStore();
  const featuredProducts = products.filter((product) => product.featured);
  const openProduct = (product) => navigation.navigate("Produto", { productId: product.id });

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={styles.hero}>
        <ImageBackground source={require("../assets/hero-banner.png")} style={styles.heroImage}>
          <View style={styles.heroOverlay}>
            <StoreHeader />
            <View style={styles.chipRow}>
              <View style={styles.dropChip}><Text style={styles.chipText}>{copy.newDrop}</Text></View>
              <View style={styles.shortChip}><Text style={styles.chipText}>{copy.new}</Text></View>
              <View style={styles.shortChip}><Text style={styles.chipText}>{copy.limited}</Text></View>
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>{copy.heroTitle}</Text>
              <Text style={styles.heroDescription}>{copy.heroBody}</Text>
              <Pressable accessibilityLabel={copy.collectionLabel} accessibilityRole="button" onPress={() => navigation.navigate("Lancamentos")} style={styles.collectionButton}>
                <Text style={styles.collectionButtonText}>{copy.collectionAction}</Text>
              </Pressable>
            </View>
          </View>
        </ImageBackground>
      </View>
      <View style={styles.featuredSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{copy.featuredTitle}</Text>

          <Pressable accessibilityRole="button" onPress={() => navigation.navigate("Lancamentos")}>
            <Text style={styles.seeAll}>{copy.seeAll}</Text>
          </Pressable>

        </View>
        <View style={styles.productList}>
          {featuredProducts.map((product) => (
            <ProductCard
              isFavorite={favoriteIds.includes(product.id)}
              key={product.id}
              onAddToBag={() => openProduct(product)}
              onPress={() => openProduct(product)}
              onToggleFavorite={() => toggleFavorite(product.id)}
              product={{ ...product, image: product.featuredImage || product.image }}
            />
          ))}
        </View>
      </View>
      <StoreFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.canvas,
    flex: theme.flex.full,
  },
  content: {
    backgroundColor: theme.colors.canvas,
  },
  hero: {
    height: theme.size.heroHeight,
  },
  heroImage: {
    height: "100%",
    width: "100%",
  },
  heroOverlay: {
    backgroundColor: theme.colors.heroOverlay,
    flex: theme.flex.full,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) : 44,
  },
  chipRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  dropChip: {
    backgroundColor: theme.colors.chipOverlay,
    borderColor: theme.colors.canvas,
    borderRadius: theme.radius.pill,
    borderWidth: theme.spacing.hairline,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  shortChip: {
    backgroundColor: theme.colors.chipOverlay,
    borderColor: theme.colors.canvas,
    borderRadius: theme.radius.pill,
    borderWidth: theme.spacing.hairline,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  chipText: {
    color: theme.colors.canvas,
    ...theme.typography.chip,
  },
  heroCopy: {
    alignItems: "center",
    flex: theme.flex.full,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  heroTitle: {
    color: theme.colors.canvas,
    textAlign: "center",
    ...theme.typography.heroTitle,
  },
  heroDescription: {
    color: theme.colors.canvas,
    marginTop: theme.spacing.md,
    textAlign: "center",
    ...theme.typography.heroBody,
  },
  collectionButton: {
    backgroundColor: theme.colors.canvas,
    borderRadius: theme.radius.pill,
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  collectionButtonText: {
    color: theme.colors.ink,
    ...theme.typography.heroButton,
  },
  featuredSection: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: theme.colors.text,
    ...theme.typography.sectionTitle,
  },
  seeAll: {
    color: theme.colors.brand,
    ...theme.typography.link,
  },
  productList: {
    gap: theme.spacing.lg,
  },
});