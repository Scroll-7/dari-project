import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFavorites } from '../context/FavoritesContext';
import { FONTS, SHADOWS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

/**
 * PropertyCard — shared card used in Home, Search, and SavedProperties screens.
 *
 * Props:
 *  property  — property object from mockData
 *  onPress   — tap handler
 *  style     — optional outer style override
 *  horizontal— if true, renders a compact horizontal layout
 */
const PropertyCard = React.memo(function PropertyCard({
  property,
  onPress,
  style,
  horizontal = false,
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(property.id);

  const handleFav = useCallback(
    (e) => {
      e.stopPropagation?.();
      toggleFavorite(property.id);
    },
    [property.id, toggleFavorite]
  );

  if (horizontal) {
    return (
      <TouchableOpacity
        style={[styles.horz, style]}
        onPress={onPress}
        activeOpacity={0.88}
      >
        <Image source={{ uri: property.image }} style={styles.horzImg} />
        <View style={styles.horzBody}>
          <Text style={styles.horzTitle} numberOfLines={1}>
            {property.title}
          </Text>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={11} color={colors.textLight} />
            <Text style={styles.horzSub} numberOfLines={1}>
              {' '}{property.neighborhood}, {property.city}
            </Text>
          </View>
          <View style={styles.horzFooter}>
            <Text style={styles.horzPrice}>
              {property.price.toLocaleString()} TND
              <Text style={styles.period}>/{property.period}</Text>
            </Text>
            <View style={styles.horzBadge}>
              <Text style={styles.horzBadgeText}>{property.type}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.horzFav} onPress={handleFav} activeOpacity={0.8}>
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={16}
            color={saved ? colors.accent : colors.textLight}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  // Vertical card (default)
  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imgWrap}>
        <Image source={{ uri: property.image }} style={styles.img} />

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.70)']}
          style={styles.overlay}
        />

        {/* Fav button */}
        <TouchableOpacity style={styles.favBtn} onPress={handleFav} activeOpacity={0.85}>
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={18}
            color={saved ? colors.accent : colors.white}
          />
        </TouchableOpacity>

        {/* Price badge */}
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>
            {property.price.toLocaleString()} TND
          </Text>
        </View>

        {/* Info overlay */}
        <View style={styles.infoOverlay}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {property.title}
          </Text>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={styles.cardSub}>
              {' '}{property.neighborhood}, {property.city}
            </Text>
          </View>
          <View style={[styles.row, { marginTop: 6, gap: 12 }]}>
            <View style={styles.statChip}>
              <Ionicons name="bed-outline" size={11} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statText}>{property.bedrooms}</Text>
            </View>
            <View style={styles.statChip}>
              <Ionicons name="water-outline" size={11} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statText}>{property.bathrooms}</Text>
            </View>
            <View style={styles.statChip}>
              <Ionicons name="resize-outline" size={11} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statText}>{property.area}m²</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default PropertyCard;

const getStyles = (colors) => StyleSheet.create({
  // ── Vertical card ─────────────────────────────────────────────
  card: {
    borderRadius: SIZES.radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.card,
    marginBottom: SIZES.medium,
    ...SHADOWS.medium,
  },
  imgWrap: { height: 210, position: 'relative' },
  img: { width: '100%', height: '100%', resizeMode: 'cover' },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  favBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: SIZES.radius.pill,
  },
  priceText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  infoOverlay: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
  },
  cardTitle: { ...FONTS.h3, color: colors.white, marginBottom: 3 },
  cardSub: { fontSize: 11, color: 'rgba(255,255,255,0.85)' },
  row: { flexDirection: 'row', alignItems: 'center' },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: SIZES.radius.pill,
  },
  statText: { fontSize: 11, color: colors.white, fontWeight: '600' },

  // ── Horizontal card ────────────────────────────────────────────
  horz: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
    marginBottom: SIZES.medium,
    ...SHADOWS.light,
  },
  horzImg: { width: 100, height: 100 },
  horzBody: {
    flex: 1,
    padding: SIZES.small,
    justifyContent: 'space-between',
  },
  horzTitle: { ...FONTS.h3, color: colors.text, fontSize: 14 },
  horzSub: { ...FONTS.caption, color: colors.textLight, marginTop: 2 },
  horzFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  horzPrice: { fontSize: 14, fontWeight: '700', color: colors.primary },
  period: { fontSize: 11, color: colors.textLight, fontWeight: '400' },
  horzBadge: {
    backgroundColor: colors.primaryOpacity,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: SIZES.radius.pill,
  },
  horzBadgeText: { fontSize: 10, color: colors.primary, fontWeight: '600', textTransform: 'capitalize' },
  horzFav: {
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
