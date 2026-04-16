import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  Image, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PROPERTIES, CITIES } from '../constants/mockData';

const PRICE_FILTERS = [
  { label: 'All', min: 0, max: Infinity },
  { label: '< 1000 TND', min: 0, max: 999 },
  { label: '1000–2000', min: 1000, max: 2000 },
  { label: '> 2000 TND', min: 2001, max: Infinity },
];

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const citySuggestions = useMemo(() => {
    if (!query) return [];
    return CITIES.filter(c => c.toLowerCase().startsWith(query.toLowerCase()));
  }, [query]);

  const results = useMemo(() => {
    return PROPERTIES.filter(p => {
      const matchCity = query ? p.city.toLowerCase().includes(query.toLowerCase()) || p.neighborhood.toLowerCase().includes(query.toLowerCase()) : true;
      const matchType = typeFilter === 'all' ? true : p.type === typeFilter;
      const pf = PRICE_FILTERS[priceFilter];
      const matchPrice = p.price >= pf.min && p.price <= pf.max;
      return matchCity && matchType && matchPrice;
    });
  }, [query, typeFilter, priceFilter]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Search Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <View style={styles.inputWrap}>
          <Ionicons name="search" size={16} color="#999" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.input}
            placeholder="Search city or neighborhood..."
            value={query}
            onChangeText={t => { setQuery(t); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={16} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* City Suggestions */}
      {showSuggestions && citySuggestions.length > 0 && (
        <View style={styles.suggestions}>
          {citySuggestions.map(city => (
            <TouchableOpacity key={city} style={styles.suggItem} onPress={() => { setQuery(city); setShowSuggestions(false); }}>
              <Ionicons name="location-outline" size={14} color="#555" />
              <Text style={styles.suggText}>{city}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Filters */}
      <View style={styles.filtersRow}>
        {['all', 'apartment', 'house'].map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, typeFilter === t && styles.chipActive]}
            onPress={() => setTypeFilter(t)}
          >
            <Text style={[styles.chipText, typeFilter === t && styles.chipTextActive]}>
              {t === 'all' ? 'All' : t === 'apartment' ? 'Apartments' : 'Houses'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.priceRow} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {PRICE_FILTERS.map((pf, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.chip, priceFilter === i && styles.chipActive]}
            onPress={() => setPriceFilter(i)}
          >
            <Text style={[styles.chipText, priceFilter === i && styles.chipTextActive]}>{pf.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      <Text style={styles.resultCount}>{results.length} properties found</Text>
      <FlatList
        data={results}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="home-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No properties found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PropertyDetail', { property: item })}>
            <Image source={{ uri: item.image }} style={styles.cardImg} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.row}>
                <Ionicons name="location-outline" size={12} color="#888" />
                <Text style={styles.cardSub}> {item.neighborhood}, {item.city}</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.price}>{item.price} TND<Text style={styles.period}>/{item.period}</Text></Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.type}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8 },
  back: { marginRight: 10 },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  input: { flex: 1, fontSize: 14, color: '#333' },
  suggestions: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 10, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, zIndex: 100 },
  suggItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  suggText: { marginLeft: 8, fontSize: 14, color: '#333' },
  filtersRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 8 },
  priceRow: { marginTop: 6, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  chipActive: { backgroundColor: '#4461F2', borderColor: '#4461F2' },
  chipText: { fontSize: 12, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  resultCount: { paddingHorizontal: 16, fontSize: 12, color: '#888', marginBottom: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 14, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  cardImg: { width: '100%', height: 160 },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#222', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  cardSub: { fontSize: 12, color: '#888', textTransform: 'capitalize' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  price: { fontSize: 15, fontWeight: '700', color: '#4461F2' },
  period: { fontSize: 12, color: '#888', fontWeight: '400' },
  badge: { backgroundColor: '#EEF0FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, color: '#4461F2', fontWeight: '600', textTransform: 'capitalize' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 12, color: '#aaa', fontSize: 14 },
});
