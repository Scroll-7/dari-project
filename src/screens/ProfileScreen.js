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
import { FONTS, GRADIENTS, SHADOWS, SIZES } from '../constants/theme';
import { PROPERTIES } from '../constants/mockData';

// ─── Static config ────────────────────────────────────────────────────────────

const getMenu = (colors) => [
  { icon: 'heart-outline',         label: 'Saved Properties',  screen: 'SavedProperties', color: colors.rose },
  { icon: 'document-text-outline', label: 'My Listings',       screen: 'MyListings',      color: colors.primary },
  { icon: 'bar-chart-outline',    label: 'Market Insights',   screen: 'MarketInsights',  color: colors.teal },
  { icon: 'settings-outline',      label: 'Settings',          screen: 'Settings',        color: colors.textLight },
  { icon: 'help-circle-outline',   label: 'Help & Support',    screen: 'Help',            color: colors.gold },
  { icon: 'log-out-outline',       label: 'Log Out',           screen: null,              color: colors.error },
];

const BADGES = [
  { icon: 'checkmark-circle', label: 'Vérifié',    color: '#22C55E', bg: '#F0FDF4' },
  { icon: 'shield-checkmark', label: 'Confiance',  color: '#4F46E5', bg: '#EEF2FF' },
  { icon: 'flash',            label: 'Réactif',    color: '#F59E0B', bg: '#FFFBEB' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen({ navigation }) {
  const { isDark, toggleTheme, colors } = useTheme();
  const { user }              = useUser();
  const { getFavoriteIds }    = useFavorites();
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? '');
  const [editCity, setEditCity] = useState(user?.city ?? '');

  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const menuList = React.useMemo(() => getMenu(colors), [colors]);

  const savedCount    = getFavoriteIds().length;
  const listingsCount = PROPERTIES.filter((p) => p.featured).length;

  const handlePress = async (item) => {
    if (!item.screen) {
      Alert.alert('Log Out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive', 
          onPress: async () => {
            const { logoutUser } = await import('../firebase/auth');
            await logoutUser();
          } 
        },
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
        <LinearGradient colors={colors.gradientPrimary || GRADIENTS.primary} style={styles.gradHeader} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mon Profil</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => setShowEdit(true)}>
            <Ionicons name="create-outline" size={20} color={colors.white} />
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
          {!!user?.username && (
            <Text style={styles.username}>@{user.username}</Text>
          )}
          <Text style={styles.email}>{user?.email ?? 'email@dari.tn'}</Text>
          <View style={styles.locChip}>
            <Ionicons name="location-outline" size={13} color={colors.primary} />
            <Text style={styles.locText}>{user?.city || 'Tunis'}, Tunisia</Text>
          </View>
        </View>

        {/* ── Badges ── */}
        <View style={styles.badgesRow}>
          {BADGES.map((b) => (
            <View key={b.label} style={[styles.badge, { backgroundColor: isDark ? '#1E1B4B' : b.bg }]}>
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
            <View style={[styles.menuIcon, { backgroundColor: isDark ? colors.primaryOpacity : '#EEF2FF' }]}>
              <Ionicons name={isDark ? 'moon' : 'sunny-outline'} size={18} color={colors.primary} />
            </View>
            <Text style={styles.menuLabel}>Mode sombre</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.line, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        {/* ── Menu items ── */}
        <View style={styles.menuList}>
          {menuList.map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={() => handlePress(item)}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={[styles.menuLabel, item.screen === null && { color: colors.error }]}>
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.line} />
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
              placeholderTextColor={colors.textLight}
            />
            <Text style={styles.fieldLabel}>Ville</Text>
            <TextInput
              style={styles.fieldInput}
              value={editCity}
              onChangeText={setEditCity}
              placeholder="Votre ville"
              placeholderTextColor={colors.textLight}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={() => setShowEdit(false)}>
              <LinearGradient colors={colors.gradientPrimary || GRADIENTS.primary} style={styles.saveGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
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

const getStyles = (colors) => StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.background },
  scroll:  { paddingBottom: 40 },

  // Gradient header
  gradHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.medium,
    paddingTop: SIZES.large, paddingBottom: 60,
  },
  headerTitle: { ...FONTS.h3, color: colors.white },
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
    backgroundColor: colors.card,
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
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SIZES.medium,
    borderWidth: 4, borderColor: colors.card,
    ...SHADOWS.glow,
  },
  avatarInitials: { fontSize: 32, fontWeight: '700', color: colors.white },
  avatarImg: {
    width: 84, height: 84, borderRadius: 42,
    marginBottom: SIZES.medium,
    borderWidth: 4, borderColor: colors.card,
  },
  name:  { ...FONTS.h2, color: colors.text },
  username: { ...FONTS.body2, color: colors.primary, fontWeight: '600', marginTop: 2 },
  email: { ...FONTS.body2, color: colors.textLight, marginTop: 4 },
  locChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primaryOpacity,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: SIZES.radius.pill, marginTop: SIZES.small,
  },
  locText: { ...FONTS.caption, color: colors.primary, fontWeight: '600' },

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
    backgroundColor: colors.card,
    marginHorizontal: SIZES.medium,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.medium, marginTop: SIZES.medium,
    ...SHADOWS.light,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { ...FONTS.h2, color: colors.primary },
  statLabel: { ...FONTS.caption, color: colors.textLight, marginTop: 2 },

  // Dark mode row
  darkModeRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    marginHorizontal: SIZES.medium,
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SIZES.medium, paddingVertical: 14,
    marginTop: SIZES.medium,
    ...SHADOWS.xs,
  },
  darkModeLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },

  // Menu
  menuList: { marginHorizontal: SIZES.medium, marginTop: SIZES.medium, gap: SIZES.small },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.card,
    borderRadius: SIZES.radius.lg, padding: SIZES.medium,
    ...SHADOWS.xs,
  },
  menuIcon: {
    width: 38, height: 38, borderRadius: SIZES.radius.sm,
    justifyContent: 'center', alignItems: 'center',
  },
  menuLabel: { flex: 1, ...FONTS.body1, color: colors.text, fontWeight: '500' },

  // Edit modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: SIZES.large, paddingBottom: 40,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.line,
    alignSelf: 'center', marginBottom: SIZES.medium,
  },
  modalTitle: { ...FONTS.h2, color: colors.text, marginBottom: SIZES.large },
  fieldLabel: { ...FONTS.label, color: colors.textLight, marginBottom: 6, marginTop: SIZES.small },
  fieldInput: {
    backgroundColor: colors.inputBg,
    borderRadius: SIZES.radius.md, paddingHorizontal: 14, paddingVertical: 12,
    ...FONTS.body1, color: colors.text,
    borderWidth: 1.5, borderColor: colors.border,
  },
  saveBtn:  { borderRadius: SIZES.radius.lg, overflow: 'hidden', marginTop: SIZES.large, ...SHADOWS.glow },
  saveGrad: { paddingVertical: 16, alignItems: 'center' },
  saveText: { ...FONTS.h3, color: colors.white },
  cancelBtn: { alignItems: 'center', marginTop: SIZES.medium },
  cancelText: { ...FONTS.body1, color: colors.textLight },
});
