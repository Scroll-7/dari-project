import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { FilterPill } from '../components/FilterPill';
import PropertyCard from '../components/PropertyCard';
import { CITIES, PROPERTIES } from '../constants/mockData';
import { FONTS, GRADIENTS, SHADOWS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

// ─── Static config ────────────────────────────────────────────────────────────

const TYPE_FILTERS = [
  { label: 'Tous', value: 'all' },
  { label: 'Appart.', value: 'apartment' },
  { label: 'Maisons', value: 'house' },
  { label: 'Chambres', value: 'room' },
  { label: 'Commerce', value: 'commercial' },
];

const PRICE_RANGES = [
  { label: 'Tous prix', min: 0, max: Infinity },
  { label: '< 800 TND', min: 0, max: 799 },
  { label: '800–2000', min: 800, max: 2000 },
  { label: '> 2000 TND', min: 2001, max: Infinity },
];

const SORT_OPTIONS = [
  { label: 'Pertinence', value: 'default' },
  { label: 'Prix ↑', value: 'price_asc' },
  { label: 'Prix ↓', value: 'price_desc' },
  { label: 'Plus récent', value: 'newest' },
  { label: 'Surface ↑', value: 'area' },
];

const RECENT_SEARCHES = ['Tunis', 'La Marsa', 'Sfax', 'Sousse'];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SearchScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priceIdx, setPriceIdx] = useState(0);
  const [sortBy, setSortBy] = useState('default');
  const [showSuggs, setShowSuggs] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'

  const citySuggestions = useMemo(() => {
    if (!query) return [];
    return CITIES.filter((c) => c.toLowerCase().startsWith(query.toLowerCase()));
  }, [query]);

  const results = useMemo(() => {
    const pf = PRICE_RANGES[priceIdx];
    let arr = PROPERTIES.filter((p) => {
      const matchCity = query
        ? p.city.toLowerCase().includes(query.toLowerCase()) ||
        p.neighborhood.toLowerCase().includes(query.toLowerCase())
        : true;
      const matchType = typeFilter === 'all' || p.type === typeFilter;
      const matchPrice = p.price >= pf.min && p.price <= pf.max;
      return matchCity && matchType && matchPrice;
    });

    if (sortBy === 'price_asc') arr = arr.sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') arr = arr.sort((a, b) => b.price - a.price);
    if (sortBy === 'area') arr = arr.sort((a, b) => (b.area ?? 0) - (a.area ?? 0));
    if (sortBy === 'newest') arr = arr.slice().reverse();

    return arr;
  }, [query, typeFilter, priceIdx, sortBy]);

  const handlePropertyPress = useCallback(
    (property) => navigation.navigate('PropertyDetail', { property }),
    [navigation]
  );

  const activeFiltersCount =
    (typeFilter !== 'all' ? 1 : 0) +
    (priceIdx !== 0 ? 1 : 0) +
    (sortBy !== 'default' ? 1 : 0);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Search header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.inputWrap}>
          <Ionicons name="search" size={16} color={colors.textLight} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.input}
            placeholder="Ville, quartier, adresse…"
            placeholderTextColor={colors.textLight}
            value={query}
            onChangeText={(t) => { setQuery(t); setShowSuggs(true); }}
            onFocus={() => setShowSuggs(true)}
            onBlur={() => setTimeout(() => setShowSuggs(false), 150)}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter button with badge */}
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilter(true)}>
          <Ionicons name="options-outline" size={20} color={colors.primary} />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── City suggestions dropdown ── */}
      {showSuggs && citySuggestions.length > 0 && (
        <View style={styles.suggestions}>
          {citySuggestions.map((city) => (
            <TouchableOpacity
              key={city}
              style={styles.suggItem}
              onPress={() => { setQuery(city); setShowSuggs(false); }}
            >
              <Ionicons name="location-outline" size={14} color={colors.textLight} />
              <Text style={styles.suggText}>{city}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Recent searches (shown when query is empty) ── */}
      {!query && (
        <View style={styles.recentRowWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: SIZES.medium }}>
            {RECENT_SEARCHES.map((r) => (
              <TouchableOpacity key={r} style={styles.recentChip} onPress={() => setQuery(r)}>
                <Ionicons name="time-outline" size={12} color={colors.textLight} />
                <Text style={styles.recentText}>{r}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Type filter row ── */}
      <View style={styles.typeRowWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: SIZES.medium }}
        >
          {TYPE_FILTERS.map((t) => (
            <FilterPill
              key={t.value}
              label={t.label}
              active={typeFilter === t.value}
              onPress={() => setTypeFilter(t.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── Result count + view toggle ── */}
      <View style={styles.resultBar}>
        <Text style={styles.resultCount}>{results.length} propriétés</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity onPress={() => setViewMode('list')} style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}>
            <Ionicons name="list-outline" size={18} color={viewMode === 'list' ? colors.primary : colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewMode('grid')} style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]}>
            <Ionicons name="grid-outline" size={18} color={viewMode === 'grid' ? colors.primary : colors.textLight} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Results list ── */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // force remount on column change
        contentContainerStyle={[styles.list, viewMode === 'grid' && styles.listGrid]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="home-outline" size={56} color={colors.line} />
            <Text style={styles.emptyTitle}>Aucune propriété trouvée</Text>
            <Text style={styles.emptySub}>Modifiez vos filtres ou cherchez une autre ville</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={viewMode === 'grid' ? styles.gridCell : undefined}>
            <PropertyCard
              property={item}
              onPress={() => handlePropertyPress(item)}
              horizontal={viewMode === 'list'}
            />
          </View>
        )}
      />

      {/* ── Advanced Filter Modal ── */}
      <Modal visible={showFilter} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Handle */}
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>Filtres avancés</Text>

            <Text style={styles.filterLabel}>Prix</Text>
            <View style={styles.pillRow}>
              {PRICE_RANGES.map((p, i) => (
                <FilterPill key={i} label={p.label} active={priceIdx === i} onPress={() => setPriceIdx(i)} />
              ))}
            </View>

            <Text style={styles.filterLabel}>Trier par</Text>
            <View style={styles.pillRow}>
              {SORT_OPTIONS.map((s) => (
                <FilterPill key={s.value} label={s.label} active={sortBy === s.value} onPress={() => setSortBy(s.value)} />
              ))}
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => { setPriceIdx(0); setSortBy('default'); }}
              >
                <Text style={styles.resetText}>Réinitialiser</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilter(false)}>
                <LinearGradient colors={GRADIENTS.primary} style={styles.applyGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.applyText}>Appliquer ({results.length})</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const getStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.medium, paddingVertical: 12, gap: 8,
    backgroundColor: colors.background,
  },
  back: { padding: 4 },
  inputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: SIZES.radius.lg,
    paddingHorizontal: 14, paddingVertical: 11,
    ...SHADOWS.light,
  },
  input: { flex: 1, ...FONTS.body1, color: colors.text },
  filterBtn: {
    width: 44, height: 44, borderRadius: SIZES.radius.md,
    backgroundColor: colors.primaryOpacity,
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute', top: 6, right: 6,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.accent,
    justifyContent: 'center', alignItems: 'center',
  },
  filterBadgeText: { fontSize: 9, color: colors.white, fontWeight: '700' },

  // Suggestions
  suggestions: {
    backgroundColor: colors.card,
    marginHorizontal: SIZES.medium, borderRadius: SIZES.radius.md,
    ...SHADOWS.medium, zIndex: 100,
  },
  suggItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: SIZES.medium, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  suggText: { ...FONTS.body1, color: colors.text },

  // Recent searches
  recentRowWrap: { paddingVertical: 6, marginVertical: 4 },
  recentChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.card, borderRadius: SIZES.radius.pill,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: colors.line,
  },
  recentText: { ...FONTS.caption, color: colors.textLight },

  // Type filter row
  typeRowWrap: { paddingVertical: 6, marginBottom: 8 },

  // Result bar
  resultBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.medium, paddingBottom: 8,
  },
  resultCount: { ...FONTS.body2, color: colors.textLight },
  viewToggle: { flexDirection: 'row', gap: 4 },
  toggleBtn: {
    width: 34, height: 34, borderRadius: SIZES.radius.sm,
    justifyContent: 'center', alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: colors.primaryOpacity },

  // List
  list: { paddingHorizontal: SIZES.medium, paddingBottom: 100 },
  listGrid: { paddingBottom: 100 },
  gridCell: { flex: 1, margin: 6 },

  // Empty
  empty: { alignItems: 'center', marginTop: 60, paddingHorizontal: SIZES.xl },
  emptyTitle: { ...FONTS.h3, color: colors.textLight, marginTop: 16 },
  emptySub: { ...FONTS.body2, color: colors.textLight, textAlign: 'center', marginTop: 6 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: SIZES.large, paddingBottom: 40,
    ...SHADOWS.medium,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.line,
    alignSelf: 'center', marginBottom: SIZES.medium,
  },
  modalTitle: { ...FONTS.h2, color: colors.text, marginBottom: SIZES.large },
  filterLabel: { ...FONTS.label, color: colors.textLight, marginBottom: SIZES.small, marginTop: SIZES.medium },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  // Modal buttons
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: SIZES.large },
  resetBtn: {
    flex: 1, paddingVertical: 14, borderRadius: SIZES.radius.lg,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center',
  },
  resetText: { ...FONTS.body1, color: colors.text, fontWeight: '600' },
  applyBtn: { flex: 2, borderRadius: SIZES.radius.lg, overflow: 'hidden', ...SHADOWS.glow },
  applyGrad: { paddingVertical: 14, alignItems: 'center' },
  applyText: { ...FONTS.body1, color: colors.white, fontWeight: '700' },
});

