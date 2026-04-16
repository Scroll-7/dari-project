import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MENU = [
  { icon: 'heart-outline', label: 'Saved Properties' },
  { icon: 'document-text-outline', label: 'My Listings' },
  { icon: 'settings-outline', label: 'Settings' },
  { icon: 'help-circle-outline', label: 'Help & Support' },
  { icon: 'log-out-outline', label: 'Log Out' },
];

export default function ProfileScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Text style={styles.name}>Ahmed Ben Salah</Text>
        <Text style={styles.email}>ahmed.bensalah@gmail.com</Text>
        <Text style={styles.location}>📍 Tunis, Tunisia</Text>
      </View>

      <View style={styles.menuList}>
        {MENU.map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={18} color="#4461F2" />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 17, fontWeight: '700', color: '#222' },
  profileCard: { alignItems: 'center', backgroundColor: '#fff', margin: 16, borderRadius: 20, padding: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4461F2', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name: { fontSize: 18, fontWeight: '700', color: '#222' },
  email: { fontSize: 13, color: '#888', marginTop: 4 },
  location: { fontSize: 13, color: '#888', marginTop: 4 },
  menuList: { marginHorizontal: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 14, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EEF0FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 14, color: '#333', fontWeight: '500' },
});
