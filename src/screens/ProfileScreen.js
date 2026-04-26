import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { useUser } from '../context/UserContext';
import { COLORS, FONTS, GRADIENTS, SHADOWS, SIZES } from '../constants/theme';
import { PROPERTIES } from '../constants/mockData';

// ─── Static config ────────────────────────────────────────────────────────────

const MENU = [
  { icon: 'heart-outline',         label: 'Saved Properties',  screen: 'SavedProperties', color: COLORS.rose },
  { icon: 'document-text-outline', label: 'My Listings',       screen: 'MyListings',      color: COLORS.primary },
  { icon: 'bar-chart-outline',    label: 'Market Insights',   screen: 'MarketInsights',  color: COLORS.teal },
  { icon: 'settings-outline',      label: 'Settings',          screen: 'Settings',        color: COLORS.textLight },
  { icon: 'help-circle-outline',   label: 'Help & Support',    screen: 'Help',            color: COLORS.gold },
  { icon: 'log-out-outline',       label: 'Log Out',           screen: null,              color: COLORS.error },
];

const BADGES = [
  { icon: 'checkmark-circle', label: 'Vérifié',    color: '#22C55E', bg: '#F0FDF4' },
  { icon: 'shield-checkmark', label: 'Confiance',  color: '#4F46E5', bg: '#EEF2FF' },
  { icon: 'flash',            label: 'Réactif',    color: '#F59E0B', bg: '#FFFBEB' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen({ navigation }) {
  const { user }              = useUser();
  const { isDark, toggleTheme } = useTheme();
  const { getFavoriteIds }    = useFavorites();
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? '');
  const [editCity, setEditCity] = useState(user?.city ?? '');

  const savedCount    = getFavoriteIds().length;
  const listingsCount = PROPERTIES.filter((p) => p.featured).length;

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
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Gradient header ── */}
        <LinearGradient colors={GRADIENTS.primary} style={styles.gradHeader} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mon Profil</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => setShowEdit(true)}>
            <Ionicons name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Profile card ── */}
        <View style={styles.profileCard}>
          {user?.photo ? (
            <Image source={{ uri: user.photo }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {(user?.name ?? 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.name}>{user?.name ?? 'Utilisateur'}</Text>
          <Text style={styles.email}>{user?.email ?? 'email@dari.tn'}</Text>
          <View style={styles.locChip}>
            <Ionicons name="location-outline" size={13} color={COLORS.primary} />
            <Text style={styles.locText}>{user?.city ?? 'Tunis'}, Tunisia</Text>
          </View>
        </View>

        {/* ── Badges ── */}
        <View style={styles.badgesRow}>
          {BADGES.map((b) => (
            <View key={b.label} style={[styles.badge, { backgroundColor: b.bg }]}>
              <Ionicons name={b.icon} size={16} color={b.color} />
              <Text style={[styles.badgeLabel, { color: b.color }]}>{b.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          {[
            { label: 'Saved',   value: savedCount },
            { label: 'Listings', value: listingsCount },
            { label: 'Reviews',  value: 8 },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Dark mode toggle ── */}
        <View style={styles.darkModeRow}>
          <View style={styles.darkModeLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#1E1B4B' }]}>
              <Ionicons name={isDark ? 'moon' : 'sunny-outline'} size={18} color="#818CF8" />
            </View>
            <Text style={styles.menuLabel}>Mode sombre</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: COLORS.line, true: COLORS.primary }}
            thumbColor="#fff"
          />
        </View>

        {/* ── Menu items ── */}
        <View style={styles.menuList}>
          {MENU.map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={() => handlePress(item)}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={[styles.menuLabel, item.screen === null && { color: COLORS.error }]}>
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.line} />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* ── Edit profile modal ── */}
      <Modal visible={showEdit} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>Modifier le profil</Text>

            <Text style={styles.fieldLabel}>Nom complet</Text>
            <TextInput
              style={styles.fieldInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Votre nom"
              placeholderTextColor={COLORS.textLight}
            />
            <Text style={styles.fieldLabel}>Ville</Text>
            <TextInput
              style={styles.fieldInput}
              value={editCity}
              onChangeText={setEditCity}
              placeholder="Votre ville"
              placeholderTextColor={COLORS.textLight}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={() => setShowEdit(false)}>
              <LinearGradient colors={GRADIENTS.primary} style={styles.saveGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.saveText}>Enregistrer</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEdit(false)}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.background },
  scroll:  { paddingBottom: 40 },

  // Gradient header
  gradHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.medium,
    paddingTop: SIZES.large, paddingBottom: 60,
  },
  headerTitle: { ...FONTS.h3, color: '#fff' },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  editBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },

  // Profile card
  profileCard: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: SIZES.medium,
    borderRadius: SIZES.radius.xl,
    paddingTop: 40,
    paddingBottom: SIZES.large,
    paddingHorizontal: SIZES.large,
    marginTop: -40,
    ...SHADOWS.medium,
  },
  avatarCircle: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SIZES.medium,
    borderWidth: 4, borderColor: '#fff',
    ...SHADOWS.glow,
  },
  avatarInitials: { fontSize: 32, fontWeight: '700', color: '#fff' },
  avatarImg: {
    width: 84, height: 84, borderRadius: 42,
    marginBottom: SIZES.medium,
    borderWidth: 4, borderColor: '#fff',
  },
  name:  { ...FONTS.h2, color: COLORS.text },
  email: { ...FONTS.body2, color: COLORS.textLight, marginTop: 4 },
  locChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primaryOpacity,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: SIZES.radius.pill, marginTop: SIZES.small,
  },
  locText: { ...FONTS.caption, color: COLORS.primary, fontWeight: '600' },

  // Badges
  badgesRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 10,
    paddingHorizontal: SIZES.medium, marginTop: SIZES.medium,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: SIZES.radius.pill,
  },
  badgeLabel: { fontSize: 11, fontWeight: '700' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    marginHorizontal: SIZES.medium,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.medium, marginTop: SIZES.medium,
    ...SHADOWS.light,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { ...FONTS.h2, color: COLORS.primary },
  statLabel: { ...FONTS.caption, color: COLORS.textLight, marginTop: 2 },

  // Dark mode row
  darkModeRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    marginHorizontal: SIZES.medium,
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SIZES.medium, paddingVertical: 14,
    marginTop: SIZES.medium,
    ...SHADOWS.xs,
  },
  darkModeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  // Menu
  menuList: { marginHorizontal: SIZES.medium, marginTop: SIZES.medium, gap: SIZES.small },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg, padding: SIZES.medium,
    ...SHADOWS.xs,
  },
  menuIcon: {
    width: 38, height: 38, borderRadius: SIZES.radius.sm,
    justifyContent: 'center', alignItems: 'center',
  },
  menuLabel: { flex: 1, ...FONTS.body1, color: COLORS.text, fontWeight: '500' },

  // Edit modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: SIZES.large, paddingBottom: 40,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.line,
    alignSelf: 'center', marginBottom: SIZES.medium,
  },
  modalTitle: { ...FONTS.h2, color: COLORS.text, marginBottom: SIZES.large },
  fieldLabel: { ...FONTS.label, color: COLORS.textLight, marginBottom: 6, marginTop: SIZES.small },
  fieldInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: SIZES.radius.md, paddingHorizontal: 14, paddingVertical: 12,
    ...FONTS.body1, color: COLORS.text,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  saveBtn:  { borderRadius: SIZES.radius.lg, overflow: 'hidden', marginTop: SIZES.large, ...SHADOWS.glow },
  saveGrad: { paddingVertical: 16, alignItems: 'center' },
  saveText: { ...FONTS.h3, color: '#fff' },
  cancelBtn: { alignItems: 'center', marginTop: SIZES.medium },
  cancelText: { ...FONTS.body1, color: COLORS.textLight },
});
