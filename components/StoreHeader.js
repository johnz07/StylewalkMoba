import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SearchIcon from "../assets/Search.svg";
import AccountIcon from "../assets/person.svg";
import BagIcon from "../assets/Shopping-bag.svg";
import MenuIcon from "../assets/List.svg";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useStore } from "../context/StoreContext";
import { categories } from "../data/products";
import { copy, theme } from "../theme";
import { formatPrice } from "../utils/format";
import { goTo } from "../utils/navigation";

// Ignora acentos e maiúsculas na busca ("tenis" encontra "Tênis").
function normalize(text) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function MenuRow({ label, onPress, tone }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.menuRow}>
      <Text style={[styles.menuRowText, tone === "danger" ? styles.menuRowDanger : null]}>{label}</Text>
      <Text style={styles.menuRowArrow}>›</Text>
    </Pressable>
  );
}

export default function StoreHeader() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { products } = useStore();
  const [openPanel, setOpenPanel] = useState(null); // "search" | "account" | "menu" | null
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const term = normalize(query);
    if (!term) {
      return [];
    }
    return products.filter((product) => normalize(`${product.name} ${product.category} ${product.description}`).includes(term));
  }, [products, query]);

  const closePanel = () => {
    setOpenPanel(null);
    setQuery("");
  };

  // Fecha o painel e executa a ação escolhida.
  const select = (action) => () => {
    closePanel();
    action();
  };

  const renderPanel = () => {
    if (openPanel === "search") {
      return (
        <>
          <View style={styles.searchField}>
            <SearchIcon height={theme.size.icon} width={theme.size.icon} />
            <TextInput
              accessibilityLabel={copy.searchLabel}
              autoCorrect={false}
              autoFocus
              onChangeText={setQuery}
              placeholder={copy.searchPlaceholder}
              placeholderTextColor={theme.colors.cartPlaceholder}
              returnKeyType="search"
              style={styles.searchInput}
              value={query}
            />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" style={styles.results}>
            {query.trim() && !results.length ? <Text style={styles.emptyText}>{copy.searchEmpty}</Text> : null}
            {results.map((product) => (
              <Pressable
                accessibilityRole="button"
                key={product.id}
                onPress={select(() => navigation.navigate("Produto", { productId: product.id }))}
                style={styles.resultRow}
              >
                <Image source={product.image} style={styles.resultImage} />
                <View style={styles.resultDetails}>
                  <Text numberOfLines={1} style={styles.resultName}>{product.name}</Text>
                  <Text style={styles.resultCategory}>{product.category}</Text>
                </View>
                <Text style={styles.resultPrice}>{formatPrice(product.price)}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      );
    }

    if (openPanel === "account") {
      return user ? (
        <>
          <Text style={styles.panelTitle}>{copy.accountGreeting(user.firstName)}</Text>
          <Text style={styles.panelSubtitle}>{user.email}</Text>
          {isAdmin ? <MenuRow label={copy.accountAdminPanel} onPress={select(() => navigation.reset({ index: 0, routes: [{ name: "Admin" }] }))} /> : null}
          <MenuRow label={copy.accountLogout} onPress={select(logout)} tone="danger" />
        </>
      ) : (
        <>
          <Text style={styles.panelTitle}>{copy.accountGuestTitle}</Text>
          <Text style={styles.panelSubtitle}>{copy.accountGuestSubtitle}</Text>
          <MenuRow label={copy.loginAction} onPress={select(() => navigation.navigate("Login"))} />
          <MenuRow label={copy.accountCreate} onPress={select(() => navigation.navigate("Cadastro"))} />
        </>
      );
    }

    return (
      <>
        <Text style={styles.panelTitle}>{copy.categories}</Text>
        <MenuRow label={copy.menuAllProducts} onPress={select(() => goTo(navigation, "Lancamentos", { category: undefined }))} />
        {categories.map((category) => (
          <MenuRow key={category} label={category} onPress={select(() => goTo(navigation, "Lancamentos", { category }))} />
        ))}
      </>
    );
  };

  return (
    <View style={styles.header}>
      <Pressable accessibilityLabel={copy.homeLabel} accessibilityRole="button" onPress={() => goTo(navigation, "Home")}>
        <Text style={styles.brand}>{copy.brand}</Text>
      </Pressable>
      <View style={styles.actions}>
        <Pressable accessibilityLabel={copy.searchLabel} accessibilityRole="button" onPress={() => setOpenPanel("search")} style={styles.iconButton}>
          <SearchIcon height={theme.size.icon} width={theme.size.icon} />
        </Pressable>
        <Pressable accessibilityLabel={copy.accountLabel} accessibilityRole="button" onPress={() => setOpenPanel("account")} style={styles.iconButton}>
          <AccountIcon height={theme.size.accountIcon} width={theme.size.accountIcon} />
          {user ? <View style={styles.loggedDot} /> : null}
        </Pressable>
        <Pressable accessibilityLabel={copy.bagLabel} accessibilityRole="button" onPress={() => goTo(navigation, "Carrinho")} style={styles.iconButton}>
          <BagIcon height={theme.size.icon} width={theme.size.icon} />
          {itemCount ? <View style={styles.badge}><Text style={styles.badgeText}>{itemCount}</Text></View> : null}
        </Pressable>
        <Pressable accessibilityLabel={copy.menuLabel} accessibilityRole="button" onPress={() => setOpenPanel("menu")} style={styles.iconButton}>
          <MenuIcon height={theme.size.menuIcon} width={theme.size.menuIcon} />
        </Pressable>
      </View>

      <Modal animationType="fade" onRequestClose={closePanel} statusBarTranslucent transparent visible={openPanel !== null}>
        <Pressable accessibilityLabel={copy.closePanel} onPress={closePanel} style={styles.backdrop} />
        <View style={[styles.panel, { paddingTop: insets.top + theme.spacing.md }]}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelBrand}>{copy.brand}</Text>
            <Pressable accessibilityLabel={copy.closePanel} accessibilityRole="button" hitSlop={theme.spacing.md} onPress={closePanel}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
          {renderPanel()}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    height: theme.size.headerHeight,
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
  },
  brand: {
    color: theme.colors.canvas,
    ...theme.typography.brand,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: theme.size.accountIcon,
    minWidth: theme.size.accountIcon,
  },
  badge: {
    alignItems: "center",
    backgroundColor: theme.colors.brand,
    borderRadius: theme.radius.pill,
    height: 14,
    justifyContent: "center",
    minWidth: 14,
    paddingHorizontal: 3,
    position: "absolute",
    right: -6,
    top: -4,
  },
  badgeText: {
    color: theme.colors.canvas,
    ...theme.typography.tag,
  },
  loggedDot: {
    backgroundColor: theme.colors.cartSuccess,
    borderRadius: theme.radius.pill,
    height: 7,
    position: "absolute",
    right: 0,
    top: 0,
    width: 7,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  panel: {
    backgroundColor: theme.colors.canvas,
    borderBottomLeftRadius: theme.radius.medium,
    borderBottomRightRadius: theme.radius.medium,
    maxHeight: "80%",
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  panelHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  panelBrand: {
    color: theme.colors.ink,
    ...theme.typography.brand,
  },
  closeText: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "700",
  },
  panelTitle: {
    color: theme.colors.text,
    ...theme.typography.sectionTitle,
  },
  panelSubtitle: {
    color: theme.colors.mutedText,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.xs,
    ...theme.typography.productBody,
  },
  menuRow: {
    alignItems: "center",
    borderBottomColor: theme.colors.cardBorder,
    borderBottomWidth: theme.spacing.hairline,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
  },
  menuRowText: {
    color: theme.colors.text,
    ...theme.typography.productTitle,
  },
  menuRowDanger: {
    color: theme.colors.danger,
  },
  menuRowArrow: {
    color: theme.colors.mutedText,
    fontSize: 18,
  },
  searchField: {
    alignItems: "center",
    borderColor: theme.colors.cartCardBorder,
    borderRadius: theme.radius.small,
    borderWidth: theme.spacing.hairline,
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  searchInput: {
    color: theme.colors.text,
    flex: theme.flex.full,
    fontSize: 14,
    height: 44,
  },
  results: {
    marginTop: theme.spacing.sm,
  },
  emptyText: {
    color: theme.colors.mutedText,
    paddingVertical: theme.spacing.lg,
    textAlign: "center",
    ...theme.typography.productBody,
  },
  resultRow: {
    alignItems: "center",
    borderBottomColor: theme.colors.cardBorder,
    borderBottomWidth: theme.spacing.hairline,
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  resultImage: {
    borderRadius: theme.radius.small,
    height: 48,
    width: 48,
  },
  resultDetails: {
    flex: theme.flex.full,
  },
  resultName: {
    color: theme.colors.text,
    ...theme.typography.productTitle,
  },
  resultCategory: {
    color: theme.colors.mutedText,
    ...theme.typography.productBody,
  },
  resultPrice: {
    color: theme.colors.brand,
    ...theme.typography.price,
  },
});
