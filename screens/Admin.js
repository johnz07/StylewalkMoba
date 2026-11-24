import React, { useCallback, useState } from "react";
import { Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import BoxIcon from "../assets/box.svg";
import LogoutIcon from "../assets/log-out.svg";
import PlusCircleIcon from "../assets/plus-circle.svg";
import AdminInventoryCard from "../components/AdminInventoryCard";
import AdminOptionField from "../components/AdminOptionField";
import AdminTextField from "../components/AdminTextField";
import LoadState from "../components/LoadState";
import RequireAuth from "../components/RequireAuth";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { badges } from "../data/products";
import { api } from "../services/api";
import { copy, theme } from "../theme";
import { confirmAction } from "../utils/confirm";
import { formatPrice, parsePrice } from "../utils/format";

const initialFormValues = {
  name: "",
  categoryId: null,
  badge: null,
  featured: false,
  imageUrl: "",
  price: "",
  description: "",
};

const badgeOptions = [{ value: null, label: copy.adminBadgeNone }, ...badges.map((badge) => ({ value: badge, label: copy.badgeLabels[badge] }))];
const featuredOptions = [{ value: true, label: copy.adminFeaturedYes }, { value: false, label: copy.adminFeaturedNo }];

function AdminContent({ navigation }) {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { categories, deleteProduct: removeProduct, errorMessage, products: inventoryItems, reload, saveProduct, status } = useStore();
  const [formValues, setFormValues] = useState(initialFormValues);
  const [editingItemId, setEditingItemId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const categoryOptions = categories.map((category) => ({ value: category.id, label: category.name }));

  const updateField = useCallback((field, value) => {
    setFormValues((currentValues) => ({ ...currentValues, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setEditingItemId(null);
    setFormValues(initialFormValues);
  }, []);

  const editProduct = useCallback((item) => {
    setEditingItemId(item.id);
    setFormValues({
      name: item.name,
      categoryId: item.categoryId,
      badge: item.badge,
      featured: item.featured,
      imageUrl: item.imageUrl || "",
      price: formatPrice(item.price),
      description: item.description,
    });
    setStatusMessage(copy.adminEditFeedback);
  }, []);

  // Excluir (DELETE /produtos/:id): pede confirmação e remove da loja na hora.
  const deleteProduct = useCallback(async (item) => {
    if (!(await confirmAction(copy.adminDeleteConfirm(item.name), { confirmLabel: copy.adminDelete }))) {
      return;
    }
    try {
      await removeProduct(item.id);
      if (editingItemId === item.id) resetForm();
      setStatusMessage(copy.adminDeleteFeedback);
    } catch (error) {
      setStatusMessage(error.message);
    }
  }, [editingItemId, removeProduct, resetForm]);

  // Inserir (POST) ou alterar (PUT) no banco; a loja já mostra o resultado.
  const submitProduct = useCallback(async () => {
    if (!formValues.name.trim()) {
      setStatusMessage(copy.adminNameRequired);
      return;
    }
    if (!formValues.price.trim()) {
      setStatusMessage(copy.adminPriceInvalid);
      return;
    }

    const currentItem = inventoryItems.find((item) => item.id === editingItemId);
    setIsSaving(true);
    try {
      await saveProduct(editingItemId, {
        name: formValues.name.trim(),
        categoryId: formValues.categoryId,
        badge: formValues.badge,
        featured: formValues.featured,
        description: formValues.description.trim(),
        price: parsePrice(formValues.price),
        imageUrl: formValues.imageUrl.trim(),
        sizes: currentItem?.sizes,
      });
      setStatusMessage(editingItemId ? copy.adminUpdateFeedback : copy.adminAddFeedback);
      resetForm();
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }, [editingItemId, formValues, inventoryItems, resetForm, saveProduct]);

  // Função para exportar os dados em JSON para o Dashboard (item 2.2 do roteiro)
  const handleExportJson = async () => {
    try {
      setExportStatus("Gerando relatório JSON...");
      const data = await api.exportReport();
      const jsonString = JSON.stringify(data, null, 2);

      if (Platform.OS === "web") {
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `stylewalk-relatorio-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setExportStatus("Relatório baixado com sucesso!");
      } else {
        // API de arquivos do SDK 57 (File/Paths): grava no cache e abre o menu de compartilhar.
        const file = new File(Paths.cache, "stylewalk-relatorio.json");
        if (file.exists) file.delete();
        file.create();
        await file.write(jsonString); // assíncrono a partir do SDK 58
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(file.uri, { mimeType: "application/json", UTI: "public.json" });
          setExportStatus("Relatório compartilhado com sucesso!");
        } else {
          setExportStatus("Compartilhamento indisponível neste dispositivo.");
        }
      }
    } catch (error) {
      console.error("Erro ao exportar:", error);
      setExportStatus("Erro ao exportar o relatório.");
    }
  };

  const handleLogout = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    logout();
  }, [logout, navigation]);

  return (
    <View style={styles.screen}>
      <StatusBar backgroundColor={theme.colors.adminHeader} barStyle="light-content" />
      
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
            <AdminOptionField label={copy.adminCategoryLabel} onSelect={(value) => updateField("categoryId", value)} options={categoryOptions} value={formValues.categoryId} />
            <AdminOptionField label={copy.adminBadgeLabel} onSelect={(value) => updateField("badge", value)} options={badgeOptions} value={formValues.badge} />
            <AdminOptionField label={copy.adminFeaturedLabel} onSelect={(value) => updateField("featured", value)} options={featuredOptions} value={formValues.featured} />
            <AdminTextField label={copy.adminImageUrlLabel} onChangeText={(value) => updateField("imageUrl", value)} placeholder={copy.adminImageUrlPlaceholder} value={formValues.imageUrl} />
            <AdminTextField label={copy.adminPriceLabel} onChangeText={(value) => updateField("price", value)} placeholder={copy.adminPricePlaceholder} value={formValues.price} />
            <AdminTextField label={copy.adminDescriptionLabel} multiline onChangeText={(value) => updateField("description", value)} placeholder={copy.adminDescriptionPlaceholder} value={formValues.description} />
          </View>
          <Pressable
            accessibilityLabel={copy.adminAddProductLabel}
            accessibilityRole="button"
            accessibilityState={{ disabled: isSaving }}
            disabled={isSaving}
            onPress={submitProduct}
            style={[styles.submitButton, isSaving ? styles.submitButtonDisabled : null]}
          >
            <Text style={styles.submitText}>{isSaving ? copy.adminSaving : editingItemId ? copy.adminSaveProductAction : copy.adminAddProductAction}</Text>
          </Pressable>
          {statusMessage ? <Text accessibilityLiveRegion="polite" style={styles.status}>{statusMessage}</Text> : null}
        </View>

        <View style={styles.inventoryHeader}>
          <View style={styles.inventoryTitleRow}>
            <BoxIcon height={theme.admin.size.inventoryIcon} width={theme.admin.size.inventoryIcon} />
            <Text style={styles.inventoryTitle}>{copy.adminInventory}</Text>
          </View>
          {/* Botão de Exportar JSON */}
          <Pressable accessibilityRole="button" onPress={handleExportJson} style={styles.exportButton}>
            <Text style={styles.exportButtonText}>Exportar JSON</Text>
          </Pressable>
        </View>
        {exportStatus ? <Text style={styles.status}>{exportStatus}</Text> : null}
        <Text style={styles.inventoryCount}>{copy.adminItemCount(inventoryItems.length)}</Text>

        {status === "ready" ? (
          <View style={styles.inventoryList}>
            {inventoryItems.map((item) => (
              <AdminInventoryCard item={item} key={item.id} onDelete={() => deleteProduct(item)} onEdit={() => editProduct(item)} />
            ))}
          </View>
        ) : (
          <LoadState message={errorMessage} onRetry={reload} status={status} />
        )}
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
  submitButtonDisabled: {
    opacity: 0.6,
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
  exportButton: {
    backgroundColor: theme.colors.adminBrand,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  exportButtonText: {
    color: theme.colors.adminHeaderText,
    fontWeight: "bold",
    fontSize: 12,
  },
  inventoryList: {
    gap: theme.admin.spacing.inventoryGap,
    marginTop: theme.admin.spacing.inventoryToList,
  },
});