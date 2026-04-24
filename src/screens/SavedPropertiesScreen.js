import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PROPERTIES } from '../constants/mockData';

// Mock: first 3 are "saved"
const INITIAL_SAVED = ['1', '2', '7'];

export default function SavedPropertiesScreen({ navigation }) {
  const [savedIds, setSavedIds] = useState(INITIAL_SAVED);
  const data = PROPERTIES.filter(p => savedIds.includes(p.id));

  const remove = (id) => setSavedIds(prev => prev.filter(i => i !== id));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Saved Properties</Text>
        <View style={{ width: 22 }} />
      </View>
      <FlatList
        data={data}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="heart-outline" size={48} color="#ccc" /><Text style={styles.emptyText}>No saved properties yet</Text></View>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PropertyDetail', { property: item })}>
            <Image source={{ uri: item.image }} style={styles.img} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location-outline" size={12} color="#888" />
                <Text style={styles.sub}> {item.neighborhood}, {item.city}</Text>
              </View>
              <Text style={styles.price}>{item.price} TND<Text style={styles.period}>/{item.period}</Text></Text>
            </View>
            <TouchableOpacity style={styles.removeBtn} onPress={() => remove(item.id)}>
              <Ionicons name="heart" size={20} color="#4461F2" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 17, fontWeight: '700', color: '#222' },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 14, flexDirection: 'row', overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, alignItems: 'center' },
  img: { width: 90, height: 90 },
  cardBody: { flex: 1, padding: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#222', marginBottom: 4 },
  sub: { fontSize: 11, color: '#888', textTransform: 'capitalize' },
  price: { fontSize: 14, fontWeight: '700', color: '#4461F2', marginTop: 6 },
  period: { fontSize: 11, color: '#888', fontWeight: '400' },
  removeBtn: { padding: 14 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { marginTop: 12, color: '#aaa', fontSize: 14 },
});
