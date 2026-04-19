import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ConversationProvider } from "../context/ConversationContext";
import ChatScreen from "../screens/ChatScreen";

import ApartmentsScreen from "../screens/ApartmentsScreen";
import HomeScreen from "../screens/HomeScreen";
import HousesScreen from "../screens/HousesScreen";
import InboxScreen from "../screens/InboxScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PropertyDetailScreen from "../screens/PropertyDetailScreen";
import RoommatesScreen from "../screens/RoommatesScreen";
import RoommateProfileScreen from "../screens/RoommateProfileScreen";
import SearchScreen from "../screens/SearchScreen";
import ServiceProvidersScreen from "../screens/ServiceProvidersScreen";
import ServicesScreen from "../screens/ServicesScreen";
import LoginScreen from "../screens/LoginScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom tab bar (Home + Roommates + Inbox + Services)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#4F46E5",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 12,
          height: 68,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home")
            iconName = focused ? "home" : "home-outline";
          else if (route.name === "Roommates")
            iconName = focused ? "people" : "people-outline";
          else if (route.name === "Inbox")
            iconName = focused ? "chatbubble" : "chatbubble-outline";
          else if (route.name === "Services")
            iconName = focused ? "construct" : "construct-outline";
          return <Ionicons name={iconName} size={22} color={color} />;
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
          tabBarBadgeStyle: { backgroundColor: "#4461F2", fontSize: 10 },
        }}
      />
      <Tab.Screen name="Services" component={ServicesScreen} />
    </Tab.Navigator>
  );
}

// Root stack: tabs + screens that push on top (no bottom bar)
export default function AppNavigator() {
  return (
    <ConversationProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Apartments" component={ApartmentsScreen} />
          <Stack.Screen name="Houses" component={HousesScreen} />
          <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="ServiceProviders" component={ServiceProvidersScreen} />
          <Stack.Screen name="RoommateProfile" component={RoommateProfileScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ConversationProvider>
  );
}
