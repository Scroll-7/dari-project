import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ConversationProvider } from "../context/ConversationContext";

import ApartmentsScreen from "../screens/ApartmentsScreen";
import CommercialScreen from "../screens/CommercialScreen";
import HelpScreen from "../screens/HelpScreen";
import HomeScreen from "../screens/HomeScreen";
import HousesScreen from "../screens/HousesScreen";
import InboxScreen from "../screens/InboxScreen";
import MyListingsScreen from "../screens/MyListingsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PropertyDetailScreen from "../screens/PropertyDetailScreen";
import RoommatesScreen from "../screens/RoommatesScreen";
import RoomsScreen from "../screens/RoomsScreen";
import SavedPropertiesScreen from "../screens/SavedPropertiesScreen";
import SearchScreen from "../screens/SearchScreen";
import ServiceProvidersScreen from "../screens/ServiceProvidersScreen";
import ServicesScreen from "../screens/ServicesScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#4461F2",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Home: ["home", "home-outline"],
            Roommates: ["people", "people-outline"],
            Inbox: ["chatbubble", "chatbubble-outline"],
            Services: ["construct", "construct-outline"],
          };
          const [active, inactive] = icons[route.name] || [
            "ellipse",
            "ellipse-outline",
          ];

          return (
            <Ionicons
              name={focused ? active : inactive}
              size={22}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Roommates" component={RoommatesScreen} />
      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{
          tabBarBadge: 3,
          tabBarBadgeStyle: {
            backgroundColor: "#4461F2",
            fontSize: 10,
          },
        }}
      />
      <Tab.Screen name="Services" component={ServicesScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <ConversationProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Apartments" component={ApartmentsScreen} />
          <Stack.Screen name="Houses" component={HousesScreen} />
          <Stack.Screen name="Rooms" component={RoomsScreen} />
          <Stack.Screen name="Commercial" component={CommercialScreen} />
          <Stack.Screen
            name="PropertyDetail"
            component={PropertyDetailScreen}
          />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen
            name="ServiceProviders"
            component={ServiceProvidersScreen}
          />
          <Stack.Screen
            name="SavedProperties"
            component={SavedPropertiesScreen}
          />
          <Stack.Screen name="MyListings" component={MyListingsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Help" component={HelpScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ConversationProvider>
  );
}
