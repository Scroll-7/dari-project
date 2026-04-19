import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';

const WORKERS = {
  Plumbing: [
    { id: '1', name: 'Karim Mansouri', experience: '8 years', pricePerHour: 25, rating: 4.8, reviews: 124, phone: '+21655123456' },
    { id: '2', name: 'Youssef Trabelsi', experience: '5 years', pricePerHour: 20, rating: 4.5, reviews: 87, phone: '+21652789012' },
    { id: '3', name: 'Mohamed Ben Ali', experience: '12 years', pricePerHour: 30, rating: 4.9, reviews: 210, phone: '+21697345678' },
  ],
  Electrician: [
    { id: '4', name: 'Slim Chaabane', experience: '10 years', pricePerHour: 30, rating: 4.7, reviews: 95, phone: '+21654111222' },
    { id: '5', name: 'Amine Jerbi', experience: '4 years', pricePerHour: 22, rating: 4.3, reviews: 52, phone: '+21658333444' },
  ],
  Cleaning: [
    { id: '7', name: 'Fatma Bouzid', experience: '6 years', pricePerHour: 15, rating: 4.9, reviews: 302, phone: '+21650777888' },
    { id: '8', name: 'Rim Khelil', experience: '3 years', pricePerHour: 12, rating: 4.4, reviews: 67, phone: '+21656999000' },
    { id: '9', name: 'Amira Louati', experience: '9 years', pricePerHour: 18, rating: 4.8, reviews: 188, phone: '+21692112233' },
  ],
  Moving: [
    { id: '10', name: 'Hedi Sfar', experience: '5 years', pricePerHour: 35, rating: 4.6, reviews: 74, phone: '+21653445566' },
    { id: '11', name: 'Riadh Belhaj', experience: '8 years', pricePerHour: 40, rating: 4.7, reviews: 98, phone: '+21657778899' },
  ],
  Painting: [
    { id: '12', name: 'Tarek Maatoug', experience: '11 years', pricePerHour: 28, rating: 4.8, reviews: 143, phone: '+21694223344' },
    { id: '13', name: 'Wissem Gharbi', experience: '4 years', pricePerHour: 20, rating: 4.2, reviews: 41, phone: '+21651556677' },
  ],
  Carpentry: [
    { id: '14', name: 'Lotfi Jlassi', experience: '15 years', pricePerHour: 35, rating: 5.0, reviews: 76, phone: '+21698889900' },
    { id: '15', name: 'Bilel Nasri', experience: '7 years', pricePerHour: 28, rating: 4.5, reviews: 60, phone: '+21655001122' },
  ],
};

const getInitials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2);
const getStars = (r) => '★'.repeat(Math.floor(r)) + (r % 1 >= 0.5 ? '½' : '');

export default function WorkersScreen({ route, navigation }) {
  const { service } = route.params;
  const list = WORKERS[service] || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.accent} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{service}</Text>
        <Text style={styles.subtitle}>{list.length} professionals available</Text>
      </View>

      <FlatList
        data={list}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: SIZES.medium, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.workerCard}>
            <View style={styles.workerTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
              </View>
              <View style={styles.workerInfo}>
                <Text style={styles.workerName}>{item.name}</Text>
                <Text style={styles.workerExp}>{item.experience} experience</Text>
                <Text style={styles.stars}>{getStars(item.rating)} {item.rating} ({item.reviews} reviews)</Text>
              </View>
              <View style={styles.priceBadge}>
                <Text style={styles.priceText}>{item.pricePerHour} DT/hr</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.actions}>
              <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${item.phone}`)}>
                <Ionicons name="call-outline" size={16} color={COLORS.accent} />
                <Text style={styles.callBtnText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.msgBtn}>
                <Ionicons name="chatbubble-outline" size={16} color="#3b60d0" />
                <Text style={styles.msgBtnText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SIZES.large, paddingTop: SIZES.xl, paddingBottom: SIZES.medium },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  backText: { color: COLORS.accent, fontSize: 15 },
  title: { ...FONTS.h1, color: COLORS.text },
  subtitle: { ...FONTS.body1, color: COLORS.textLight, marginTop: 8 },
  workerCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 14, marginBottom: 12, ...SHADOWS.light },
  workerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.accent + '20', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: COLORS.accent, fontWeight: '600', fontSize: 15 },
  workerInfo: { flex: 1 },
  workerName: { ...FONTS.h3, color: COLORS.text },
  workerExp: { ...FONTS.caption, color: COLORS.textLight, marginTop: 1 },
  stars: { fontSize: 12, color: '#f59e0b', marginTop: 2 },
  priceBadge: { backgroundColor: COLORS.accent + '15', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  priceText: { color: COLORS.accent, fontWeight: '600', fontSize: 13 },
  divider: { height: 0.5, backgroundColor: '#eee', marginVertical: 10 },
  actions: { flexDirection: 'row', gap: 8 },
  callBtn: { flex: 1, backgroundColor: COLORS.accent + '15', padding: 9, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  callBtnText: { color: COLORS.accent, fontWeight: '500', fontSize: 13 },
  msgBtn: { flex: 1, backgroundColor: '#eef3ff', padding: 9, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  msgBtnText: { color: '#3b60d0', fontWeight: '500', fontSize: 13 },
});