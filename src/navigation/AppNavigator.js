import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AuthProvider, AuthContext } from '../context/AuthContext';
import { ConversationProvider } from '../context/ConversationContext';
import { GRADIENTS, SHADOWS } from '../constants/theme';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { UserProvider, useUser } from '../context/UserContext';

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
import ServiceProviderProfileScreen from '../screens/ServiceProviderProfileScreen';
import ServicesScreen          from '../screens/ServicesScreen';
import SettingsScreen          from '../screens/SettingsScreen';
import WelcomeUsernameScreen         from '../screens/WelcomeUsernameScreen';
import PreferencesOnboardingScreen   from '../screens/PreferencesOnboardingScreen';
import EditPreferencesScreen         from '../screens/EditPreferencesScreen';
import PostPropertyScreen            from '../screens/PostPropertyScreen';
import PostRequestScreen             from '../screens/PostRequestScreen';
import NewChatScreen                 from '../screens/NewChatScreen';
import SplashScreen                  from '../screens/SplashScreen';
import ServiceCategoryScreen         from '../screens/ServiceCategoryScreen';
import NotificationsScreen           from '../screens/NotificationsScreen';
import ProfileReviewsScreen          from '../screens/ProfileReviewsScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ─── Tab config ─────────────────────────────────────────────────────

const TABS = [
  { name: 'Home',      label: 'Home',      iconActive: 'home',          iconInactive: 'home-outline' },
  { name: 'Roommates', label: 'Roommates', iconActive: 'people',         iconInactive: 'people-outline' },
  { name: 'ADD',       label: 'Post',      iconActive: 'add',            iconInactive: 'add' },
  { name: 'Inbox',     label: 'Inbox',     iconActive: 'chatbubble',     iconInactive: 'chatbubble-outline' },
  { name: 'Services',  label: 'Services',  iconActive: 'construct',      iconInactive: 'construct-outline' },
];

// ─── Custom tab bar ───────────────────────────────────────────────────────────

function CustomTabBar({ state, descriptors, navigation }) {
  const { user } = useUser();
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.tabBarWrap}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const cfg      = TABS.find(t => t.name === route.name);
          if (!cfg) return null;
          
          const focused  = state.index === index;
          const isFAB    = cfg.name === 'ADD';

          // FAB (center button)
          if (isFAB) {
            return (
              <TouchableOpacity
                key={route.key}
                style={styles.fabWrap}
                activeOpacity={0.9}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  if (user?.role === 'landlord') {
                    navigation.navigate('PostProperty');
                  } else {
                    navigation.navigate('PostRequest');
                  }
                }}
              >
                <LinearGradient colors={GRADIENTS.primary} style={styles.fab} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Ionicons name="add" size={28} color={colors.white} />
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
                <Ionicons name={iconName} size={22} color={focused ? colors.primary : colors.textLight} />
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
  const { user } = useUser();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"      component={HomeScreen} />
      {user?.role !== 'landlord' && user?.role !== 'service' && (
        <Tab.Screen name="Roommates" component={RoommatesScreen} />
      )}
      <Tab.Screen name="ADD"       component={PlaceholderScreen} />
      <Tab.Screen name="Inbox"     component={InboxScreen} />
      <Tab.Screen name="Services"  component={ServicesScreen} />
    </Tab.Navigator>
  );
}

// ─── App Navigator Content (Consumes AuthContext) ──────────────────────────────
function PreferencesOnboardingWrapper() {
  // Navigation is automatic once hasPreferences flips to true in Firestore
  return <PreferencesOnboardingScreen isEditing={false} onDone={() => {}} />;
}

function AppNavigatorContent() {
  const { user, isLoading, hasUsername, hasPreferences, role } = React.useContext(AuthContext);
  const { colors } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashFinish = React.useCallback(() => setShowSplash(false), []);

  // Landlords skip the preferences onboarding entirely.
  // Service providers see a different category picker screen.
  // Tenants see the budget/lifestyle preferences screen.
  const isServiceProvider = role === 'service';
  const isLandlord = role === 'landlord';
  const needsOnboarding = !hasPreferences && !isLandlord;

  // Show splash on first launch (before auth check completes or after)
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (isLoading) {
    // Return an empty view while checking auth state
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
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
        ) : !hasUsername ? (
          // Authenticated but username not yet chosen → onboarding step 1
          <>
            <Stack.Screen name="WelcomeUsername" component={WelcomeUsernameScreen} />
          </>
        ) : needsOnboarding ? (
          // Username set but preferences not yet filled → onboarding step 2
          // (skipped entirely for landlords)
          <>
            {isServiceProvider ? (
              // Service providers pick their trade category instead
              <Stack.Screen name="ServiceCategory" component={ServiceCategoryScreen} />
            ) : (
              <Stack.Screen name="PreferencesOnboarding" component={PreferencesOnboardingWrapper} />
            )}
          </>
        ) : (
          // Fully set-up authenticated screens
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
            <Stack.Screen name="NewChat"          component={NewChatScreen} />
            <Stack.Screen name="PostProperty"     component={PostPropertyScreen} />
            <Stack.Screen name="PostRequest"      component={PostRequestScreen} />
            <Stack.Screen name="EditPreferences"  component={EditPreferencesScreen} />
            <Stack.Screen name="Notifications"    component={NotificationsScreen} />
            <Stack.Screen name="ProfileReviews"   component={ProfileReviewsScreen} />
            <Stack.Screen name="ServiceProviderProfile" component={ServiceProviderProfileScreen} />

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
            <UserProvider>
              <AppNavigatorContent />
            </UserProvider>
          </ConversationProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const getStyles = (colors) => StyleSheet.create({
  // Tab bar container
  tabBarWrap: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 6,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    ...SHADOWS.medium,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  // Regular tab item
  tabItem: {
    width: 75,
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
    backgroundColor: colors.primaryOpacity,
  },
  tabLabel: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },

  // Badge
  badge: {
    position: 'absolute', top: 2, right: 2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.card,
  },
  badgeText: { fontSize: 9, fontWeight: '700', color: colors.white },

  // FAB (center)
  fabWrap: {
    width: 75,
    alignItems: 'center',
    marginBottom: 10,
  },
  fab: {
    width: 54, height: 54, borderRadius: 27,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.glow,
  },
});


