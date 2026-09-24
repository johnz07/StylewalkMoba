import React, { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BoxIcon from "../assets/box.svg";
import LogoutIcon from "../assets/log-out.svg";
import PlusCircleIcon from "../assets/plus-circle.svg";
import AdminInventoryCard from "../components/AdminInventoryCard";
import AdminTextField from "../components/AdminTextField";
import { copy, theme } from "../theme";

const inventoryImages = [
  require("../assets/Image-Placeholder.png"),
  require("../assets/Rectangle.png"),
  require("../assets/Rectangle1.png"),
  require("../assets/Rectangle2.png"),
];

const initialFormValues = {
  name: "",
  category: "",
  imageUrl: "",
  price: "",
  description: "",
};

const initialInventoryItems = [
  { id: "ultraboost-runner", name: copy.adminUltraBoost, category: copy.adminMasculine, imageUrl: "", price: copy.adminUltraBoostPrice, description: copy.adminUltraBoostDescription, image: inventoryImages[0] },
  { id: "air-zoom-pegasus", name: copy.adminAirZoom, category: copy.adminFeminine, imageUrl: "", price: copy.adminAirZoomPrice, description: copy.adminAirZoomDescription, image: inventoryImages[1] },
  { id: "classic-leather", name: copy.classicLeather, category: copy.unisex, imageUrl: "", price: copy.classicLeatherPrice, description: copy.classicLeatherDescription, image: inventoryImages[2] },
  { id: "future-rider", name: copy.futureRider, category: copy.feminine, imageUrl: "", price: copy.futureRiderPrice, description: copy.futureRiderDescription, image: inventoryImages[3] },
];

export default function Admin({ navigation }) {
  const insets = useSafeAreaInsets();
  const [formValues, setFormValues] = useState(initialFormValues);
  const [inventoryItems, setInventoryItems] = useState(initialInventoryItems);
  const [editingItemId, setEditingItemId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const updateField = useCallback((field, value) => {
    setFormValues((currentValues) => ({ ...currentValues, [field]: value }));
  }, []);

  const editProduct = useCallback((item) => {
    setEditingItemId(item.id);
    setFormValues({
      name: item.name,
      category: item.category,
      imageUrl: item.imageUrl,
      price: item.price,
      description: item.description,
    });
    setStatusMessage(copy.adminEditFeedback);
  }, []);

  const deleteProduct = useCallback((itemId) => {
    setInventoryItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
    if (editingItemId === itemId) {
      setEditingItemId("");
      setFormValues(initialFormValues);
    }
    setStatusMessage(copy.adminDeleteFeedback);
  }, [editingItemId]);

  const addProduct = useCallback(() => {
    if (!formValues.name.trim()) {
      setStatusMessage(copy.adminNameRequired);
      return;
    }

    const updatedProduct = {
      id: editingItemId || `${formValues.name}-${inventoryItems.length}`,
      ...formValues,
      image: inventoryImages[inventoryItems.length % inventoryImages.length],
      price: formValues.price || copy.adminDefaultPrice,
    };

    setInventoryItems((currentItems) => editingItemId
      ? currentItems.map((item) => (item.id === editingItemId ? { ...item, ...updatedProduct, image: item.image } : item))
      : [...currentItems, updatedProduct]);
    setEditingItemId("");
    setFormValues(initialFormValues);
    setStatusMessage(editingItemId ? copy.adminUpdateFeedback : copy.adminAddFeedback);
  }, [editingItemId, formValues, inventoryItems.length]);

  const logout = useCallback(() => {
    // Redireciona substituindo a pilha de navegação para evitar que volte apertando 'Voltar'
    navigation.replace("Login");
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <StatusBar backgroundColor={theme.colors.adminHeader} barStyle="light-content" />
      
      {/* Cabeçalho com preenchimento seguro de status bar */}
      <View style={[styles.header, { paddingTop: insets.top, height: theme.admin.size.headerHeight + insets.top }]}>
        <View style={styles.brandGroup}>
          <Text style={styles.brand}>{copy.brand}</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>{copy.adminBadge}</Text></View>
        </View>
        <Pressable accessibilityLabel={copy.adminLogoutLabel} accessibilityRole="button" onPress={logout} style={styles.logoutButton}>
          <LogoutIcon height={theme.admin.size.logoutIcon} width={theme.admin.size.logoutIcon} />
          <Text style={styles.logoutText}>{copy.adminLogout}</Text>
        </Pressable>
      </View>

      <ScrollView bounces={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          <View style={styles.formTitleRow}>
            <PlusCircleIcon height={theme.admin.size.formIcon} width={theme.admin.size.formIcon} />
            <Text style={styles.formTitle}>{copy.adminAddProduct}</Text>
          </View>
          <View style={styles.fields}>
            <AdminTextField label={copy.adminNameLabel} onChangeText={(value) => updateField("name", value)} placeholder={copy.adminNamePlaceholder} value={formValues.name} />
            <AdminTextField label={copy.adminCategoryLabel} onChangeText={(value) => updateField("category", value)} placeholder={copy.adminCategoryPlaceholder} value={formValues.category} />
            <AdminTextField label={copy.adminImageUrlLabel} onChangeText={(value) => updateField("imageUrl", value)} placeholder={copy.adminImageUrlPlaceholder} value={formValues.imageUrl} />
            <AdminTextField label={copy.adminPriceLabel} onChangeText={(value) => updateField("price", value)} placeholder={copy.adminPricePlaceholder} value={formValues.price} />
            <AdminTextField label={copy.adminDescriptionLabel} multiline onChangeText={(value) => updateField("description", value)} placeholder={copy.adminDescriptionPlaceholder} value={formValues.description} />
          </View>
          <Pressable accessibilityLabel={copy.adminAddProductLabel} accessibilityRole="button" onPress={addProduct} style={styles.submitButton}>
            <Text style={styles.submitText}>{copy.adminAddProductAction}</Text>
          </Pressable>
          {statusMessage ? <Text accessibilityLiveRegion="polite" style={styles.status}>{statusMessage}</Text> : null}
        </View>

        <View style={styles.inventoryHeader}>
          <View style={styles.inventoryTitleRow}>
            <BoxIcon height={theme.admin.size.inventoryIcon} width={theme.admin.size.inventoryIcon} />
            <Text style={styles.inventoryTitle}>{copy.adminInventory}</Text>
          </View>
          <Text style={styles.inventoryCount}>{copy.adminItemCount(inventoryItems.length)}</Text>
        </View>
        <View style={styles.inventoryList}>
          {inventoryItems.map((item) => (
            <AdminInventoryCard item={item} key={item.id} onDelete={() => deleteProduct(item.id)} onEdit={() => editProduct(item)} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.adminCanvas,
    flex: theme.flex.full,
  },
  header: {
    alignItems: "center",
    backgroundColor: theme.colors.adminHeader,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.admin.spacing.headerHorizontal,
  },
  brandGroup: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.admin.spacing.headerGap,
  },
  brand: {
    color: theme.colors.adminHeaderText,
    ...theme.admin.typography.brand,
  },
  badge: {
    backgroundColor: theme.colors.adminBrand,
    borderRadius: theme.admin.radius.badge,
    paddingHorizontal: theme.admin.spacing.badgeHorizontal,
    paddingVertical: theme.admin.spacing.badgeVertical,
  },
  badgeText: {
    color: theme.colors.adminHeaderText,
    ...theme.admin.typography.badge,
  },
  logoutButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.admin.spacing.logoutGap,
  },
  logoutText: {
    color: theme.colors.adminHeaderMuted,
    ...theme.admin.typography.logout,
  },
  content: {
    paddingBottom: theme.admin.spacing.contentBottom,
    paddingHorizontal: theme.admin.spacing.contentHorizontal,
    paddingTop: theme.admin.spacing.contentTop,
  },
  formCard: {
    backgroundColor: theme.colors.adminCard,
    borderColor: theme.colors.adminBorder,
    borderRadius: theme.admin.radius.form,
    borderWidth: theme.spacing.hairline,
    padding: theme.admin.spacing.formInset,
  },
  formTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.admin.spacing.formTitleGap,
  },
  formTitle: {
    color: theme.colors.adminInk,
    ...theme.admin.typography.formTitle,
  },
  fields: {
    gap: theme.admin.spacing.fieldGap,
    marginTop: theme.admin.spacing.formTitleToFields,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: theme.colors.adminHeader,
    borderRadius: theme.admin.radius.submit,
    height: theme.admin.size.submitHeight,
    justifyContent: "center",
    marginTop: theme.admin.spacing.fieldsToSubmit,
  },
  submitText: {
    color: theme.colors.adminHeaderText,
    ...theme.admin.typography.submit,
  },
  status: {
    color: theme.colors.adminBrand,
    marginTop: theme.admin.spacing.statusTop,
    textAlign: "center",
    ...theme.admin.typography.status,
  },
  inventoryHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.admin.spacing.formToInventory,
  },
  inventoryTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.admin.spacing.inventoryTitleGap,
  },
  inventoryTitle: {
    color: theme.colors.adminInk,
    ...theme.admin.typography.inventoryTitle,
  },
  inventoryCount: {
    color: theme.colors.adminMuted,
    ...theme.admin.typography.inventoryCount,
  },
  inventoryList: {
    gap: theme.admin.spacing.inventoryGap,
    marginTop: theme.admin.spacing.inventoryToList,
  },
});