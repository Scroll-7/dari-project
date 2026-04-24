import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PROPERTIES } from '../constants/mockData';

export default function CommercialScreen({ navigation }) {
  const data = PROPERTIES.filter(p => p.type === 'commercial');
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Commercial</Text>
        <View style={{ width: 22 }} />
      </View>
      <FlatList
        data={data}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="business-outline" size={48} color="#ccc" /><Text style={styles.emptyText}>No commercial listings</Text></View>}
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
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 14, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  img: { width: '100%', height: 160 },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#222', marginBottom: 4 },
  sub: { fontSize: 12, color: '#888', textTransform: 'capitalize' },
  price: { fontSize: 15, fontWeight: '700', color: '#4461F2', marginTop: 8 },
  period: { fontSize: 12, color: '#888', fontWeight: '400' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { marginTop: 12, color: '#aaa', fontSize: 14 },
});
