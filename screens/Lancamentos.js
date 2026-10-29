import React, { useCallback, useMemo, useState } from "react";
import { ImageBackground, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import CatalogControl from "../components/CatalogControl";
import ProductCard from "../components/ProductCard";
import StoreFooter from "../components/StoreFooter";
import StoreHeader from "../components/StoreHeader";
import { useStore } from "../context/StoreContext";
import { categories } from "../data/products";
import { copy, theme } from "../theme";
import { goTo } from "../utils/navigation";

function FilterIcon() {
  return <Svg height={theme.lancamentos.size.filterIcon} viewBox="0 0 20 20" width={theme.lancamentos.size.filterIcon}><Path d="M5 6h10M5 10h10M5 14h10M3 6h.1M3 10h.1M3 14h.1" fill="none" stroke={theme.colors.catalogIcon} strokeLinecap="round" strokeWidth={theme.spacing.hairline} /></Svg>;
}

function SortIcon() {
  return <Svg height={theme.lancamentos.size.sortIcon} viewBox="0 0 20 20" width={theme.lancamentos.size.sortIcon}><Path d="m3 6 7 7 7-7" fill="none" stroke={theme.colors.catalogIcon} strokeLinecap="round" strokeLinejoin="round" strokeWidth={theme.spacing.hairline} /></Svg>;
}

export default function Lancamentos({ navigation, route }) {
  const category = route.params?.category;
  const insets = useSafeAreaInsets();
  const { favoriteIds, products, toggleFavorite } = useStore();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [statusMessage, setStatusMessage] = useState("");

  const visibleProducts = useMemo(() => {
    const filteredProducts = category ? products.filter((product) => product.category === category) : products;
    return sortOrder === "alphabetical" ? [...filteredProducts].sort((first, second) => first.name.localeCompare(second.name)) : filteredProducts;
  }, [category, products, sortOrder]);
  const openFilters = useCallback(() => setIsFilterOpen((currentValue) => !currentValue), []);
  const toggleSort = useCallback(() => setSortOrder((currentOrder) => { const nextOrder = currentOrder === "newest" ? "alphabetical" : "newest"; setStatusMessage(nextOrder === "alphabetical" ? copy.sortAscending : copy.sortDescending); return nextOrder; }), []);

  const openProduct = useCallback((product) => navigation.navigate("Produto", { productId: product.id }), [navigation]);

  const handleBack = useCallback(() => {
    goTo(navigation, "Home");
  }, [navigation]);

  return (
    <ScrollView bounces={false} contentContainerStyle={styles.content} style={styles.screen}>
      <ImageBackground source={require("../assets/banner-bg.png")} style={styles.hero}>
        <View style={[styles.heroOverlay, { paddingTop: Math.max(insets.top, StatusBar.currentHeight || 0) + 10 }]}>
          <StoreHeader />
          <View style={styles.heroCopy}><Text style={styles.heroTitle}>{copy.catalogHeroTitle}</Text><Text style={styles.heroBody}>{copy.catalogHeroBody}</Text></View>
        </View>
      </ImageBackground>
      <View style={styles.catalog}>
        <Pressable accessibilityRole="button" onPress={handleBack}><Text style={styles.backLink}>{copy.catalogBack}</Text></Pressable>
        <View style={styles.heading}><Text style={styles.title}>{category || copy.catalogTitle}</Text><Text style={styles.count}>{copy.catalogResults(visibleProducts.length)}</Text></View>
        <View style={styles.controls}>
          <CatalogControl label={copy.filterAction} leadingIcon={<FilterIcon />} onPress={openFilters} />
          <CatalogControl label={copy.sortAction} leadingIcon={<SortIcon />} onPress={toggleSort} />
        </View>
        {isFilterOpen ? (
          <View style={styles.filterRow}>
            {[undefined, ...categories].map((option) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: option === category }}
                key={option || "all"}
                onPress={() => navigation.setParams({ category: option })}
                style={[styles.filterChip, option === category ? styles.filterChipSelected : null]}
              >
                <Text style={[styles.filterChipText, option === category ? styles.filterChipTextSelected : null]}>{option || copy.filterAll}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        {statusMessage ? <Text accessibilityLiveRegion="polite" style={styles.status}>{statusMessage}</Text> : null}
        {visibleProducts.length ? null : <Text style={styles.status}>{copy.searchEmpty}</Text>}
        <View style={styles.grid}>{visibleProducts.map((product) => <ProductCard isFavorite={favoriteIds.includes(product.id)} key={product.id} onAddToBag={() => openProduct(product)} onPress={() => openProduct(product)} onToggleFavorite={() => toggleFavorite(product.id)} product={product} variant="catalog" />)}</View>
      </View>
      <View style={styles.footer}><StoreFooter /></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.colors.canvas, flex: theme.flex.full },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm, marginTop: theme.spacing.md },
  filterChip: { borderColor: theme.colors.catalogControlBorder, borderRadius: theme.radius.pill, borderWidth: theme.spacing.hairline, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs },
  filterChipSelected: { backgroundColor: theme.colors.ink, borderColor: theme.colors.ink },
  filterChipText: { color: theme.colors.text, ...theme.typography.chip },
  filterChipTextSelected: { color: theme.colors.canvas }, content: { backgroundColor: theme.colors.canvas },
  hero: { height: theme.lancamentos.size.heroHeight + 30 }, 
  heroOverlay: { backgroundColor: theme.colors.catalogHeroOverlay, flex: theme.flex.full },
  heroCopy: { alignItems: "center", paddingHorizontal: theme.lancamentos.spacing.heroHorizontal, paddingTop: theme.lancamentos.spacing.heroTitleTop }, heroTitle: { color: theme.colors.canvas, textAlign: "center", ...theme.typography.catalogHeroTitle }, heroBody: { color: theme.colors.canvas, marginTop: theme.lancamentos.spacing.heroTitleToBody, textAlign: "center", ...theme.typography.catalogHeroBody },
  catalog: { paddingHorizontal: theme.lancamentos.spacing.sectionHorizontal, paddingTop: theme.lancamentos.spacing.sectionTop }, backLink: { color: theme.colors.brand, ...theme.typography.catalogBack }, heading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: theme.lancamentos.spacing.backToTitle }, title: { color: theme.colors.text, ...theme.typography.catalogTitle }, count: { color: theme.colors.catalogStatus, ...theme.typography.catalogCount },
  controls: { flexDirection: "row", gap: theme.lancamentos.spacing.controlGap, marginTop: theme.lancamentos.spacing.headingToControls }, status: { color: theme.colors.catalogStatus, marginTop: theme.lancamentos.spacing.statusTop, textAlign: "center", ...theme.typography.catalogCount }, grid: { flexDirection: "row", flexWrap: "wrap", gap: theme.lancamentos.spacing.gridGap, marginTop: theme.lancamentos.spacing.gridTop }, footer: { marginTop: theme.lancamentos.spacing.footerTop },
});