import { SafeAreaView } from 'react-native-safe-area-context';
// screens/ServiceCategoryScreen.js
// Shown only to users whose role === 'service', right after WelcomeUsernameScreen.
// Lets them pick which service category they belong to so they appear in the
// correct listing when other users browse ServiceProvidersScreen.

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Animated, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/auth';
import { GRADIENTS, SHADOWS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

// ─── Categories (must match the keys used in ServiceProvidersScreen) ──────────

export const SERVICE_CATEGORIES = [
  {
    id: 'Plumbing',
    label: 'Plomberie',
    icon: 'water-outline',
    gradient: ['#4F46E5', '#7C3AED'],
    description: 'Réparations, tuyauterie, sanitaires',
  },
  {
    id: 'Electrician',
    label: 'Électricité',
    icon: 'flash-outline',
    gradient: ['#F59E0B', '#EF4444'],
    description: 'Câblage, tableaux, domotique',
  },
  {
    id: 'Cleaning',
    label: 'Nettoyage',
    icon: 'sparkles-outline',
    gradient: ['#14B8A6', '#0EA5E9'],
    description: 'Appartements, bureaux, post-travaux',
  },
  {
    id: 'Moving',
    label: 'Déménagement',
    icon: 'cube-outline',
    gradient: ['#F72585', '#7209B7'],
    description: 'Transport, emballage, montage',
  },
  {
    id: 'Painting',
    label: 'Peinture',
    icon: 'color-palette-outline',
    gradient: ['#FB7185', '#F43F5E'],
    description: 'Intérieur, façades, déco',
  },
  {
    id: 'Carpentry',
    label: 'Menuiserie',
    icon: 'hammer-outline',
    gradient: ['#8B5CF6', '#6D28D9'],
    description: 'Portes, placards, parquet',
  },
];

// ─── Category card ─────────────────────────────────────────────────────────────

function CategoryCard({ item, selected, onPress }) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, tension: 300, friction: 10 }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }).start();

  return (
    <Animated.View style={[styles.cardWrap, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={[styles.card, selected && styles.cardSelected]}
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={item.gradient}
          style={[styles.cardGrad, selected && styles.cardGradSelected]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Check badge */}
          {selected && (
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
            </View>
          )}

          {/* Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name={item.icon} size={28} color="#fff" />
          </View>

          {/* Text */}
          <Text style={styles.cardLabel}>{item.label}</Text>
          <Text style={styles.cardDesc}>{item.description}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ServiceCategoryScreen({ isEditing = false, initialCategory = null, onDone }) {
  const { colors } = useTheme();

  const [selected, setSelected] = useState(initialCategory ?? null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const handleConfirm = async () => {
    if (!selected) {
      setError('Veuillez sélectionner votre catégorie de service.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const uid = getAuth().currentUser?.uid;
      if (!uid) throw new Error('Non connecté');

      // Save the chosen category. In edit mode just call onDone;
      // in onboarding mode setting hasPreferences triggers auto-navigation.
      await updateDoc(doc(db, 'users', uid), {
        serviceCategory: selected,
        hasPreferences: true,
      });
      if (isEditing && onDone) onDone();
    } catch (e) {
      setError('Erreur lors de la sauvegarde. Réessayez.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* ── Gradient header ── */}
      <LinearGradient
        colors={GRADIENTS.primary}
        style={styles.topGrad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Close button in edit mode */}
        {isEditing && onDone && (
          <TouchableOpacity style={styles.closeBtn} onPress={onDone}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        )}
        <View style={styles.topIcon}>
          <Ionicons name="construct" size={32} color="rgba(255,255,255,0.9)" />
        </View>
        <Text style={styles.title}>{isEditing ? 'Modifier votre domaine' : 'Votre domaine'}</Text>
        <Text style={styles.subtitle}>
          {isEditing
            ? 'Changez la catégorie de service qui vous représente'
            : 'Sélectionnez la catégorie qui correspond à votre activité'}
        </Text>
      </LinearGradient>

      {/* ── Category grid ── */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {SERVICE_CATEGORIES.map((item) => (
            <CategoryCard
              key={item.id}
              item={item}
              selected={selected === item.id}
              onPress={() => {
                setSelected(item.id);
                setError('');
              }}
            />
          ))}
        </View>

        {!!error && (
          <View style={[styles.errorBox, { backgroundColor: colors.errorOpacity || '#FEE2E2' }]}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.error || '#EF4444'} />
            <Text style={[styles.errorText, { color: colors.error || '#EF4444' }]}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* ── Footer button ── */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.line }]}>
        <TouchableOpacity
          style={[styles.btn, { opacity: saving ? 0.7 : 1 }]}
          onPress={handleConfirm}
          disabled={saving}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={GRADIENTS.primary}
            style={styles.btnGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.btnText}>
              {saving ? 'Enregistrement…' : isEditing ? 'Sauvegarder ✓' : 'Confirmer ✓'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },

  topGrad: {
    paddingTop: SIZES.large,
    paddingHorizontal: SIZES.large,
    paddingBottom: SIZES.xl,
    alignItems: 'center',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SIZES.small,
  },
  topIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  title: {
    fontSize: 26, fontWeight: '800', color: '#fff',
    textAlign: 'center', marginBottom: 6,
  },
  subtitle: {
    fontSize: 13, color: 'rgba(255,255,255,0.85)',
    textAlign: 'center', lineHeight: 19,
  },

  scroll: { padding: SIZES.medium, paddingBottom: 20 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.medium,
  },

  cardWrap: { width: '47%' },
  card: {
    borderRadius: SIZES.radius.xl,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'transparent',
    ...SHADOWS.medium,
  },
  cardSelected: {
    borderColor: '#fff',
  },
  cardGrad: {
    padding: SIZES.medium,
    minHeight: 155,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  cardGradSelected: {
    opacity: 1,
  },

  checkBadge: {
    position: 'absolute',
    top: 10, right: 10,
  },

  iconCircle: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SIZES.small,
  },
  cardLabel: {
    fontSize: 15, fontWeight: '800', color: '#fff',
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 10, color: 'rgba(255,255,255,0.8)',
    lineHeight: 13,
  },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: SIZES.radius.md,
    padding: 12, marginTop: 12,
  },
  errorText: { flex: 1, fontSize: 12, fontWeight: '500' },

  footer: {
    paddingHorizontal: SIZES.large,
    paddingVertical: SIZES.medium,
    paddingBottom: 28,
    borderTopWidth: 1,
  },
  btn: {
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  btnGrad: {
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 16, fontWeight: '700', color: '#fff',
  },
});
