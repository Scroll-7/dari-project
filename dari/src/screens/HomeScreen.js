import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, FONTS, SHADOWS, SIZES } from "../constants/theme";

const CATEGORIES = [
  { id: "1", title: "Apartments", icon: "business-outline" },
  { id: "2", title: "Houses", icon: "home-outline" },
  { id: "3", title: "Rooms", icon: "bed-outline" },
  { id: "4", title: "Commercial", icon: "briefcase-outline" },
];

const FEATURED_PROPERTIES = [
  {
    id: "1",
    title: "Skyline Studio",
    price: "$1,200",
    location: "Downtown",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "2",
    title: "Cozy Villa",
    price: "$2,500",
    location: "Suburbs",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1e52d1590c?auto=format&fit=crop&q=80&w=400",
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>Discover your next home</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
              }}
              style={styles.profileImg}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={COLORS.textLight}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search city, neighborhood, or address"
            style={styles.searchInput}
            placeholderTextColor={COLORS.textLight}
          />
          <TouchableOpacity style={styles.filterBtn}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.filterGradient}
            >
              <Ionicons name="options" size={20} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryCard}>
              <View style={styles.categoryIconContainer}>
                <Ionicons name={cat.icon} size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.categoryText}>{cat.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Properties */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Properties</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {FEATURED_PROPERTIES.map((prop) => (
          <TouchableOpacity key={prop.id} style={styles.propertyCard}>
            <Image source={{ uri: prop.image }} style={styles.propertyImage} />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={styles.propertyGradient}
            >
              <View style={styles.propertyInfo}>
                <Text style={styles.propertyTitle}>{prop.title}</Text>
                <Text style={styles.propertyLocation}>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={COLORS.white}
                  />{" "}
                  {prop.location}
                </Text>
              </View>
              <View style={styles.priceTag}>
                <Text style={styles.priceText}>{prop.price}/mo</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SIZES.medium, paddingBottom: 100 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SIZES.medium,
    marginBottom: SIZES.xl,
  },
  greeting: { ...FONTS.body1, color: COLORS.textLight },
  userName: { ...FONTS.h2, color: COLORS.text, marginTop: 4 },
  profileBtn: { ...SHADOWS.medium },
  profileImg: { width: 50, height: 50, borderRadius: 25 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: SIZES.small,
    paddingVertical: 6,
    ...SHADOWS.light,
    marginBottom: SIZES.xl,
  },
  searchIcon: { paddingHorizontal: SIZES.small },
  searchInput: { flex: 1, height: 40, ...FONTS.body1 },
  filterBtn: { borderRadius: 12, overflow: "hidden", marginLeft: SIZES.small },
  filterGradient: {
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.medium,
  },
  sectionTitle: { ...FONTS.h3, color: COLORS.text },
  seeAll: { ...FONTS.body2, color: COLORS.primary },
  categoriesScroll: { marginBottom: SIZES.xl },
  categoryCard: { alignItems: "center", marginRight: SIZES.large },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.light,
    marginBottom: SIZES.small,
  },
  categoryText: { ...FONTS.body2, color: COLORS.text },
  propertyCard: {
    width: "100%",
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: SIZES.medium,
    ...SHADOWS.medium,
  },
  propertyImage: { width: "100%", height: "100%" },
  propertyGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    padding: SIZES.medium,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  propertyInfo: { flex: 1 },
  propertyTitle: { ...FONTS.h3, color: COLORS.white, marginBottom: 4 },
  propertyLocation: { ...FONTS.body2, color: COLORS.white, opacity: 0.8 },
  priceTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceText: { ...FONTS.body2, color: COLORS.white, fontWeight: "bold" },
});
