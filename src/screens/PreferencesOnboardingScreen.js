// screens/PreferencesOnboardingScreen.js
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useRef } from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/auth';
import { FONTS, GRADIENTS, SHADOWS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

// ─── Data ─────────────────────────────────────────────────────────────────────

const BUDGET_OPTIONS = [
  { id: '0-300',    label: '< 300 DT',      icon: 'wallet-outline' },
  { id: '300-500',  label: '300 – 500 DT',  icon: 'wallet-outline' },
  { id: '500-800',  label: '500 – 800 DT',  icon: 'wallet-outline' },
  { id: '800-1200', label: '800 – 1200 DT', icon: 'wallet-outline' },
  { id: '1200+',    label: '1200+ DT',      icon: 'wallet-outline' },
];

const INTEREST_OPTIONS = [
  { id: 'Lecture',      label: 'Lecture',       emoji: '📚' },
  { id: 'Gaming',       label: 'Gaming',        emoji: '🎮' },
  { id: 'Yoga',         label: 'Yoga',          emoji: '🧘' },
  { id: 'Cuisine',      label: 'Cuisine',       emoji: '🍳' },
  { id: 'Musique',      label: 'Musique',       emoji: '🎵' },
  { id: 'Cinéma',       label: 'Cinéma',        emoji: '🎬' },
  { id: 'Voyages',      label: 'Voyages',       emoji: '✈️' },
  { id: 'Sport',        label: 'Sport',         emoji: '⚽' },
  { id: 'Art',          label: 'Art',           emoji: '🎨' },
  { id: 'Technologie',  label: 'Technologie',   emoji: '💻' },
  { id: 'Jardinage',    label: 'Jardinage',     emoji: '🌱' },
  { id: 'Photographie', label: 'Photographie',  emoji: '📷' },
  { id: 'Running',      label: 'Running',       emoji: '🏃' },
  { id: 'Natation',     label: 'Natation',      emoji: '🏊' },
  { id: 'Podcast',      label: 'Podcast',       emoji: '🎙️' },
  { id: 'Randonnée',    label: 'Randonnée',     emoji: '🥾' },
];

const LIFESTYLE_OPTIONS = [
  { id: 'Non-fumeur',    label: 'Non-fumeur',    emoji: '🚭' },
  { id: 'Fumeur',        label: 'Fumeur (ext.)', emoji: '🚬' },
  { id: 'Lève-tôt',     label: 'Lève-tôt',      emoji: '🌅' },
  { id: 'Noctambule',   label: 'Noctambule',     emoji: '🌙' },
  { id: 'Animaux OK',   label: 'Animaux OK',     emoji: '🐾' },
  { id: "Pas d'animaux", label: "Pas d'animaux", emoji: '🚫' },
  { id: 'Calme',        label: 'Calme',          emoji: '🤫' },
  { id: 'Sociable',     label: 'Sociable',       emoji: '🎉' },
];

const STEPS = [
  { key: 'budget',    title: 'Votre budget mensuel',       subtitle: 'Sélectionnez une tranche de loyer',       icon: 'wallet' },
  { key: 'interests', title: 'Vos centres d\'intérêt',     subtitle: 'Choisissez au moins 2 centres d\'intérêt', icon: 'heart' },
  { key: 'lifestyle', title: 'Votre style de vie',         subtitle: 'Choisissez au moins 1 habitude de vie',   icon: 'sunny' },
];

const CONFLICTS = {
  'Non-fumeur': 'Fumeur',
  'Fumeur': 'Non-fumeur',
  'Animaux OK': "Pas d'animaux",
  "Pas d'animaux": 'Animaux OK',
  'Lève-tôt': 'Noctambule',
  'Noctambule': 'Lève-tôt',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function totalSelected(budget, interests, lifestyle) {
  return (budget ? 1 : 0) + interests.length + lifestyle.length;
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ label, emoji, selected, disabled, onPress, colors }) {
  return (
    <TouchableOpacity
      style={[
        chipStyles.chip,
        { backgroundColor: selected ? colors.primary : colors.card,
          borderColor:      selected ? colors.primary : (disabled ? colors.line + '66' : colors.line),
          opacity: disabled ? 0.4 : 1,
        },
      ]}
      onPress={disabled ? null : onPress}
      activeOpacity={disabled ? 1 : 0.8}
    >
      {emoji ? <Text style={chipStyles.emoji}>{emoji}</Text> : null}
      <Text style={[chipStyles.label, { color: selected ? '#fff' : (disabled ? colors.textLight : colors.text) }]}>
        {label}
      </Text>
      {selected && (
        <Ionicons name="checkmark-circle" size={14} color="rgba(255,255,255,0.9)" style={{ marginLeft: 2 }} />
      )}
    </TouchableOpacity>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 50, borderWidth: 1.5,
    marginBottom: 8, marginRight: 8,
  },
  emoji: { fontSize: 14 },
  label: { fontSize: 13, fontWeight: '600' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PreferencesOnboardingScreen({ isEditing = false, initialPrefs = null, onDone }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [step, setStep]           = useState(0);
  const [budget, setBudget]       = useState(initialPrefs?.budgetRange || null);
  const [interests, setInterests] = useState(initialPrefs?.interests || []);
  const [lifestyle, setLifestyle] = useState(initialPrefs?.lifestyle || []);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  // Slide animation
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateForward = () => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -20, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0,   duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const toggleInterest = (id) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleLifestyle = (id) => {
    setLifestyle((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const canContinue = () => {
    if (step === 0) return !!budget;
    if (step === 1) return interests.length >= 1;
    if (step === 2) return lifestyle.length >= 1;
    return false;
  };

  const handleNext = () => {
    setError('');
    if (!canContinue()) {
      if (step === 0) setError('Veuillez sélectionner une tranche de budget.');
      if (step === 1) setError('Sélectionnez au moins 1 centre d\'intérêt.');
      if (step === 2) setError('Sélectionnez au moins 1 style de vie.');
      return;
    }
    if (step < STEPS.length - 1) {
      animateForward();
      setStep((s) => s + 1);
    } else {
      handleSave();
    }
  };

  const handleSave = async () => {
    // Minimum 3 total including budget
    const total = totalSelected(budget, interests, lifestyle);
    if (total < 3) {
      setError('Sélectionnez au moins 3 éléments au total (budget + intérêts + style de vie).');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const uid = getAuth().currentUser?.uid;
      if (!uid) throw new Error('Non connecté');

      const prefs = { budgetRange: budget, interests, lifestyle };

      await updateDoc(doc(db, 'users', uid), {
        preferences: prefs,
        hasPreferences: true,
      });

      // Update existing roommate posts to reflect the new preferences
      try {
        const postsQuery = query(collection(db, 'roommatePosts'), where('uid', '==', uid));
        const postsSnap = await getDocs(postsQuery);
        const updatePromises = postsSnap.docs.map(postDoc => 
          updateDoc(doc(db, 'roommatePosts', postDoc.id), {
            preferences: prefs,
            interests: prefs.interests || [],
            habits: prefs.lifestyle || [],
            budget: prefs.budgetRange || ''
          })
        );
        await Promise.all(updatePromises);
      } catch (err) {
        console.warn("Failed to update existing roommate posts", err);
      }

      if (onDone) onDone();
    } catch (e) {
      setError('Erreur lors de la sauvegarde. Réessayez.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const currentStep = STEPS[step];
  const progress    = (step + 1) / STEPS.length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* ── Gradient top ── */}
      <LinearGradient
        colors={GRADIENTS.primary}
        style={styles.topGrad}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        {isEditing && (
          <TouchableOpacity style={styles.closeBtn} onPress={onDone}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Step dots */}
        <View style={styles.dotsRow}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === step && styles.dotActive,
                i < step  && styles.dotDone,
              ]}
            />
          ))}
        </View>

        <View style={styles.topIcon}>
          <Ionicons name={currentStep.icon} size={32} color="rgba(255,255,255,0.9)" />
        </View>
        <Text style={styles.stepTitle}>{currentStep.title}</Text>
        <Text style={styles.stepSubtitle}>{currentStep.subtitle}</Text>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </LinearGradient>

      {/* ── Content ── */}
      <Animated.View style={[styles.content, { transform: [{ translateX: slideAnim }] }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Budget step */}
          {step === 0 && (
            <View style={styles.section}>
              {BUDGET_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.budgetCard,
                    budget === opt.id && styles.budgetCardActive,
                  ]}
                  onPress={() => setBudget(opt.id)}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.budgetIcon,
                    { backgroundColor: budget === opt.id ? colors.primary : colors.primaryOpacity }
                  ]}>
                    <Ionicons
                      name="cash-outline"
                      size={20}
                      color={budget === opt.id ? '#fff' : colors.primary}
                    />
                  </View>
                  <Text style={[
                    styles.budgetLabel,
                    { color: budget === opt.id ? colors.primary : colors.text }
                  ]}>
                    {opt.label}
                  </Text>
                  {budget === opt.id && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Interests step */}
          {step === 1 && (
            <View style={styles.section}>
              <Text style={styles.countHint}>
                {interests.length} sélectionné{interests.length !== 1 ? 's' : ''}
              </Text>
              <View style={styles.chipsWrap}>
                {INTEREST_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.id}
                    label={opt.label}
                    emoji={opt.emoji}
                    selected={interests.includes(opt.id)}
                    onPress={() => toggleInterest(opt.id)}
                    colors={colors}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Lifestyle step */}
          {step === 2 && (
            <View style={styles.section}>
              <Text style={styles.countHint}>
                {lifestyle.length} sélectionné{lifestyle.length !== 1 ? 's' : ''}
              </Text>
              <View style={styles.chipsWrap}>
                {LIFESTYLE_OPTIONS.map((opt) => {
                  const conflictingOpt = CONFLICTS[opt.id];
                  const isDisabled = conflictingOpt ? lifestyle.includes(conflictingOpt) : false;
                  return (
                    <Chip
                      key={opt.id}
                      label={opt.label}
                      emoji={opt.emoji}
                      selected={lifestyle.includes(opt.id)}
                      disabled={isDisabled}
                      onPress={() => toggleLifestyle(opt.id)}
                      colors={colors}
                    />
                  );
                })}
              </View>
            </View>
          )}

          {/* Error */}
          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          )}

          {/* Total counter on last step */}
          {step === 2 && (
            <View style={styles.totalBox}>
              <Text style={styles.totalText}>
                Total sélectionné :{' '}
                <Text style={{ color: colors.primary, fontWeight: '800' }}>
                  {totalSelected(budget, interests, lifestyle)}
                </Text>
                /3 minimum
              </Text>
            </View>
          )}

        </ScrollView>
      </Animated.View>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => { setError(''); setStep((s) => s - 1); }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Retour</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextBtn, { opacity: saving ? 0.7 : 1 }]}
          onPress={handleNext}
          disabled={saving}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={GRADIENTS.primary}
            style={styles.nextGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextText}>
              {saving ? 'Enregistrement…' : step === STEPS.length - 1 ? 'Terminer ✓' : 'Continuer'}
            </Text>
            {!saving && step < STEPS.length - 1 && (
              <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const getStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

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
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: SIZES.medium },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: { width: 24, backgroundColor: '#fff' },
  dotDone:   { backgroundColor: 'rgba(255,255,255,0.7)' },

  topIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  stepTitle:    { ...FONTS.h2, color: '#fff', textAlign: 'center', marginBottom: 6 },
  stepSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: SIZES.medium },
  progressBar:  { width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: '#fff', borderRadius: 2 },

  content: { flex: 1 },
  scroll:  { padding: SIZES.large, paddingBottom: 20 },
  section: { gap: 0 },

  // Budget
  budgetCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.medium,
    marginBottom: 10,
    borderWidth: 1.5, borderColor: 'transparent',
    ...SHADOWS.xs,
  },
  budgetCardActive: { borderColor: colors.primary, backgroundColor: colors.primaryOpacity },
  budgetIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  budgetLabel: { flex: 1, ...FONTS.body1, fontWeight: '600' },

  // Chips
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  countHint: { ...FONTS.caption, color: colors.textLight, marginBottom: SIZES.small },

  // Error
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.errorOpacity || '#FEE2E2',
    borderRadius: SIZES.radius.md, padding: 12, marginTop: 10,
  },
  errorText: { flex: 1, fontSize: 12, fontWeight: '500' },

  // Total counter
  totalBox: {
    backgroundColor: colors.primaryOpacity,
    borderRadius: SIZES.radius.md,
    padding: 12, marginTop: 10, alignItems: 'center',
  },
  totalText: { ...FONTS.caption, color: colors.textLight },

  // Footer
  footer: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.large, paddingVertical: SIZES.medium,
    paddingBottom: 28, gap: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1, borderTopColor: colors.line,
  },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: SIZES.radius.lg,
    backgroundColor: colors.primaryOpacity,
  },
  backText: { fontWeight: '600', fontSize: 14 },
  nextBtn: { flex: 1, borderRadius: SIZES.radius.lg, overflow: 'hidden', ...SHADOWS.medium },
  nextGrad: { height: 52, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  nextText: { ...FONTS.h3, color: '#fff', fontWeight: '700' },
});
