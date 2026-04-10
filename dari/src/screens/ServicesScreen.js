import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';

const SERVICES = [
  { id: '1', title: 'Plumbing', icon: 'water-outline', count: '24' },
  { id: '2', title: 'Electrician', icon: 'flash-outline', count: '18' },
  { id: '3', title: 'Cleaning', icon: 'sparkles-outline', count: '45' },
  { id: '4', title: 'Moving', icon: 'cube-outline', count: '12' },
  { id: '5', title: 'Painting', icon: 'color-palette-outline', count: '9' },
  { id: '6', title: 'Carpentry', icon: 'hammer-outline', count: '7' },
];

export default function ServicesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Home Services</Text>
        <Text style={styles.subtitle}>Find trusted professionals nearby</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {SERVICES.map((service, index) => (
            <TouchableOpacity key={service.id} style={styles.card}>
              <View style={styles.iconContainer}>
                <Ionicons name={service.icon} size={32} color={COLORS.accent} />
              </View>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceCount}>{service.count} providers</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SIZES.large, paddingTop: SIZES.xl, paddingBottom: SIZES.medium },
  title: { ...FONTS.h1, color: COLORS.text },
  subtitle: { ...FONTS.body1, color: COLORS.textLight, marginTop: 8 },
  scrollContent: { padding: SIZES.medium, paddingBottom: 100 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: COLORS.white, borderRadius: 20, padding: SIZES.large, marginBottom: SIZES.medium, alignItems: 'center', ...SHADOWS.light },
  iconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.accent + '15', justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.medium },
  serviceTitle: { ...FONTS.h3, color: COLORS.text, marginBottom: 4 },
  serviceCount: { ...FONTS.caption, color: COLORS.textLight },
});
