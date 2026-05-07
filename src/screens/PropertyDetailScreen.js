import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import {
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useFavorites } from '../context/FavoritesContext';
import { useConversations } from '../context/ConversationContext';
import { StarRating } from '../components/StarRating';
import { FONTS, GRADIENTS, SHADOWS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

// ─── Mock extensions ──────────────────────────────────────────────────────────

const AMENITIES = [
  { icon: 'wifi-outline',    label: 'WiFi' },
  { icon: 'car-outline',     label: 'Parking' },
  { icon: 'snow-outline',    label: 'A/C' },
  { icon: 'shield-checkmark-outline', label: 'Secured' },
  { icon: 'tv-outline',      label: 'TV' },
  { icon: 'fitness-outline', label: 'Gym' },
];

const AGENT = {
  name: 'Amira Khedija',
  role: 'Agent immobilier senior',
  image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  rating: 4.9,
  reviews: 124,
  phone: '+216 55 123 456',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function AmenityChip({ icon, label, colors, styles }) {
  return (
    <View style={styles.amenity}>
      <View style={styles.amenityIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={styles.amenityLabel}>{label}</Text>
    </View>
  );
}

function StatBox({ icon, value, label, colors, styles }) {
  return (
    <View style={styles.statBox}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PropertyDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { property } = route.params;
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openOrCreateConversation } = useConversations();

  const saved = isFavorite(property.id);

  const handleCall = useCallback(() => {
    const url = `tel:${AGENT.phone.replace(/\s/g, '')}`;
    Linking.canOpenURL(url)
      .then((ok) => ok && Linking.openURL(url))
      .catch(() => Alert.alert('Erreur', "Impossible d'effectuer l'appel."));
  }, []);

  const handleChat = useCallback(() => {
    openOrCreateConversation({ id: `prop_${property.id}`, name: property.title, tag: 'property' });
    navigation.navigate('Chat', { personId: `prop_${property.id}` });
  }, [property, navigation, openOrCreateConversation]);

  const pricePerM2 = property.area
    ? Math.round(property.price / property.area)
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Hero image ── */}
        <View style={styles.hero}>
          <Image source={{ uri: property.image }} style={styles.heroImg} />
          <LinearGradient
            colors={['rgba(0,0,0,0.45)', 'transparent', 'transparent', 'rgba(0,0,0,0.6)']}
            style={StyleSheet.absoluteFill}
          />

          {/* Back & Save buttons */}
          <View style={styles.heroTopRow}>
            <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.heroTopRight}>
              <TouchableOpacity style={styles.heroBtn} onPress={() => toggleFavorite(property.id)}>
                <Ionicons name={saved ? 'heart' : 'heart-outline'} size={20} color={saved ? colors.accent : colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroBtn}>
                <Ionicons name="share-social-outline" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Type badge */}
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{property.type?.toUpperCase()}</Text>
          </View>
        </View>

        {/* ── Body ── */}
        <View style={styles.body}>

          {/* Title & price */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{property.title}</Text>
              <View style={styles.locRow}>
                <Ionicons name="location-outline" size={13} color={colors.textLight} />
                <Text style={styles.loc}> {property.neighborhood}, {property.city}</Text>
              </View>
            </View>
            <View style={styles.priceBlock}>
              <Text style={styles.price}>{property.price.toLocaleString()}<Text style={styles.currency}> TND</Text></Text>
              <Text style={styles.period}>/{property.period}</Text>
              {pricePerM2 && <Text style={styles.pricePerM2}>{pricePerM2} TND/m²</Text>}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {property.bedrooms > 0 && <StatBox icon="bed-outline"    value={property.bedrooms} label="Chambres" colors={colors} styles={styles} />}
            {property.bathrooms > 0 && <StatBox icon="water-outline"  value={property.bathrooms} label="SdB" colors={colors} styles={styles} />}
            <StatBox icon="resize-outline" value={`${property.area}m²`} label="Surface" colors={colors} styles={styles} />
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.desc}>{property.description}</Text>

          {/* Amenities */}
          <Text style={styles.sectionTitle}>Équipements</Text>
          <View style={styles.amenitiesGrid}>
            {AMENITIES.map((a) => (
              <AmenityChip key={a.label} icon={a.icon} label={a.label} colors={colors} styles={styles} />
            ))}
          </View>

          {/* Virtual tour button */}
          <TouchableOpacity style={styles.tourBtn} activeOpacity={0.85}>
            <LinearGradient colors={GRADIENTS.teal} style={styles.tourGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="videocam-outline" size={20} color={colors.white} />
              <Text style={styles.tourText}>Visite Virtuelle 360°</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Agent card */}
          <Text style={styles.sectionTitle}>Agent responsable</Text>
          <View style={styles.agentCard}>
            <Image source={{ uri: AGENT.image }} style={styles.agentImg} />
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{AGENT.name}</Text>
              <Text style={styles.agentRole}>{AGENT.role}</Text>
              <StarRating rating={AGENT.rating} reviews={AGENT.reviews} size={12} />
            </View>
            <TouchableOpacity style={styles.agentChatBtn} onPress={handleChat}>
              <Ionicons name="chatbubble-ellipses" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      {/* ── Sticky bottom CTA ── */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPrice}>
          <Text style={styles.bottomPriceVal}>{property.price.toLocaleString()} TND</Text>
          <Text style={styles.bottomPricePeriod}>/{property.period}</Text>
        </View>
        <View style={styles.bottomBtns}>
          <TouchableOpacity style={styles.chatBtnSmall} onPress={handleChat}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.callBtn} onPress={handleCall} activeOpacity={0.88}>
            <LinearGradient colors={colors.gradientPrimary || GRADIENTS.primary} style={styles.callGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="call" size={18} color={colors.white} />
              <Text style={styles.callText}>Contacter</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const getStyles = (colors) => StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 100 },

  // Hero
  hero:       { height: 320, position: 'relative' },
  heroImg:    { width: '100%', height: '100%', resizeMode: 'cover' },
  heroTopRow: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.medium, paddingTop: SIZES.large,
  },
  heroTopRight: { flexDirection: 'row', gap: 10 },
  heroBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.40)',
    justifyContent: 'center', alignItems: 'center',
  },
  typeBadge: {
    position: 'absolute', bottom: 16, left: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: SIZES.radius.pill,
  },
  typeBadgeText: { ...FONTS.label, color: colors.white },

  // Body
  body: { padding: SIZES.medium },

  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SIZES.medium },
  title: { ...FONTS.h2, color: colors.text },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  loc:   { ...FONTS.caption, color: colors.textLight, textTransform: 'capitalize' },

  priceBlock: { alignItems: 'flex-end', minWidth: 100 },
  price: { fontSize: 20, fontWeight: '800', color: colors.primary },
  currency: { fontSize: 14, fontWeight: '600' },
  period: { ...FONTS.caption, color: colors.textLight },
  pricePerM2: { fontSize: 10, color: colors.textLight, marginTop: 2 },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.medium,
    marginBottom: SIZES.large,
    ...SHADOWS.light,
  },
  statBox: { alignItems: 'center', gap: 4 },
  statVal: { ...FONTS.h3, color: colors.text },
  statLbl: { ...FONTS.caption, color: colors.textLight },

  sectionTitle: { ...FONTS.h3, color: colors.text, marginBottom: SIZES.small, marginTop: SIZES.medium },

  desc: { ...FONTS.body1, color: colors.textBody, lineHeight: 24 },

  amenitiesGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.small,
  },
  amenity: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primaryOpacity,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: SIZES.radius.md,
  },
  amenityIcon: {},
  amenityLabel: { ...FONTS.caption, color: colors.primary, fontWeight: '600' },

  // Virtual tour
  tourBtn: { borderRadius: SIZES.radius.lg, overflow: 'hidden', marginTop: SIZES.medium, ...SHADOWS.glow },
  tourGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: SIZES.medium,
  },
  tourText: { ...FONTS.h3, color: colors.white },

  // Agent card
  agentCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: SIZES.radius.lg, padding: SIZES.medium, gap: 12,
    ...SHADOWS.light,
  },
  agentImg: { width: 54, height: 54, borderRadius: 27 },
  agentInfo: { flex: 1 },
  agentName: { ...FONTS.h3, color: colors.text },
  agentRole: { ...FONTS.caption, color: colors.textLight, marginBottom: 4 },
  agentChatBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primaryOpacity,
    justifyContent: 'center', alignItems: 'center',
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    paddingHorizontal: SIZES.medium,
    paddingVertical: 12,
    paddingBottom: 18,
    borderTopWidth: 1, borderTopColor: colors.line,
    ...SHADOWS.medium,
  },
  bottomPrice: {},
  bottomPriceVal: { fontSize: 18, fontWeight: '800', color: colors.primary },
  bottomPricePeriod: { ...FONTS.caption, color: colors.textLight },
  bottomBtns: { flexDirection: 'row', gap: 10 },
  chatBtnSmall: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: colors.primaryOpacity,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.xs,
  },
  callBtn: { borderRadius: SIZES.radius.pill, overflow: 'hidden', ...SHADOWS.glow },
  callGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: SIZES.large, paddingVertical: 12,
  },
  callText: { color: colors.white, fontSize: 14, fontWeight: '700' },
});
