import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BoxIcon from "../assets/box.svg";
import LogoutIcon from "../assets/log-out.svg";
import PlusCircleIcon from "../assets/plus-circle.svg";
import AdminInventoryCard from "../components/AdminInventoryCard";
import AdminTextField from "../components/AdminTextField";
import RequireAuth from "../components/RequireAuth";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { defaultSizes, placeholderImage } from "../data/products";
import { copy, theme } from "../theme";
import { formatPrice, parsePrice } from "../utils/format";

const initialFormValues = {
  name: "",
  category: "",
  imageUrl: "",
  price: "",
  description: "",
};

function AdminContent({ navigation }) {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { deleteProduct: removeProduct, products: inventoryItems, saveProduct } = useStore();
  const [formValues, setFormValues] = useState(initialFormValues);
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
      imageUrl: item.imageUrl || "",
      price: formatPrice(item.price),
      description: item.description,
    });
    setStatusMessage(copy.adminEditFeedback);
  }, []);

  const deleteProduct = useCallback((itemId) => {
    removeProduct(itemId);
    if (editingItemId === itemId) {
      setEditingItemId("");
      setFormValues(initialFormValues);
    }
    setStatusMessage(copy.adminDeleteFeedback);
  }, [editingItemId, removeProduct]);

  // Salva no catálogo compartilhado: o produto aparece/atualiza na loja na hora.
  const addProduct = useCallback(() => {
    if (!formValues.name.trim()) {
      setStatusMessage(copy.adminNameRequired);
      return;
    }

    const imageUrl = formValues.imageUrl.trim();
    const currentItem = inventoryItems.find((item) => item.id === editingItemId);
    saveProduct({
      id: editingItemId || `produto-${Date.now()}`,
      name: formValues.name.trim(),
      category: formValues.category.trim(),
      description: formValues.description.trim(),
      price: parsePrice(formValues.price),
      imageUrl,
      image: imageUrl ? { uri: imageUrl } : currentItem?.image || placeholderImage,
      featured: currentItem?.featured || false,
      sizes: currentItem?.sizes || defaultSizes,
    });
    setEditingItemId("");
    setFormValues(initialFormValues);
    setStatusMessage(editingItemId ? copy.adminUpdateFeedback : copy.adminAddFeedback);
  }, [editingItemId, formValues, inventoryItems, saveProduct]);

  const handleLogout = useCallback(() => {
    // Limpa a pilha para não ser possível voltar ao painel depois de sair.
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    logout();
  }, [logout, navigation]);

  return (
    <View style={styles.screen}>
      <StatusBar backgroundColor={theme.colors.adminHeader} barStyle="light-content" />
      
      {/* Cabeçalho com preenchimento seguro de status bar */}
      <View style={[styles.header, { paddingTop: insets.top, height: theme.admin.size.headerHeight + insets.top }]}>
        <View style={styles.brandGroup}>
          <Text style={styles.brand}>{copy.brand}</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>{copy.adminBadge}</Text></View>
        </View>
        <Pressable accessibilityLabel={copy.adminViewStore} accessibilityRole="button" onPress={() => navigation.navigate("Home")} style={styles.viewStoreButton}>
          <Text style={styles.logoutText}>{copy.adminViewStore}</Text>
        </Pressable>
        <Pressable accessibilityLabel={copy.adminLogoutLabel} accessibilityRole="button" onPress={handleLogout} style={styles.logoutButton}>
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
            <Text style={styles.submitText}>{editingItemId ? copy.adminSaveProductAction : copy.adminAddProductAction}</Text>
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

export default function Admin(props) {
  return (
    <RequireAuth role="admin">
      <AdminContent {...props} />
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  viewStoreButton: {
    marginLeft: "auto",
    marginRight: theme.spacing.lg,
  },
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