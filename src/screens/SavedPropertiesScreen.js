import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PropertyCard from '../components/PropertyCard';
import { useFavorites } from '../context/FavoritesContext';
import { PROPERTIES } from '../constants/mockData';
import { FONTS, GRADIENTS, SHADOWS, SIZES } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

export default function SavedPropertiesScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { getFavoriteIds, toggleFavorite } = useFavorites();
  const savedIds = getFavoriteIds();
  const data     = PROPERTIES.filter((p) => savedIds.includes(p.id));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Gradient header */}
      <LinearGradient colors={GRADIENTS.accent} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Propriétés sauvegardées</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{data.length}</Text>
        </View>
      </LinearGradient>

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="heart-outline" size={48} color={colors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>Aucune propriété sauvegardée</Text>
            <Text style={styles.emptySub}>Appuyez sur le cœur sur n'importe quelle annonce pour la sauvegarder ici.</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Search')}>
              <Text style={styles.browseBtnText}>Parcourir les annonces</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => navigation.navigate('PropertyDetail', { property: item })}
            horizontal
          />
        )}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: SIZES.medium, paddingTop: SIZES.large, paddingBottom: SIZES.medium,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { flex: 1, ...FONTS.h3, color: colors.white },
  countBadge: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  countText: { ...FONTS.caption, color: colors.white, fontWeight: '700' },

  list: { padding: SIZES.medium, paddingBottom: 100 },

  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: SIZES.xl },
  emptyIcon: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: colors.primaryOpacity,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SIZES.large,
  },
  emptyTitle: { ...FONTS.h3, color: colors.text, textAlign: 'center' },
  emptySub:   { ...FONTS.body2, color: colors.textLight, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  browseBtn: {
    marginTop: SIZES.large,
    backgroundColor: colors.primary,
    paddingHorizontal: SIZES.large, paddingVertical: 12,
    borderRadius: SIZES.radius.pill,
    ...SHADOWS.glow,
  },
  browseBtnText: { ...FONTS.body1, color: colors.white, fontWeight: '700' },
});


