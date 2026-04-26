import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AuthProvider, AuthContext } from '../context/AuthContext';
import { ConversationProvider } from '../context/ConversationContext';
import { ThemeProvider } from '../context/ThemeContext';
import { FavoritesProvider } from '../context/FavoritesContext';

import ApartmentsScreen        from '../screens/ApartmentsScreen';
import ChatScreen              from '../screens/ChatScreen';
import CommercialScreen        from '../screens/CommercialScreen';
import HelpScreen              from '../screens/HelpScreen';
import HomeScreen              from '../screens/HomeScreen';
import HousesScreen            from '../screens/HousesScreen';
import InboxScreen             from '../screens/InboxScreen';
import LoginScreen             from '../screens/LoginScreen';
import SignupScreen            from '../screens/SignupScreen';
import MarketInsightsScreen    from '../screens/MarketInsightsScreen';
import MyListingsScreen        from '../screens/MyListingsScreen';
import ProfileScreen           from '../screens/ProfileScreen';
import PropertyDetailScreen    from '../screens/PropertyDetailScreen';
import RoommateProfileScreen   from '../screens/RoommateProfileScreen';
import RoommatesScreen         from '../screens/RoommatesScreen';
import RoomsScreen             from '../screens/RoomsScreen';
import SavedPropertiesScreen   from '../screens/SavedPropertiesScreen';
import SearchScreen            from '../screens/SearchScreen';
import ServiceProvidersScreen  from '../screens/ServiceProvidersScreen';
import ServicesScreen          from '../screens/ServicesScreen';
import SettingsScreen          from '../screens/SettingsScreen';

import { COLORS, GRADIENTS, SHADOWS } from '../constants/theme';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { name: 'Home',      label: 'Home',      iconActive: 'home',          iconInactive: 'home-outline' },
  { name: 'Roommates', label: 'Roommates', iconActive: 'people',         iconInactive: 'people-outline' },
  { name: 'ADD',       label: 'Post',      iconActive: 'add',            iconInactive: 'add' }, // FAB placeholder
  { name: 'Inbox',     label: 'Inbox',     iconActive: 'chatbubble',     iconInactive: 'chatbubble-outline', badge: 3 },
  { name: 'Services',  label: 'Services',  iconActive: 'construct',      iconInactive: 'construct-outline' },
];

// ─── Custom tab bar ───────────────────────────────────────────────────────────

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarWrap}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const cfg      = TABS[index];
          const focused  = state.index === index;
          const isFAB    = cfg.name === 'ADD';

          // FAB (center button)
          if (isFAB) {
            return (
              <TouchableOpacity
                key={route.key}
                style={styles.fabWrap}
                activeOpacity={0.9}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <LinearGradient colors={GRADIENTS.primary} style={styles.fab} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Ionicons name="add" size={28} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            );
          }

          const iconName = focused ? cfg.iconActive : cfg.iconInactive;

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (!focused) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={onPress}
              activeOpacity={0.8}
            >
              <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
                <Ionicons name={iconName} size={22} color={focused ? COLORS.primary : COLORS.textLight} />
                {cfg.badge && !focused && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cfg.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                {cfg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Dummy placeholder for FAB screen (not navigated to) ─────────────────────

function PlaceholderScreen() { return null; }

// ─── Main tabs ────────────────────────────────────────────────────────────────

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"      component={HomeScreen} />
      <Tab.Screen name="Roommates" component={RoommatesScreen} />
      <Tab.Screen name="ADD"       component={PlaceholderScreen} />
      <Tab.Screen name="Inbox"     component={InboxScreen} />
      <Tab.Screen name="Services"  component={ServicesScreen} />
    </Tab.Navigator>
  );
}

// ─── App Navigator Content (Consumes AuthContext) ──────────────────────────────
function AppNavigatorContent() {
  const { user, isLoading } = React.useContext(AuthContext);

  if (isLoading) {
    // Return an empty view or a splash screen while checking auth state
    return <View style={{ flex: 1, backgroundColor: COLORS.background }} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // UNauthenticated screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : (
          // Authenticated screens
          <>
            <Stack.Screen name="Main"             component={MainTabs} />
            <Stack.Screen name="Search"           component={SearchScreen} />
            <Stack.Screen name="Apartments"       component={ApartmentsScreen} />
            <Stack.Screen name="Houses"           component={HousesScreen} />
            <Stack.Screen name="Rooms"            component={RoomsScreen} />
            <Stack.Screen name="Commercial"       component={CommercialScreen} />
            <Stack.Screen name="PropertyDetail"   component={PropertyDetailScreen} />
            <Stack.Screen name="Profile"          component={ProfileScreen} />
            <Stack.Screen name="ServiceProviders" component={ServiceProvidersScreen} />
            <Stack.Screen name="SavedProperties"  component={SavedPropertiesScreen} />
            <Stack.Screen name="MyListings"       component={MyListingsScreen} />
            <Stack.Screen name="Settings"         component={SettingsScreen} />
            <Stack.Screen name="Help"             component={HelpScreen} />
            <Stack.Screen name="MarketInsights"   component={MarketInsightsScreen} />
            <Stack.Screen name="RoommateProfile"  component={RoommateProfileScreen} />
            <Stack.Screen name="Chat"             component={ChatScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ─── Root navigator ───────────────────────────────────────────────────────────

export default function AppNavigator() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <FavoritesProvider>
          <ConversationProvider>
            <AppNavigatorContent />
          </ConversationProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Tab bar container
  tabBarWrap: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 6,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    ...SHADOWS.medium,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },

  // Regular tab item
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingBottom: 2,
  },
  tabIconWrap: {
    width: 44, height: 36,
    justifyContent: 'center', alignItems: 'center',
    borderRadius: 12,
    position: 'relative',
  },
  tabIconWrapActive: {
    backgroundColor: COLORS.primaryOpacity,
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Badge
  badge: {
    position: 'absolute', top: 2, right: 2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.card,
  },
  badgeText: { fontSize: 9, fontWeight: '700', color: '#fff' },

  // FAB (center)
  fabWrap: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 10,
  },
  fab: {
    width: 54, height: 54, borderRadius: 27,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.glow,
  },
});
