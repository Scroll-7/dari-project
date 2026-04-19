import { View, Text, FlatList, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { workers } from '../dari/workersData';

export default function WorkersScreen() {
  const { service } = useLocalSearchParams();
  const router = useRouter();
  const list = workers[service] || [];

  const callWorker = (phone) => {
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  };

  const renderStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '');
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{service}</Text>
      <Text style={styles.subtitle}>{list.length} professionals available</Text>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.workerName}>{item.name}</Text>
                <Text style={styles.workerExp}>{item.experience} experience</Text>
                <Text style={styles.stars}>{renderStars(item.rating)} {item.rating} ({item.reviews} reviews)</Text>
              </View>
              <View style={styles.priceBadge}>
                <Text style={styles.priceText}>{item.pricePerHour} DT/hr</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.actions}>
              <TouchableOpacity style={styles.callBtn} onPress={() => callWorker(item.phone)}>
                <Text style={styles.callBtnText}>📞 {item.phone}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 16 },
  backBtn: { marginBottom: 12, marginTop: 8 },
  backText: { color: '#e0457b', fontSize: 15 },
  title: { fontSize: 26, fontWeight: '600', color: '#1a1a2e' },
  subtitle: { fontSize: 13, color: '#888', marginTop: 2, marginBottom: 16 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 14, marginBottom: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#fce8f0', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#e0457b', fontWeight: '600', fontSize: 15 },
  info: { flex: 1 },
  workerName: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  workerExp: { fontSize: 12, color: '#888', marginTop: 1 },
  stars: { fontSize: 12, color: '#f59e0b', marginTop: 2 },
  priceBadge: { backgroundColor: '#fce8f0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  priceText: { color: '#c0325f', fontWeight: '600', fontSize: 13 },
  divider: { height: 0.5, backgroundColor: '#eee', marginVertical: 10 },
  actions: { flexDirection: 'row', gap: 8 },
  callBtn: { flex: 1, backgroundColor: '#fce8f0', padding: 9, borderRadius: 10, alignItems: 'center' },
  callBtnText: { color: '#c0325f', fontWeight: '500', fontSize: 12 },
  msgBtn: { flex: 1, backgroundColor: '#eef3ff', padding: 9, borderRadius: 10, alignItems: 'center' },
  msgBtnText: { color: '#3b60d0', fontWeight: '500', fontSize: 12 },
});