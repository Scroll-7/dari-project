import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FONTS, GRADIENTS, SHADOWS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

// ─── Static mock data (no color refs at module scope) ─────────────────────────

const CITY_PRICES_RAW = [
  { city: 'Tunis (Centre)',     avg: 1850, trend: +8.2,  colorKey: 'primary' },
  { city: 'La Marsa',          avg: 2400, trend: +5.1,  colorKey: 'teal' },
  { city: 'Les Berges du Lac', avg: 2200, trend: +12.4, colorKey: 'rose' },
  { city: 'Sfax',              avg: 900,  trend: +3.0,  colorKey: 'gold' },
  { city: 'Sousse',            avg: 1100, trend: +6.8,  colorKey: 'violet' },
  { city: 'Hammamet',          avg: 1600, trend: +2.1,  colorKey: 'success' },
];

const MAX_PRICE = Math.max(...CITY_PRICES_RAW.map((c) => c.avg));

const HOT_NEIGHBORHOODS = [
  { name: 'Les Berges du Lac', growth: '+12.4%', rank: 1 },
  { name: 'La Marsa',         growth: '+5.1%',  rank: 2 },
  { name: 'El Menzah',        growth: '+4.8%',  rank: 3 },
  { name: 'Gammarth',         growth: '+4.2%',  rank: 4 },
  { name: 'Ennahli',          growth: '+3.9%',  rank: 5 },
];

