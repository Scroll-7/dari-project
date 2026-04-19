import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, FlatList, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  accent: '#e0457b',
  background: '#f0f2f5',
  white: '#ffffff',
  text: '#1a1a2e',
  textLight: '#888888',
};

const SERVICES = [
  { id: '1', title: 'Plumbing', icon: 'water-outline' as const, count: '24' },
  { id: '2', title: 'Electrician', icon: 'flash-outline' as const, count: '18' },
  { id: '3', title: 'Cleaning', icon: 'sparkles-outline' as const, count: '45' },
  { id: '4', title: 'Moving', icon: 'cube-outline' as const, count: '12' },
  { id: '5', title: 'Painting', icon: 'color-palette-outline' as const, count: '9' },
  { id: '6', title: 'Carpentry', icon: 'hammer-outline' as const, count: '7' },
];

const WORKERS: Record<string, { id: string; name: string; experience: string; pricePerHour: number; rating: number; reviews: number; phone: string }[]> = {
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

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2);
const getStars = (r: number) => '★'.repeat(Math.floor(r)) + (r % 1 >= 0.5 ? '½' : '');

export default function ServicesScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const workers = selected ? (WORKERS[selected] || []) : [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Home Services</Text>
        <Text style={styles.subtitle}>Find trusted professionals nearby</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {SERVICES.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.card}
              activeOpacity={0.6}
              onPress={() => setSelected(service.title)}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={service.icon} size={32} color={COLORS.accent} />
              </View>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceCount}>{service.count} providers</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={selected !== null}
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={COLORS.accent} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{selected}</Text>
            <Text style={styles.subtitle}>{workers.length} professionals available</Text>
          </View>

          <FlatList
            data={workers}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
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
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => Linking.openURL(`tel:${item.phone}`)}
                  >
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
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 40, paddingBottom: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  backText: { color: COLORS.accent, fontSize: 15 },
  title: { fontSize: 26, fontWeight: '600', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textLight, marginTop: 8 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: COLORS.white, borderRadius: 20, padding: 20, marginBottom: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  iconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.accent + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  serviceTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  serviceCount: { fontSize: 12, color: COLORS.textLight },
  workerCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  workerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.accent + '20', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: COLORS.accent, fontWeight: '600', fontSize: 15 },
  workerInfo: { flex: 1 },
  workerName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  workerExp: { fontSize: 12, color: COLORS.textLight, marginTop: 1 },
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