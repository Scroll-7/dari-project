import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';

const SERVICES = [
  { id: '1', title: 'Plumbing',     icon: 'water-outline',         count: 24 },
  { id: '2', title: 'Electrician',  icon: 'flash-outline',         count: 18 },
  { id: '3', title: 'Cleaning',     icon: 'sparkles-outline',      count: 45 },
  { id: '4', title: 'Moving',       icon: 'cube-outline',          count: 12 },
  { id: '5', title: 'Painting',     icon: 'color-palette-outline', count: 9  },
  { id: '6', title: 'Carpentry',    icon: 'hammer-outline',        count: 7  },
];

export default function ServicesScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Services</Text>
          <Text style={styles.subtitle}>Trouvez des professionnels de confiance</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {SERVICES.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('ServiceProviders', {
                  service: { title: service.title, icon: service.icon },
                })
              }
            >
              {/* Icon circle */}
              <View style={styles.iconWrap}>
                <Ionicons name={service.icon} size={26} color={COLORS.primary} />
              </View>

              <Text style={styles.cardTitle}>{service.title}</Text>
              <Text style={styles.cardCount}>{service.count} disponibles</Text>

              {/* Arrow */}
              <View style={styles.arrowWrap}>
                <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SIZES.medium, paddingBottom: 100 },

  header: {
    paddingHorizontal: SIZES.medium,
    paddingTop: SIZES.large,
    paddingBottom: SIZES.small,
  },
  title:    { ...FONTS.h1, color: COLORS.text },
  subtitle: { ...FONTS.body2, color: COLORS.textLight, marginTop: 4 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SIZES.medium,
  },

  card: {
    width: '47%',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.xl,
    padding: SIZES.medium,
    ...SHADOWS.light,
  },

  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.primaryOpacity,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },

  cardTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: 4,
  },
  cardCount: {
    ...FONTS.caption,
    color: COLORS.textLight,
    marginBottom: SIZES.small,
  },

  arrowWrap: {
    alignSelf: 'flex-start',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryOpacity,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
