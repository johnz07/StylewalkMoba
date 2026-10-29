import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import HeartIcon from "../assets/Heart.svg";
import BagIcon from "../assets/Shopping-bag.svg";
import { copy, theme } from "../theme";
import { formatPrice } from "../utils/format";

function CompactBagIcon() {
  return <Svg height={theme.lancamentos.size.bagIcon} viewBox="0 0 20 20" width={theme.lancamentos.size.bagIcon}><Path d="M4 6h12v11H4zM7 8V5a3 3 0 0 1 6 0v3" fill="none" stroke={theme.colors.catalogIcon} strokeWidth={theme.spacing.hairline} /></Svg>;
}

export default function ProductCard({ isFavorite, onAddToBag, onPress, onToggleFavorite, product, variant = "featured" }) {
  const isCatalog = variant === "catalog";
  const favoriteLabel = isFavorite ? copy.removeFavoriteLabel : copy.favoriteLabel;
  const category = product.category || copy.running;

  return (
    <Pressable accessibilityLabel={product.name} accessibilityRole="button" onPress={onPress} style={[styles.card, isCatalog ? styles.catalogCard : null]}>
      <View style={[styles.imageFrame, isCatalog ? styles.catalogImageFrame : null]}>
        <Image accessibilityLabel={product.name} source={product.image} style={styles.image} />
        <View style={[styles.tag, isCatalog ? styles.catalogTag : null]}><Text style={styles.tagText}>{category}</Text></View>
        <View style={[styles.newTag, isCatalog ? styles.catalogNewTag : null]}><Text style={styles.tagText}>{copy.productNew}</Text></View>
        <Pressable accessibilityLabel={favoriteLabel} accessibilityRole="button" onPress={onToggleFavorite} style={[styles.favoriteButton, isCatalog ? styles.catalogFavoriteButton : null]}>
          <HeartIcon height={isCatalog ? theme.lancamentos.size.favoriteIcon : theme.size.icon} opacity={isFavorite ? theme.opacity.favoriteActive : theme.opacity.favoriteIdle} width={isCatalog ? theme.lancamentos.size.favoriteIcon : theme.size.icon} />
        </Pressable>
      </View>
      <View style={[styles.details, isCatalog ? styles.catalogDetails : null]}>
        <Text numberOfLines={1} style={[styles.title, isCatalog ? styles.catalogTitle : null]}>{product.name}</Text>
        <Text numberOfLines={2} style={[styles.description, isCatalog ? styles.catalogDescription : null]}>{product.description}</Text>
        <View style={[styles.priceRow, isCatalog ? styles.catalogPriceRow : null]}>
          <Text style={[styles.price, isCatalog ? styles.catalogPrice : null]}>{formatPrice(product.price)}</Text>
          <Pressable accessibilityLabel={copy.addToBagLabel} accessibilityRole="button" onPress={onAddToBag} style={[styles.bagButton, isCatalog ? styles.catalogBagButton : null]}>
            {isCatalog ? <CompactBagIcon /> : <BagIcon height={theme.size.icon} width={theme.size.icon} />}
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.canvas, borderColor: theme.colors.cardBorder, borderRadius: theme.radius.medium, borderWidth: theme.spacing.hairline, overflow: "hidden", shadowColor: theme.colors.ink, shadowOpacity: theme.opacity.cardShadow, shadowRadius: theme.spacing.sm, elevation: theme.elevation.card },
  catalogCard: { borderWidth: theme.spacing.none, borderRadius: theme.spacing.none, elevation: theme.elevation.none, flex: theme.flex.full, overflow: "visible", shadowOpacity: theme.opacity.none },
  imageFrame: { height: theme.size.productImageHeight, position: "relative" },
  catalogImageFrame: { borderRadius: theme.lancamentos.radius.productImage, height: theme.lancamentos.size.productImageHeight, overflow: "hidden" },
  image: { height: "100%", resizeMode: "cover", width: "100%" },
  tag: { backgroundColor: theme.colors.ink, borderRadius: theme.radius.pill, left: theme.spacing.md, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs, position: "absolute", top: theme.spacing.md },
  catalogTag: { borderRadius: theme.lancamentos.radius.tag, left: theme.lancamentos.spacing.tagInset, paddingHorizontal: theme.lancamentos.spacing.tagHorizontal, paddingVertical: theme.lancamentos.spacing.tagVertical, top: theme.lancamentos.spacing.tagInset },
  newTag: { backgroundColor: theme.colors.ink, borderRadius: theme.radius.pill, bottom: theme.spacing.md, left: theme.spacing.md, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs, position: "absolute" },
  catalogNewTag: { borderRadius: theme.lancamentos.radius.tag, bottom: theme.lancamentos.spacing.tagInset, left: theme.lancamentos.spacing.tagInset, paddingHorizontal: theme.lancamentos.spacing.tagHorizontal, paddingVertical: theme.lancamentos.spacing.tagVertical },
  tagText: { color: theme.colors.canvas, ...theme.typography.tag },
  favoriteButton: { alignItems: "center", backgroundColor: theme.colors.canvas, borderRadius: theme.radius.pill, height: theme.size.favoriteButton, justifyContent: "center", position: "absolute", right: theme.spacing.md, top: theme.spacing.md, width: theme.size.favoriteButton },
  catalogFavoriteButton: { backgroundColor: theme.colors.transparent, height: theme.lancamentos.size.favoriteIcon, right: theme.lancamentos.spacing.tagInset, top: theme.lancamentos.spacing.tagInset, width: theme.lancamentos.size.favoriteIcon },
  details: { gap: theme.spacing.xs, padding: theme.spacing.md },
  catalogDetails: { gap: theme.lancamentos.spacing.productDetailGap, paddingHorizontal: theme.spacing.xs, paddingTop: theme.lancamentos.spacing.productDetailTop },
  title: { color: theme.colors.text, ...theme.typography.productTitle }, catalogTitle: { ...theme.typography.catalogProductTitle },
  description: { color: theme.colors.mutedText, ...theme.typography.productBody }, catalogDescription: { ...theme.typography.catalogProductBody },
  priceRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: theme.spacing.sm }, catalogPriceRow: { marginTop: theme.lancamentos.spacing.productPriceTop },
  price: { color: theme.colors.brand, ...theme.typography.price }, catalogPrice: { ...theme.typography.catalogPrice },
  bagButton: { alignItems: "center", backgroundColor: theme.colors.ink, borderRadius: theme.radius.pill, height: theme.size.bagButton, justifyContent: "center", width: theme.size.bagButton },
  catalogBagButton: { backgroundColor: theme.colors.transparent, height: theme.lancamentos.size.bagIcon, width: theme.lancamentos.size.bagIcon },
});
