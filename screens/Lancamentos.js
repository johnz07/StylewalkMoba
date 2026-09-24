import React, { useCallback, useMemo, useState } from "react";
import { ImageBackground, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import CatalogControl from "../components/CatalogControl";
import ProductCard from "../components/ProductCard";
import StoreFooter from "../components/StoreFooter";
import StoreHeader from "../components/StoreHeader";
import { copy, theme } from "../theme";

const products = [
  { id: "ultraboost-runner", name: copy.firstProduct, description: copy.firstProductDescription, price: copy.firstProductPrice, category: copy.masculine, image: require("../assets/product-image.png") },
  { id: "air-zoom-pegasus", name: copy.secondProduct, description: copy.secondProductDescription, price: copy.secondProductPrice, category: copy.feminine, image: require("../assets/product-image2.png") },
  { id: "classic-leather", name: copy.classicLeather, description: copy.classicLeatherDescription, price: copy.classicLeatherPrice, category: copy.unisex, image: require("../assets/product-image1.png") },
  { id: "future-rider", name: copy.futureRider, description: copy.futureRiderDescription, price: copy.futureRiderPrice, category: copy.feminine, image: require("../assets/product-image3.png") },
];

function FilterIcon() {
  return <Svg height={theme.lancamentos.size.filterIcon} viewBox="0 0 20 20" width={theme.lancamentos.size.filterIcon}><Path d="M5 6h10M5 10h10M5 14h10M3 6h.1M3 10h.1M3 14h.1" fill="none" stroke={theme.colors.catalogIcon} strokeLinecap="round" strokeWidth={theme.spacing.hairline} /></Svg>;
}

function SortIcon() {
  return <Svg height={theme.lancamentos.size.sortIcon} viewBox="0 0 20 20" width={theme.lancamentos.size.sortIcon}><Path d="m3 6 7 7 7-7" fill="none" stroke={theme.colors.catalogIcon} strokeLinecap="round" strokeLinejoin="round" strokeWidth={theme.spacing.hairline} /></Svg>;
}

export default function Lancamentos({ navigation }) {
  const insets = useSafeAreaInsets();
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [statusMessage, setStatusMessage] = useState("");

  const visibleProducts = useMemo(() => (sortOrder === "alphabetical" ? [...products].sort((first, second) => first.name.localeCompare(second.name)) : products), [sortOrder]);
  const toggleFavorite = useCallback((productId) => setFavoriteIds((currentIds) => currentIds.includes(productId) ? currentIds.filter((id) => id !== productId) : [...currentIds, productId]), []);
  const openFilters = useCallback(() => { setIsFilterOpen((currentValue) => !currentValue); setStatusMessage(copy.filtersOpen); }, []);
  const toggleSort = useCallback(() => setSortOrder((currentOrder) => { const nextOrder = currentOrder === "newest" ? "alphabetical" : "newest"; setStatusMessage(nextOrder === "alphabetical" ? copy.sortAscending : copy.sortDescending); return nextOrder; }), []);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Home");
    }
  }, [navigation]);

  return (
    <ScrollView bounces={false} contentContainerStyle={styles.content} style={styles.screen}>
      <ImageBackground source={require("../assets/banner-bg.png")} style={styles.hero}>
        <View style={[styles.heroOverlay, { paddingTop: Math.max(insets.top, StatusBar.currentHeight || 0) + 10 }]}>
          <StoreHeader onAccountPress={() => navigation.navigate("Login")} onBagPress={() => navigation.navigate("Carrinho")} />
          <View style={styles.heroCopy}><Text style={styles.heroTitle}>{copy.catalogHeroTitle}</Text><Text style={styles.heroBody}>{copy.catalogHeroBody}</Text></View>
        </View>
      </ImageBackground>
      <View style={styles.catalog}>
        <Pressable accessibilityRole="button" onPress={handleBack}><Text style={styles.backLink}>{copy.catalogBack}</Text></Pressable>
        <View style={styles.heading}><Text style={styles.title}>{copy.catalogTitle}</Text><Text style={styles.count}>{copy.catalogResults}</Text></View>
        <View style={styles.controls}>
          <CatalogControl label={copy.filterAction} leadingIcon={<FilterIcon />} onPress={openFilters} />
          <CatalogControl label={copy.sortAction} leadingIcon={<SortIcon />} onPress={toggleSort} />
        </View>
        {isFilterOpen || statusMessage ? <Text accessibilityLiveRegion="polite" style={styles.status}>{statusMessage}</Text> : null}
        <View style={styles.grid}>{visibleProducts.map((product) => <ProductCard isFavorite={favoriteIds.includes(product.id)} key={product.id} onAddToBag={() => setStatusMessage(copy.collectionMessage)} onToggleFavorite={() => toggleFavorite(product.id)} product={product} variant="catalog" />)}</View>
      </View>
      <View style={styles.footer}><StoreFooter /></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.colors.canvas, flex: theme.flex.full }, content: { backgroundColor: theme.colors.canvas },
  hero: { height: theme.lancamentos.size.heroHeight + 30 }, 
  heroOverlay: { backgroundColor: theme.colors.catalogHeroOverlay, flex: theme.flex.full },
  heroCopy: { alignItems: "center", paddingHorizontal: theme.lancamentos.spacing.heroHorizontal, paddingTop: theme.lancamentos.spacing.heroTitleTop }, heroTitle: { color: theme.colors.canvas, textAlign: "center", ...theme.typography.catalogHeroTitle }, heroBody: { color: theme.colors.canvas, marginTop: theme.lancamentos.spacing.heroTitleToBody, textAlign: "center", ...theme.typography.catalogHeroBody },
  catalog: { paddingHorizontal: theme.lancamentos.spacing.sectionHorizontal, paddingTop: theme.lancamentos.spacing.sectionTop }, backLink: { color: theme.colors.brand, ...theme.typography.catalogBack }, heading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: theme.lancamentos.spacing.backToTitle }, title: { color: theme.colors.text, ...theme.typography.catalogTitle }, count: { color: theme.colors.catalogStatus, ...theme.typography.catalogCount },
  controls: { flexDirection: "row", gap: theme.lancamentos.spacing.controlGap, marginTop: theme.lancamentos.spacing.headingToControls }, status: { color: theme.colors.catalogStatus, marginTop: theme.lancamentos.spacing.statusTop, textAlign: "center", ...theme.typography.catalogCount }, grid: { flexDirection: "row", flexWrap: "wrap", gap: theme.lancamentos.spacing.gridGap, marginTop: theme.lancamentos.spacing.gridTop }, footer: { marginTop: theme.lancamentos.spacing.footerTop },
});