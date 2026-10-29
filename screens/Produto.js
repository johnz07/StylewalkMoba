import React, { useState } from "react";
import { Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeartIcon from "../assets/Heart.svg";
import StoreFooter from "../components/StoreFooter";
import StoreHeader from "../components/StoreHeader";
import { useCart } from "../context/CartContext";
import { useStore } from "../context/StoreContext";
import { copy, theme } from "../theme";
import { formatPrice } from "../utils/format";
import { goTo } from "../utils/navigation";

export default function Produto({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { favoriteIds, getProduct, toggleFavorite } = useStore();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [wasAdded, setWasAdded] = useState(false);
  const product = getProduct(route.params?.productId);

  const addToCart = () => {
    if (!selectedSize) {
      setWasAdded(false);
      setStatusMessage(copy.productSizeRequired);
      return;
    }
    addItem(product, selectedSize);
    setWasAdded(true);
    setStatusMessage(copy.productAdded);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.headerArea, { paddingTop: Math.max(insets.top, StatusBar.currentHeight || 0) }]}>
        <StoreHeader />
      </View>
      <ScrollView bounces={false} contentContainerStyle={styles.content} style={styles.scrollView}>
        {product ? (
          <View>
            <View style={styles.imageFrame}>
              <Image accessibilityLabel={product.name} source={product.image} style={styles.image} />
              <Pressable
                accessibilityLabel={favoriteIds.includes(product.id) ? copy.removeFavoriteLabel : copy.favoriteLabel}
                accessibilityRole="button"
                onPress={() => toggleFavorite(product.id)}
                style={styles.favoriteButton}
              >
                <HeartIcon height={theme.size.icon} opacity={favoriteIds.includes(product.id) ? theme.opacity.favoriteActive : theme.opacity.favoriteIdle} width={theme.size.icon} />
              </Pressable>
            </View>
            <View style={styles.details}>
              <Pressable accessibilityRole="button" onPress={() => navigation.goBack()}><Text style={styles.backLink}>{copy.productBack}</Text></Pressable>
              <Text style={styles.category}>{product.category}</Text>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.price}>{formatPrice(product.price)}</Text>
              <Text style={styles.description}>{product.description}</Text>

              <Text style={styles.sectionTitle}>{copy.productSizeTitle}</Text>
              <View style={styles.sizeGrid}>
                {product.sizes.map((size) => {
                  const isSelected = size === selectedSize;
                  return (
                    <Pressable
                      accessibilityLabel={`${copy.cartSizeLabel} ${size}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      key={size}
                      onPress={() => { setSelectedSize(size); setStatusMessage(""); }}
                      style={[styles.sizeOption, isSelected ? styles.sizeOptionSelected : null]}
                    >
                      <Text style={[styles.sizeText, isSelected ? styles.sizeTextSelected : null]}>{size}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable accessibilityLabel={copy.productAddToCart} accessibilityRole="button" onPress={addToCart} style={styles.addButton}>
                <Text style={styles.addButtonText}>{copy.productAddToCart}</Text>
              </Pressable>
              {statusMessage ? (
                <Text accessibilityLiveRegion="polite" style={[styles.status, wasAdded ? styles.statusSuccess : null]}>{statusMessage}</Text>
              ) : null}
              {wasAdded ? (
                <Pressable accessibilityRole="button" onPress={() => goTo(navigation, "Carrinho")} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>{copy.productGoToCart}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.details}>
            <Text style={styles.name}>{copy.productNotFound}</Text>
            <Pressable accessibilityRole="button" onPress={() => goTo(navigation, "Home")}><Text style={styles.backLink}>{copy.catalogBack}</Text></Pressable>
          </View>
        )}
        <StoreFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.colors.ink, flex: theme.flex.full },
  headerArea: { backgroundColor: theme.colors.ink },
  scrollView: { backgroundColor: theme.colors.canvas },
  content: { flexGrow: theme.flex.full },
  imageFrame: { backgroundColor: theme.colors.surface, height: 320, position: "relative" },
  image: { height: "100%", resizeMode: "cover", width: "100%" },
  favoriteButton: { alignItems: "center", backgroundColor: theme.colors.canvas, borderRadius: theme.radius.pill, height: 36, justifyContent: "center", position: "absolute", right: theme.spacing.lg, top: theme.spacing.lg, width: 36 },
  details: { paddingBottom: theme.spacing.section, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg },
  backLink: { color: theme.colors.brand, ...theme.typography.catalogBack },
  category: { color: theme.colors.mutedText, marginTop: theme.spacing.lg, textTransform: "uppercase", ...theme.typography.chip },
  name: { color: theme.colors.text, fontSize: 22, fontWeight: "900", lineHeight: 26, marginTop: theme.spacing.xs },
  price: { color: theme.colors.brand, fontSize: 18, fontWeight: "900", lineHeight: 22, marginTop: theme.spacing.sm },
  description: { color: theme.colors.mutedText, fontSize: 13, lineHeight: 18, marginTop: theme.spacing.md },
  sectionTitle: { color: theme.colors.text, marginTop: theme.spacing.xxl, ...theme.typography.sectionTitle },
  sizeGrid: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm, marginTop: theme.spacing.md },
  sizeOption: { alignItems: "center", borderColor: theme.colors.cartCardBorder, borderRadius: theme.radius.small, borderWidth: theme.spacing.hairline, height: 44, justifyContent: "center", width: 56 },
  sizeOptionSelected: { backgroundColor: theme.colors.ink, borderColor: theme.colors.ink },
  sizeText: { color: theme.colors.text, fontSize: 13, fontWeight: "700" },
  sizeTextSelected: { color: theme.colors.canvas },
  addButton: { alignItems: "center", backgroundColor: theme.colors.ink, borderRadius: theme.radius.small, height: 48, justifyContent: "center", marginTop: theme.spacing.xxl },
  addButtonText: { color: theme.colors.canvas, fontSize: 13, fontWeight: "900", letterSpacing: 0.3 },
  status: { color: theme.colors.danger, marginTop: theme.spacing.md, textAlign: "center", ...theme.typography.cartFeedback },
  statusSuccess: { color: theme.colors.cartSuccess },
  secondaryButton: { alignItems: "center", borderColor: theme.colors.ink, borderRadius: theme.radius.small, borderWidth: theme.spacing.hairline, height: 44, justifyContent: "center", marginTop: theme.spacing.md },
  secondaryButtonText: { color: theme.colors.ink, fontSize: 12, fontWeight: "900" },
});
