import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MyListingsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>My Listings</Text>
        <View style={{ width: 22 }} />
      </View>
      <View style={styles.empty}>
        <Ionicons name="document-text-outline" size={56} color="#ccc" />
        <Text style={styles.emptyTitle}>No listings yet</Text>
        <Text style={styles.emptyText}>Properties you post will appear here.</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Post a Property</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 17, fontWeight: '700', color: '#222' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#333', marginTop: 16 },
  emptyText: { fontSize: 13, color: '#888', textAlign: 'center', marginTop: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4461F2', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12, marginTop: 24 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14, marginLeft: 6 },
});
