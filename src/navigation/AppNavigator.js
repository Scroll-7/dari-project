import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";

import { COLORS } from "../constants/theme";
import HomeScreen from "../screens/HomeScreen";
import InboxScreen from "../screens/InboxScreen";
import LoginScreen from "../screens/LoginScreen";
import RoommatesScreen from "../screens/RoommatesScreen";
import ServicesScreen from "../screens/ServicesScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary || "#4B5BF5",
        tabBarInactiveTintColor: "#aaa",
        tabBarStyle: {
          position: "absolute",
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: Platform.OS === "ios" ? "transparent" : "#fff",
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              tint="light"
              intensity={80}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Roommates") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Inbox") {
            iconName = focused
              ? "chatbubble-ellipses"
              : "chatbubble-ellipses-outline";
          } else if (route.name === "Services") {
            iconName = focused ? "construct" : "construct-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Roommates" component={RoommatesScreen} />
      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{
          tabBarBadge: 3, // remove this line once you wire up real unread count
        }}
      />
      <Tab.Screen name="Services" component={ServicesScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  // Replace this with your real auth logic (e.g. check AsyncStorage token)
  const isLoggedIn = false;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="Main" component={BottomTabNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
