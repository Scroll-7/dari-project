import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import PropertyCard from '../components/PropertyCard';
import { SectionHeader } from '../components/SectionHeader';
import { FONTS, GRADIENTS, SHADOWS, SIZES } from '../constants/theme';
import { PROPERTIES } from '../constants/mockData';
import { useTheme } from '../context/ThemeContext';

// ─── Static data ─────────────────────────────────────────────────────────────

const CATEGORIES_DATA = [
  { id: '1', title: 'Apartments', icon: 'business-outline',  screen: 'Apartments', themeColor: 'primary' },
  { id: '2', title: 'Houses',     icon: 'home-outline',       screen: 'Houses',     themeColor: 'teal' },
  { id: '3', title: 'Rooms',      icon: 'bed-outline',        screen: 'Rooms',      themeColor: 'rose' },
  { id: '4', title: 'Commercial', icon: 'briefcase-outline',  screen: 'Commercial', themeColor: 'gold' },
];

const QUICK_FILTERS = [
  { id: 'all',      label: '🔥 All' },
  { id: 'featured', label: '✨ Featured' },
  { id: 'new',      label: '🆕 New' },
  { id: 'cheap',    label: '💰 Budget' },
];

const AGENTS = [
  { id: '1', name: 'Amira K.', rating: 4.9, deals: 48, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
  { id: '2', name: 'Youssef M.', rating: 4.8, deals: 36, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  { id: '3', name: 'Ines B.', rating: 4.7, deals: 29, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200' },
];

const STATS = [
  { label: 'Listings', value: '1.2k+', icon: 'home' },
  { label: 'This Week', value: '48',   icon: 'trending-up' },
  { label: 'Avg Price', value: '1.8k', icon: 'cash' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatsBar() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.statsBar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
      {STATS.map((s, i) => (
        <View key={s.label} style={[styles.statItem, i < STATS.length - 1 && styles.statDivider]}>
          <Ionicons name={s.icon} size={18} color="rgba(255,255,255,0.8)" />
          <Text style={styles.statValue}>{s.value}</Text>
          <Text style={styles.statLabel}>{s.label}</Text>
        </View>
      ))}
    </LinearGradient>
  );
}

function AgentCard({ agent }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.agentCard}>
      <Image source={{ uri: agent.image }} style={styles.agentImg} />
      <View style={styles.agentBadge}>
        <Ionicons name="star" size={8} color={colors.white} />
        <Text style={styles.agentBadgeText}>{agent.rating}</Text>
      </View>
      <Text style={styles.agentName} numberOfLines={1}>{agent.name}</Text>
      <Text style={styles.agentDeals}>{agent.deals} deals</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [quickFilter, setQuickFilter] = useState('all');
  const scrollY = useRef(new Animated.Value(0)).current;

  const CATEGORIES = CATEGORIES_DATA.map(cat => ({
    ...cat,
    color: colors[cat.themeColor],
    bg: colors.isDark ? 'rgba(255,255,255,0.05)' : '#EEF2FF'
  }));

  // Animated header height collapse
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [90, 0],
    extrapolate: 'clamp',
  });

  const filteredProperties = useCallback(() => {
    if (quickFilter === 'featured') return PROPERTIES.filter((p) => p.featured);
    if (quickFilter === 'new')      return PROPERTIES.slice(-5);
    if (quickFilter === 'cheap')    return PROPERTIES.filter((p) => p.price < 1000);
    return PROPERTIES.slice(0, 6);
  }, [quickFilter])();

  const handlePropPress = useCallback(
    (property) => navigation.navigate('PropertyDetail', { property }),
    [navigation]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      {/* ── Fixed top header ── */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Bonjour 👋</Text>
          <Text style={styles.headline}>Trouvez votre chez-vous</Text>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Inbox')}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.85}
            style={styles.avatarWrap}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' }}
              style={styles.avatar}
            />
            <View style={styles.onlineDot} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* ── Search bar ── */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.9}
        >
          <View style={styles.searchInner}>
            <Ionicons name="search-outline" size={18} color={colors.textLight} />
            <Text style={styles.searchPlaceholder}>Ville, quartier, adresse…</Text>
          </View>
          <View style={styles.filterChip}>
            <Ionicons name="options-outline" size={16} color={colors.primary} />
          </View>
        </TouchableOpacity>

        {/* ── Stats bar ── */}
        <StatsBar />

        {/* ── Categories ── */}
        <SectionHeader
          title="Catégories"
          onSeeAll={() => navigation.navigate('Search')}
          style={styles.sectionHeader}
        />

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
              <View style={[styles.categoryIcon, { backgroundColor: cat.bg }]}>
                <Ionicons name={cat.icon} size={24} color={cat.color} />
              </View>
              <Text style={styles.categoryLabel}>{cat.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Quick filters ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFilters}
        >
          {QUICK_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.qfChip, quickFilter === f.id && styles.qfChipActive]}
              onPress={() => setQuickFilter(f.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.qfLabel, quickFilter === f.id && styles.qfLabelActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Featured properties ── */}
        <SectionHeader
          title="Propriétés"
          onSeeAll={() => navigation.navigate('Search')}
          style={styles.sectionHeader}
        />

        {filteredProperties.map((prop) => (
          <PropertyCard
            key={prop.id}
            property={prop}
            onPress={() => handlePropPress(prop)}
          />
        ))}

        {/* ── Top Agents ── */}
        <SectionHeader
          title="Agents vedettes"
          style={styles.sectionHeader}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.agentsRow}
        >
          {AGENTS.map((a) => (
            <AgentCard key={a.id} agent={a} />
          ))}
        </ScrollView>

        {/* ── Market Insights banner ── */}
        <TouchableOpacity
          style={styles.insightsBanner}
          onPress={() => navigation.navigate('MarketInsights')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={GRADIENTS.teal}
            style={styles.insightsGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View>
              <Text style={styles.insightsTitle}>📊 Market Insights</Text>
              <Text style={styles.insightsSub}>Prix moyen par ville · Tendances</Text>
            </View>
            <View style={styles.insightsArrow}>
              <Ionicons name="arrow-forward" size={18} color={colors.white} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const getStyles = (colors) => StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: SIZES.medium, paddingBottom: 110 },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.medium,
    paddingTop: SIZES.medium,
    paddingBottom: SIZES.small,
    backgroundColor: colors.background,
  },
  greeting:  { ...FONTS.body2, color: colors.textLight },
  headline:  { ...FONTS.h2, color: colors.text, marginTop: 2 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notifBtn: {
    width: 40, height: 40,
    borderRadius: SIZES.radius.md,
    backgroundColor: colors.card,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.light,
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.accent,
    borderWidth: 1.5, borderColor: colors.background,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 2, borderColor: colors.primary,
  },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2, borderColor: colors.background,
  },

  // Search bar
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SIZES.medium,
    paddingVertical: 12,
    marginTop: SIZES.small,
    marginBottom: SIZES.medium,
    gap: 10,
    ...SHADOWS.light,
  },
  searchInner: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchPlaceholder: { ...FONTS.body1, color: colors.textLight },
  filterChip: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: colors.primaryOpacity,
    justifyContent: 'center', alignItems: 'center',
  },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    borderRadius: SIZES.radius.lg,
    marginBottom: SIZES.large,
    paddingVertical: SIZES.medium,
    ...SHADOWS.glow,
  },
  statItem: {
    flex: 1, alignItems: 'center', gap: 4,
  },
  statDivider: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.2)',
  },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.white },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '500', textTransform: 'uppercase' },

  // Section header
  sectionHeader: { marginTop: SIZES.small },

  // Categories
  categoriesRow: { paddingBottom: SIZES.large, gap: 12 },
  categoryCard: { alignItems: 'center', gap: 8, marginRight: 4 },
  categoryIcon: {
    width: 64, height: 64,
    borderRadius: SIZES.radius.lg,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.xs,
  },
  categoryLabel: { ...FONTS.caption, color: colors.text, fontWeight: '600' },

  // Quick filters
  quickFilters: { gap: 8, paddingBottom: SIZES.large },
  qfChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: SIZES.radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1.5, borderColor: 'transparent',
    ...SHADOWS.xs,
  },
  qfChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryOpacity,
  },
  qfLabel:       { ...FONTS.caption, color: colors.textLight, fontWeight: '600' },
  qfLabelActive: { color: colors.primary },

  // Agents
  agentsRow: { gap: 14, paddingBottom: SIZES.large },
  agentCard: { alignItems: 'center', width: 90, gap: 4 },
  agentImg: {
    width: 68, height: 68, borderRadius: 34,
    borderWidth: 2, borderColor: colors.primaryOpacity,
  },
  agentBadge: {
    position: 'absolute', top: 44, right: 4,
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: '#FFC107', borderRadius: 10,
    paddingHorizontal: 5, paddingVertical: 2,
    borderWidth: 1.5, borderColor: colors.white,
  },
  agentBadgeText: { fontSize: 9, fontWeight: '700', color: colors.white },
  agentName: { ...FONTS.caption, color: colors.text, fontWeight: '600', textAlign: 'center' },
  agentDeals: { fontSize: 10, color: colors.textLight, textAlign: 'center' },

  // Market Insights banner
  insightsBanner: { borderRadius: SIZES.radius.lg, overflow: 'hidden', marginTop: SIZES.small, ...SHADOWS.medium },
  insightsGrad: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.medium,
  },
  insightsTitle: { ...FONTS.h3, color: colors.white },
  insightsSub:   { ...FONTS.caption, color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  insightsArrow: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
});


