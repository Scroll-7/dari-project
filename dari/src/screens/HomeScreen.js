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
import { COLORS } from "../constants/theme";

// ✅ (OPTIONAL) if you have mockData file
// import { PROPERTIES } from "../constants/mockData";

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

// ✅ IMPORTANT: add navigation here
export default function HomeScreen({ navigation }) {
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

          {/* ✅ Profile navigation */}
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate("Profile")}
          >
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
              }}
              style={styles.profileImg}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity onPress={() => navigation.navigate("Search")}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={COLORS.textLight}
              style={styles.searchIcon}
            />

            {/* ✅ Navigate when user clicks input */}
            <TextInput
              placeholder="Search city, neighborhood, or address"
              style={styles.searchInput}
              placeholderTextColor={COLORS.textLight}
              onFocus={() => navigation.navigate("Search")}
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
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>

          {/* ✅ See All */}
          <TouchableOpacity onPress={() => navigation.navigate("Search")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => {
                if (cat.title === "Apartments") {
                  navigation.navigate("Apartments");
                } else if (cat.title === "Houses") {
                  navigation.navigate("Houses");
                }
              }}
            >
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

          {/* ✅ See All */}
          <TouchableOpacity onPress={() => navigation.navigate("Search")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {FEATURED_PROPERTIES.map((prop) => (
          <TouchableOpacity
            key={prop.id}
            style={styles.propertyCard}
            onPress={() =>
              navigation.navigate("PropertyDetail", { property: prop })
            }
          >
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: "gray",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  profileImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: "bold",
  },
  seeAll: {
    color: "blue",
  },
  categoryCard: {
    alignItems: "center",
    marginRight: 15,
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  categoryText: {
    marginTop: 5,
  },
  propertyCard: {
    height: 200,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
  },
  propertyImage: {
    width: "100%",
    height: "100%",
  },
  propertyGradient: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  propertyTitle: {
    color: "#fff",
    fontWeight: "bold",
  },
  propertyLocation: {
    color: "#fff",
  },
  priceTag: {
    backgroundColor: "blue",
    padding: 5,
    borderRadius: 8,
  },
  priceText: {
    color: "#fff",
  },
});
