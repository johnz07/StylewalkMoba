import React from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ArrowRightIcon from "../assets/arrow-right.svg";
import LoadState from "../components/LoadState";
import ProductCard from "../components/ProductCard";
import StoreFooter from "../components/StoreFooter";
import StoreHeader from "../components/StoreHeader";
import { useStore } from "../context/StoreContext";
import { copy, theme } from "../theme";
import { goTo } from "../utils/navigation";

// Produtos favoritados (salvos no aparelho; não exigem login). Desfavoritar remove da lista na hora.
export default function Favoritos({ navigation }) {
  const insets = useSafeAreaInsets();
  const { errorMessage, favoriteIds, products, reload, status, toggleFavorite } = useStore();
  const favoriteProducts = products.filter((product) => favoriteIds.includes(product.id));
  const openProduct = (product) => navigation.navigate("Produto", { productId: product.id });

  return (
    <View style={styles.screen}>
      <View style={[styles.headerArea, { paddingTop: Math.max(insets.top, StatusBar.currentHeight || theme.cart.size.statusBarFallback) }]}>
        <StoreHeader />
      </View>
      <ScrollView bounces={false} contentContainerStyle={styles.content} style={styles.scrollView}>
        <View style={styles.favoritesContent}>
          <Pressable accessibilityRole="button" onPress={() => goTo(navigation, "Home")}>
            <Text style={styles.backLink}>{copy.catalogBack}</Text>
          </Pressable>
          <Text style={styles.title}>{copy.favoritesTitle}</Text>

          {status !== "ready" ? (
            <LoadState message={errorMessage} onRetry={reload} status={status} />
          ) : favoriteProducts.length ? (
            <>
              <Text style={styles.subtitle}>{copy.favoritesCount(favoriteProducts.length)}</Text>
              <View style={styles.grid}>
                {favoriteProducts.map((product) => (
                  <ProductCard
                    isFavorite
                    key={product.id}
                    onAddToBag={() => openProduct(product)}
                    onPress={() => openProduct(product)}
                    onToggleFavorite={() => toggleFavorite(product.id)}
                    product={product}
                    variant="catalog"
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{copy.favoritesEmpty}</Text>
              <Pressable accessibilityRole="button" onPress={() => goTo(navigation, "Lancamentos", { badge: undefined, category: undefined })} style={styles.browseButton}>
                <Text style={styles.browseText}>{copy.favoritesBrowse}</Text>
                <ArrowRightIcon height={theme.cart.size.continueIcon} width={theme.cart.size.continueIcon} />
              </Pressable>
            </View>
          )}
        </View>
        <StoreFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.colors.ink, flex: theme.flex.full },
  headerArea: { backgroundColor: theme.colors.ink },
  scrollView: { backgroundColor: theme.colors.cartCanvas },
  content: { flexGrow: theme.flex.full },
  favoritesContent: {
    backgroundColor: theme.colors.cartCanvas,
    flexGrow: theme.flex.full,
    paddingBottom: theme.cart.spacing.contentBottom,
    paddingHorizontal: theme.cart.spacing.screenHorizontal,
    paddingTop: theme.cart.spacing.contentTop,
  },
  backLink: { color: theme.colors.brand, marginBottom: theme.spacing.md, ...theme.typography.catalogBack },
  title: { color: theme.colors.cartInk, ...theme.typography.cartTitle },
  subtitle: { color: theme.colors.cartMuted, ...theme.typography.cartSubtitle },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: theme.lancamentos.spacing.gridGap, marginTop: theme.cart.spacing.subtitleToItems },
  emptyState: { alignItems: "center", gap: theme.spacing.md, paddingVertical: theme.spacing.section },
  emptyText: { color: theme.colors.cartMuted, textAlign: "center", ...theme.typography.cartSubtitle },
  browseButton: { alignItems: "center", flexDirection: "row", gap: theme.cart.spacing.continueGap },
  browseText: { color: theme.colors.brand, ...theme.typography.cartContinue },
});
