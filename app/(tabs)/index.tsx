import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView, Linking } from 'react-native';
import { useState } from 'react';

const services = [
  { id: '1', name: 'Plumbing', count: 24, emoji: '🔧' },
  { id: '2', name: 'Electrician', count: 18, emoji: '⚡' },
  { id: '3', name: 'Cleaning', count: 45, emoji: '✨' },
  { id: '4', name: 'Moving', count: 12, emoji: '📦' },
  { id: '5', name: 'Painting', count: 9, emoji: '🎨' },
  { id: '6', name: 'Carpentry', count: 7, emoji: '🔨' },
];

const workers: Record<string, { id: string; name: string; experience: string; pricePerHour: number; rating: number; reviews: number; phone: string }[]> = {
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

export default function HomeScreen() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  if (selectedService) {
    const list = workers[selectedService] || [];
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setSelectedService(null)} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>{selectedService}</Text>
        <Text style={styles.pageSubtitle}>{list.length} professionals available</Text>
        <FlatList
          data={list}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 30 }}
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
                  <Text style={styles.callBtnText}>📞 Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.msgBtn}>
                  <Text style={styles.msgBtnText}>💬 Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    );
  }

  const rows = [];
  for (let i = 0; i < services.length; i += 2) {
    rows.push(services.slice(i, i + 2));
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.pageTitle}>Home Services</Text>
      <Text style={styles.pageSubtitle}>Find trusted professionals nearby</Text>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.serviceCard}
              activeOpacity={0.7}
              onPress={() => {
                console.log('Pressed:', item.name);
                setSelectedService(item.name);
              }}
            >
              <View style={styles.serviceIcon}>
                <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
              </View>
              <Text style={styles.serviceName}>{item.name}</Text>
              <Text style={styles.serviceCount}>{item.count} providers</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f0f2f5' },
  scrollContent: { padding: 16, paddingTop: 60, paddingBottom: 30 },
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 16, paddingTop: 60 },
  backBtn: { marginBottom: 12 },
  backText: { color: '#e0457b', fontSize: 15 },
  pageTitle: { fontSize: 26, fontWeight: '600', color: '#1a1a2e', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: '#888', marginBottom: 20 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  serviceCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 20, alignItems: 'center', gap: 10 },
  serviceIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fce8f0', alignItems: 'center', justifyContent: 'center' },
  serviceName: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  serviceCount: { fontSize: 12, color: '#888' },
  workerCard: { backgroundColor: 'white', borderRadius: 16, padding: 14, marginBottom: 12 },
  workerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#fce8f0', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#e0457b', fontWeight: '600', fontSize: 15 },
  workerInfo: { flex: 1 },
  workerName: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  workerExp: { fontSize: 12, color: '#888', marginTop: 1 },
  stars: { fontSize: 12, color: '#f59e0b', marginTop: 2 },
  priceBadge: { backgroundColor: '#fce8f0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  priceText: { color: '#c0325f', fontWeight: '600', fontSize: 13 },
  divider: { height: 0.5, backgroundColor: '#eee', marginVertical: 10 },
  actions: { flexDirection: 'row', gap: 8 },
  callBtn: { flex: 1, backgroundColor: '#fce8f0', padding: 9, borderRadius: 10, alignItems: 'center' },
  callBtnText: { color: '#c0325f', fontWeight: '500', fontSize: 13 },
  msgBtn: { flex: 1, backgroundColor: '#eef3ff', padding: 9, borderRadius: 10, alignItems: 'center' },
  msgBtnText: { color: '#3b60d0', fontWeight: '500', fontSize: 13 },
});