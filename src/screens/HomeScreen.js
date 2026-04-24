import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { COLORS, FONTS, SHADOWS, SIZES } from "../constants/theme";

const CATEGORIES = [
  {
    id: "1",
    title: "Apartments",
    icon: "business-outline",
    screen: "Apartments",
  },
  { id: "2", title: "Houses", icon: "home-outline", screen: "Houses" },
  { id: "3", title: "Rooms", icon: "bed-outline", screen: "Rooms" },
  {
    id: "4",
    title: "Commercial",
    icon: "briefcase-outline",
    screen: "Commercial",
  },
];

const FEATURED_PROPERTIES = [
  {
    id: "1",
    title: "Skyline Studio",
    price: "1 200 DT/mois",
    location: "Centre-ville",
    beds: 1,
    baths: 1,
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "2",
    title: "Cozy Villa",
    price: "2 500 DT/mois",
    location: "Banlieue",
    beds: 3,
    baths: 2,
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
  },
];

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <Text style={styles.headline}>
              Trouvez votre{"\n"}prochain chez-vous
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")}
            activeOpacity={0.85}
          >
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
              }}
              style={styles.avatar}
            />
            <View style={styles.onlineDot} />
          </TouchableOpacity>
        </View>

        {/* ── Search ── */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate("Search")}
          activeOpacity={0.9}
        >
          <Ionicons name="search-outline" size={18} color={COLORS.textLight} />
          <TextInput
            placeholder="Ville, quartier, adresse…"
            style={styles.searchInput}
            placeholderTextColor={COLORS.textLight}
            editable={false}
            pointerEvents="none"
          />
          <View style={styles.filterChip}>
            <Ionicons name="options-outline" size={16} color={COLORS.primary} />
          </View>
        </TouchableOpacity>

        {/* ── Categories ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Catégories</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Search")}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => cat.screen && navigation.navigate(cat.screen)}
              activeOpacity={0.8}
            >
              <View style={styles.categoryIcon}>
                <Ionicons name={cat.icon} size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.categoryLabel}>{cat.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Featured ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Propriétés vedettes</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Search")}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {FEATURED_PROPERTIES.map((prop) => (
          <TouchableOpacity
            key={prop.id}
            style={styles.propertyCard}
            onPress={() =>
              navigation.navigate("PropertyDetail", { property: prop })
            }
            activeOpacity={0.9}
          >
            <Image source={{ uri: prop.image }} style={styles.propertyImage} />

            {/* Gradient overlay */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.72)"]}
              style={styles.propertyOverlay}
            />

            {/* Price badge */}
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>{prop.price}</Text>
            </View>

            {/* Info */}
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyTitle}>{prop.title}</Text>
              <View style={styles.propertyMeta}>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={styles.propertyLocation}>{prop.location}</Text>
                <View style={styles.dot} />
                <Ionicons
                  name="bed-outline"
                  size={13}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={styles.propertyLocation}>{prop.beds}</Text>
                <View style={styles.dot} />
                <Ionicons
                  name="water-outline"
                  size={13}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={styles.propertyLocation}>{prop.baths}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SIZES.medium, paddingBottom: 100 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SIZES.large,
    marginTop: SIZES.small,
  },
  greeting: {
    ...FONTS.body2,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  headline: {
    ...FONTS.h1,
    color: COLORS.text,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.background,
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SIZES.medium,
    paddingVertical: 13,
    marginBottom: SIZES.large,
    gap: 10,
    ...SHADOWS.light,
  },
  searchInput: {
    flex: 1,
    ...FONTS.body1,
    color: COLORS.text,
  },
  filterChip: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primaryOpacity,
    justifyContent: "center",
    alignItems: "center",
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.medium,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  seeAll: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: "600",
  },

  // Categories
  categoriesRow: {
    paddingBottom: SIZES.large,
    gap: 12,
  },
  categoryCard: {
    alignItems: "center",
    gap: 8,
    marginRight: 4,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radius.lg,
    backgroundColor: COLORS.primaryOpacity,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.xs,
  },
  categoryLabel: {
    ...FONTS.caption,
    color: COLORS.text,
    fontWeight: "600",
  },

  // Property card
  propertyCard: {
    height: 220,
    borderRadius: SIZES.radius.xl,
    overflow: "hidden",
    marginBottom: SIZES.medium,
    backgroundColor: COLORS.card,
    ...SHADOWS.medium,
  },
  propertyImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  propertyOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "65%",
  },
  priceBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radius.pill,
  },
  priceText: {
    ...FONTS.caption,
    color: "#fff",
    fontWeight: "700",
  },
  propertyInfo: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  propertyTitle: {
    ...FONTS.h3,
    color: "#fff",
    marginBottom: 5,
  },
  propertyMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  propertyLocation: {
    ...FONTS.caption,
    color: "rgba(255,255,255,0.85)",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
});
