import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';

const ROOMMATES = [
  { id: '1', name: 'Sarah Jenkins', role: 'Student', compatibility: '95%', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
  { id: '2', name: 'Michael Chen', role: 'Software Engineer', compatibility: '88%', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
  { id: '3', name: 'Elena Rodriguez', role: 'Designer', compatibility: '82%', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200' },
];

export default function RoommatesScreen() {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.role}>{item.role}</Text>
        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>{item.compatibility} Match</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.chatBtn}>
        <Ionicons name="chatbubble-ellipses-outline" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Roommates</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      <FlatList 
        data={ROOMMATES}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SIZES.large, paddingTop: SIZES.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...FONTS.h1, color: COLORS.text },
  filterBtn: { padding: 8, backgroundColor: COLORS.white, borderRadius: 12, ...SHADOWS.light },
  listContent: { padding: SIZES.medium, paddingBottom: 100 },
  card: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 20, padding: SIZES.small, marginBottom: SIZES.medium, alignItems: 'center', ...SHADOWS.medium },
  image: { width: 80, height: 80, borderRadius: 16 },
  info: { flex: 1, marginLeft: SIZES.medium },
  name: { ...FONTS.h3, color: COLORS.text, marginBottom: 4 },
  role: { ...FONTS.body2, color: COLORS.textLight, marginBottom: 8 },
  matchBadge: { backgroundColor: COLORS.success + '20', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  matchText: { ...FONTS.caption, color: COLORS.success, fontWeight: 'bold' },
  chatBtn: { padding: SIZES.medium, backgroundColor: COLORS.primaryOpacity, borderRadius: 16 },
});