const STATS_OVERVIEW = [
  { label: 'Annonces actives', value: '1 247', icon: 'home',   change: '+48',   up: true },
  { label: 'Prix moyen/m²',   value: '21 TND', icon: 'cash',   change: '+3.2%', up: true },
  { label: 'Délai location',  value: '12 j',  icon: 'time',   change: '-2 j',  up: true },
  { label: 'Demandes/sem.',   value: '340',   icon: 'people', change: '+18%',  up: true },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function BarChart({ cityPrices, styles }) {
  return (
    <View style={styles.chartWrap}>
      {cityPrices.map((item) => {
        const barFraction = item.avg / MAX_PRICE;
        return (
          <View key={item.city} style={styles.barRow}>
            <Text style={styles.barCity} numberOfLines={1}>{item.city}</Text>
            <View style={styles.barTrack}>
              <LinearGradient
                colors={[item.color + 'AA', item.color]}
                style={[styles.barFill, { width: `${barFraction * 100}%` }]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={styles.barValue}>{item.avg.toLocaleString()} TND</Text>
          </View>
        );
      })}
    </View>
  );
}

function TrendCard({ item, colors, styles }) {
  const isUp = item.trend > 0;
  return (
    <View style={styles.trendCard}>
      <View style={[styles.trendDot, { backgroundColor: item.color }]} />
      <View style={styles.trendInfo}>
        <Text style={styles.trendCity}>{item.city}</Text>
        <Text style={styles.trendAvg}>{item.avg.toLocaleString()} TND/mois</Text>
      </View>
      <View style={[styles.trendBadge, { backgroundColor: isUp ? '#F0FDF4' : '#FFF1F2' }]}>
        <Ionicons name={isUp ? 'trending-up' : 'trending-down'} size={14} color={isUp ? colors.success : colors.error} />
        <Text style={[styles.trendPct, { color: isUp ? colors.success : colors.error }]}>
          {isUp ? '+' : ''}{item.trend}%
        </Text>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MarketInsightsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // Resolve color keys to actual theme colors at render time
  const cityPrices = CITY_PRICES_RAW.map(item => ({
    ...item,
    color: colors[item.colorKey] || colors.primary,
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} />

      {/* ── Gradient header ── */}
      <LinearGradient colors={GRADIENTS.teal} style={styles.gradHeader} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Market Insights</Text>
          <Text style={styles.headerSub}>Données immobilières Tunisie · Avr 2026</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Overview stats ── */}
        <View style={styles.statsGrid}>
          {STATS_OVERVIEW.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Ionicons name={s.icon} size={20} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel} numberOfLines={2}>{s.label}</Text>
              <View style={styles.statChange}>
                <Ionicons name={s.up ? 'arrow-up-circle' : 'arrow-down-circle'} size={12} color={s.up ? colors.success : colors.error} />
                <Text style={[styles.statChangeTxt, { color: s.up ? colors.success : colors.error }]}>{s.change}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Bar chart: avg price by city ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Prix moyen par ville</Text>
          <Text style={styles.sectionSub}>Loyer mensuel médian (TND)</Text>
          <BarChart cityPrices={cityPrices} styles={styles} />
        </View>

        {/* ── Trends ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Tendances annuelles</Text>
          <Text style={styles.sectionSub}>Variation des prix sur 12 mois</Text>
          <View style={styles.trendsCol}>
            {cityPrices.map((item) => (
              <TrendCard key={item.city} item={item} colors={colors} styles={styles} />
            ))}
          </View>
        </View>

        {/* ── Hot neighborhoods ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Quartiers les plus recherchés</Text>
          <Text style={styles.sectionSub}>Croissance de la demande</Text>
          <View style={styles.neighborhoodList}>
            {HOT_NEIGHBORHOODS.map((n) => (
              <View key={n.name} style={styles.neighborhoodItem}>
                <View style={styles.rankCircle}>
                  <Text style={styles.rankText}>{n.rank}</Text>
                </View>
                <Text style={styles.neighborhoodName}>{n.name}</Text>
                <View style={styles.growthBadge}>
                  <Text style={styles.growthText}>{n.growth}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Disclaimer ── */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={14} color={colors.textLight} />
          <Text style={styles.disclaimerText}>
            Données basées sur les annonces Dari · Mise à jour mensuelle
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const getStyles = (colors) => StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 40 },

  gradHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.medium, paddingTop: SIZES.large, paddingBottom: SIZES.large,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { ...FONTS.h2, color: colors.white, textAlign: 'center' },
  headerSub:   { ...FONTS.caption, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 2 },

  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.small,
    padding: SIZES.medium,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.card, borderRadius: SIZES.radius.lg,
    padding: SIZES.medium, ...SHADOWS.light,
  },
  statIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.primaryOpacity,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  statValue:     { ...FONTS.h2, color: colors.text },
  statLabel:     { ...FONTS.caption, color: colors.textLight, marginTop: 2 },
  statChange:    { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 },
  statChangeTxt: { fontSize: 11, fontWeight: '700' },

  section: { paddingHorizontal: SIZES.medium, marginBottom: SIZES.large },
  sectionTitle: { ...FONTS.h3, color: colors.text, marginBottom: 4 },
  sectionSub:   { ...FONTS.caption, color: colors.textLight, marginBottom: SIZES.medium },

  chartWrap: { gap: 14 },
  barRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barCity:   { width: 100, ...FONTS.caption, color: colors.text, fontWeight: '500' },
  barTrack:  { flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.line, overflow: 'hidden' },
  barFill:   { height: '100%', borderRadius: 5 },
  barValue:  { width: 72, ...FONTS.caption, color: colors.text, fontWeight: '600', textAlign: 'right' },

  trendsCol: { gap: SIZES.small },
  trendCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.card, borderRadius: SIZES.radius.lg,
    padding: SIZES.medium, ...SHADOWS.xs,
  },
  trendDot:  { width: 10, height: 10, borderRadius: 5 },
  trendInfo: { flex: 1 },
  trendCity: { ...FONTS.h3, color: colors.text, fontSize: 14 },
  trendAvg:  { ...FONTS.caption, color: colors.textLight, marginTop: 2 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: SIZES.radius.pill },
  trendPct:  { fontSize: 12, fontWeight: '700' },

  neighborhoodList: { gap: SIZES.small },
  neighborhoodItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.card, borderRadius: SIZES.radius.lg,
    padding: SIZES.medium, ...SHADOWS.xs,
  },
  rankCircle: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.primaryOpacity,
    justifyContent: 'center', alignItems: 'center',
  },
  rankText:         { ...FONTS.caption, color: colors.primary, fontWeight: '700' },
  neighborhoodName: { flex: 1, ...FONTS.body1, color: colors.text, fontWeight: '500' },
  growthBadge: {
    backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: SIZES.radius.pill,
  },
  growthText: { fontSize: 12, fontWeight: '700', color: colors.success },

  disclaimer: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: SIZES.medium, marginTop: SIZES.small,
  },
  disclaimerText: { ...FONTS.caption, color: colors.textLight, flex: 1 },
});
