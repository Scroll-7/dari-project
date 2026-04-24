// screens/ProfileScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';

const MENU = [
  { icon: 'heart-outline',         label: 'Saved Properties', screen: 'SavedProperties' },
  { icon: 'document-text-outline', label: 'My Listings',      screen: 'MyListings'      },
  { icon: 'settings-outline',      label: 'Settings',         screen: 'Settings'        },
  { icon: 'help-circle-outline',   label: 'Help & Support',   screen: 'Help'            },
  { icon: 'log-out-outline',       label: 'Log Out',          screen: null              },
];

export default function ProfileScreen({ navigation }) {
  const { user } = useUser();

  const handlePress = (item) => {
    if (!item.screen) {
      Alert.alert('Log Out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => {} },
      ]);
      return;
    }
    navigation.navigate(item.screen);
  };

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
        {user.photo ? (
          <Image source={{ uri: user.photo }} style={styles.avatarImg} />
        ) : (
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
        )}
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.location}>📍 {user.city}, Tunisia</Text>
      </View>

      <View style={styles.menuList}>
        {MENU.map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuItem} onPress={() => handlePress(item)}>
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={18} color={item.screen === null ? '#e53935' : '#4461F2'} />
            </View>
            <Text style={[styles.menuLabel, item.screen === null && { color: '#e53935' }]}>
              {item.label}
            </Text>
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
  avatarImg: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  name: { fontSize: 18, fontWeight: '700', color: '#222' },
  email: { fontSize: 13, color: '#888', marginTop: 4 },
  location: { fontSize: 13, color: '#888', marginTop: 4 },
  menuList: { marginHorizontal: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 14, marginBottom: 10, elevation: 1 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EEF0FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 14, color: '#333', fontWeight: '500' },
});
