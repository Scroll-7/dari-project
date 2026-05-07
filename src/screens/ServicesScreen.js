import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FONTS, GRADIENTS, SHADOWS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

// ─── Static config ────────────────────────────────────────────────────────────

const SERVICES = [
  {
    id: '1', title: 'Plumbing',    icon: 'water-outline',         count: 24,
    gradient: ['#4F46E5', '#7C3AED'], bgLight: '#EEF2FF', topRated: true,
  },
  {
    id: '2', title: 'Electrician', icon: 'flash-outline',         count: 18,
    gradient: ['#F59E0B', '#EF4444'], bgLight: '#FFFBEB', topRated: false,
  },
  {
    id: '3', title: 'Cleaning',    icon: 'sparkles-outline',      count: 45,
    gradient: ['#14B8A6', '#0EA5E9'], bgLight: '#F0FDFA', topRated: true,
  },
  {
    id: '4', title: 'Moving',      icon: 'cube-outline',          count: 12,
    gradient: ['#F72585', '#7209B7'], bgLight: '#FDF2F8', topRated: false,
  },
  {
    id: '5', title: 'Painting',    icon: 'color-palette-outline', count: 9,
    gradient: ['#FB7185', '#F43F5E'], bgLight: '#FFF1F2', topRated: false,
  },
  {
    id: '6', title: 'Carpentry',   icon: 'hammer-outline',        count: 7,
    gradient: ['#8B5CF6', '#6D28D9'], bgLight: '#F5F3FF', topRated: false,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ServiceCard({ service, onPress }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 300, friction: 10 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }).start();
  };

  return (
    <Animated.View style={[styles.cardWrap, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient colors={service.gradient} style={styles.cardGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name={service.icon} size={26} color={colors.white} />
            </View>
            {service.topRated && (
              <View style={styles.topRatedBadge}>
                <Text style={styles.topRatedText}>Top ⭐</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardTitle}>{service.title}</Text>
          <Text style={styles.cardCount}>{service.count} disponibles</Text>
          <View style={styles.cardFooter}>
            <View style={styles.availDot} />
            <Text style={styles.availText}>Prêts maintenant</Text>
            <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.7)" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ServicesScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();

  const handleServicePress = useCallback((service) => {
    navigation.navigate('ServiceProviders', { service: { title: service.title, icon: service.icon } });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.title}>Services</Text>
          <Text style={styles.subtitle}>Trouvez des professionnels de confiance</Text>
        </View>

        {/* ── Emergency Banner ── */}
        <LinearGradient colors={GRADIENTS.gold} style={styles.emergencyBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Ionicons name="warning-outline" size={22} color={colors.white} />
          <View style={styles.emergencyText}>
            <Text style={styles.emergencyTitle}>Services d'urgence 24/7</Text>
            <Text style={styles.emergencySub}>Plombier · Électricien disponible maintenant</Text>
          </View>
          <TouchableOpacity style={styles.emergencyBtn}>
            <Text style={styles.emergencyBtnText}>Appeler</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Service grid ── */}
        <View style={styles.grid}>
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onPress={() => handleServicePress(service)}
            />
          ))}
        </View>

        {/* ── Trust banner ── */}
        <View style={styles.trustBanner}>
          {[
            { icon: 'shield-checkmark-outline', text: 'Vérifiés' },
            { icon: 'star-outline',             text: 'Notés' },
            { icon: 'card-outline',             text: 'Paiement sécurisé' },
          ].map((item) => (
            <View key={item.text} style={styles.trustItem}>
              <Ionicons name={item.icon} size={20} color={colors.primary} />
              <Text style={styles.trustText}>{item.text}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const getStyles = (colors) => StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 110 },

  header: {
    paddingHorizontal: SIZES.medium,
    paddingTop: SIZES.large, paddingBottom: SIZES.medium,
  },
  title:    { ...FONTS.h1, color: colors.text },
  subtitle: { ...FONTS.body2, color: colors.textLight, marginTop: 4 },

  // Emergency banner
  emergencyBanner: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: SIZES.medium, borderRadius: SIZES.radius.lg,
    padding: SIZES.medium, gap: 10, marginBottom: SIZES.large,
  },
  emergencyText:    { flex: 1 },
  emergencyTitle:   { ...FONTS.body1, color: colors.white, fontWeight: '700' },
  emergencySub:     { ...FONTS.caption, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  emergencyBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: SIZES.radius.pill,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  emergencyBtnText: { ...FONTS.caption, color: colors.white, fontWeight: '700' },

  // Grid
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: SIZES.medium, gap: SIZES.medium,
  },
  cardWrap: { width: '47%' },
  card:     { borderRadius: SIZES.radius.xl, overflow: 'hidden' },
  cardGrad: { padding: SIZES.medium, minHeight: 160 },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: SIZES.medium,
  },
  iconCircle: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  topRatedBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: SIZES.radius.pill,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  topRatedText: { fontSize: 10, fontWeight: '700', color: colors.white },
  cardTitle:    { ...FONTS.h3, color: colors.white },
  cardCount:    { ...FONTS.caption, color: 'rgba(255,255,255,0.8)', marginTop: 4, marginBottom: SIZES.small },
  cardFooter:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  availDot:     { width: 7, height: 7, borderRadius: 4, backgroundColor: '#A7F3D0' },
  availText:    { ...FONTS.caption, color: 'rgba(255,255,255,0.85)', flex: 1 },

  // Trust banner
  trustBanner: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: colors.card,
    marginHorizontal: SIZES.medium, borderRadius: SIZES.radius.lg,
    padding: SIZES.medium, marginTop: SIZES.medium,
    ...SHADOWS.light,
  },
  trustItem: { alignItems: 'center', gap: 6 },
  trustText: { ...FONTS.caption, color: colors.textLight, fontWeight: '600' },
});
