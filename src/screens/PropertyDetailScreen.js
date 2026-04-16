import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PropertyDetailScreen({ route, navigation }) {
  const { property } = route.params;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView>
        <View style={styles.imgWrap}>
          <Image source={{ uri: property.image }} style={styles.image} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <View style={styles.row}>
            <Text style={styles.title}>{property.title}</Text>
            <Text style={styles.price}>{property.price} TND<Text style={styles.period}>/{property.period}</Text></Text>
          </View>
          <View style={styles.locRow}>
            <Ionicons name="location-outline" size={14} color="#888" />
            <Text style={styles.location}> {property.neighborhood}, {property.city}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="bed-outline" size={20} color="#4461F2" />
              <Text style={styles.statVal}>{property.bedrooms}</Text>
              <Text style={styles.statLabel}>Beds</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="water-outline" size={20} color="#4461F2" />
              <Text style={styles.statVal}>{property.bathrooms}</Text>
              <Text style={styles.statLabel}>Baths</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="resize-outline" size={20} color="#4461F2" />
              <Text style={styles.statVal}>{property.area}m²</Text>
              <Text style={styles.statLabel}>Area</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.desc}>{property.description}</Text>

          <TouchableOpacity style={styles.contactBtn}>
            <Ionicons name="call-outline" size={18} color="#fff" />
            <Text style={styles.contactText}>Contact Owner</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  imgWrap: { position: 'relative' },
  image: { width: '100%', height: 280 },
  backBtn: { position: 'absolute', top: 44, left: 16, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 8 },
  body: { padding: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 20, fontWeight: '700', color: '#222', flex: 1, marginRight: 10 },
  price: { fontSize: 18, fontWeight: '700', color: '#4461F2' },
  period: { fontSize: 12, color: '#888', fontWeight: '400' },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  location: { fontSize: 13, color: '#888', textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6 },
  stat: { alignItems: 'center' },
  statVal: { fontSize: 15, fontWeight: '700', color: '#222', marginTop: 4 },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#222', marginTop: 20, marginBottom: 8 },
  desc: { fontSize: 14, color: '#555', lineHeight: 22 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4461F2', borderRadius: 14, padding: 16, marginTop: 30 },
  contactText: { color: '#fff', fontSize: 15, fontWeight: '700', marginLeft: 8 },
});
