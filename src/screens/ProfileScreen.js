import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { Alert, Image, Modal, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, collection, getCountFromServer, query, where, onSnapshot, getFirestore } from 'firebase/firestore';
import { db } from '../firebase/auth';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { useUser } from '../context/UserContext';
import { FONTS, GRADIENTS, SHADOWS, SIZES } from '../constants/theme';
import DEFAULT_AVATAR from '../constants/defaultAvatar';
import { PROPERTIES } from '../constants/mockData';

// ─── Static config ────────────────────────────────────────────────────────────

const getMenu = (colors, hasPost) => [
  hasPost ? { icon: 'person-circle-outline', label: 'Mon Profil Colocataire', screen: 'MyRoommateProfile', color: colors.primary } : null,
  { icon: 'options-outline',        label: 'Mes Préférences',   screen: 'EditPreferences', color: colors.primary },
  { icon: 'heart-outline',          label: 'Saved Properties',  screen: 'SavedProperties', color: colors.rose },
  { icon: 'document-text-outline',  label: 'My Listings',       screen: 'MyListings',      color: colors.primary },
  { icon: 'bar-chart-outline',      label: 'Market Insights',   screen: 'MarketInsights',  color: colors.teal },
  { icon: 'help-circle-outline',    label: 'Help & Support',    screen: 'Help',            color: colors.gold },
  { icon: 'log-out-outline',        label: 'Log Out',           screen: null,              color: colors.error },
].filter(Boolean);

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
  const [reviewCount, setReviewCount] = useState(0);
  const [myRoommatePost, setMyRoommatePost] = useState(null);

  useEffect(() => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;
    getCountFromServer(collection(db, 'users', uid, 'comments'))
      .then((snap) => setReviewCount(snap.data().count))
      .catch(() => {});

    // Fetch own roommate post
    const fsdb = getFirestore();
    const unsubPost = onSnapshot(query(collection(fsdb, 'roommatePosts'), where('uid', '==', uid)), (snap) => {
      if (!snap.empty) {
        const d = snap.docs[0];
        setMyRoommatePost({ firestoreId: d.id, ...d.data() });
      } else {
        setMyRoommatePost(null);
      }
    });

    return () => unsubPost();
  }, []);

  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const menuList = React.useMemo(() => getMenu(colors, !!myRoommatePost), [colors, myRoommatePost]);

  const savedCount    = getFavoriteIds().length;
  const listingsCount = PROPERTIES.filter((p) => p.featured).length;

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const b64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
        const uid = getAuth().currentUser?.uid;
        if (uid) {
          await updateDoc(doc(db, 'users', uid), { photo: b64 });
        }
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Could not pick image from gallery.');
    }
  };

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
    if (item.screen === 'MyRoommateProfile' && myRoommatePost) {
      const uid = getAuth().currentUser?.uid;
      navigation.navigate('RoommateProfile', {
        roommate: {
          id: `real_${myRoommatePost.firestoreId}`,
          uid,
          name: myRoommatePost.name || user?.name || 'Moi',
          username: myRoommatePost.username || user?.username || '',
          role: myRoommatePost.description?.slice(0, 50) || 'Cherche colocation',
          age: myRoommatePost.age || user?.age || null,
          city: myRoommatePost.city || user?.city || 'Tunis',
          compatibility: null,
          recommended: false,
          rating: myRoommatePost.rating || null,
          reviewCount: myRoommatePost.reviewCount || 0,
          image: user?.photo || null,
          bio: myRoommatePost.description || '',
          budget: myRoommatePost.budget || '',
          interests: myRoommatePost.interests || [],
          habits: myRoommatePost.habits || [],
          experiences: [],
          isReal: true,
        },
      });
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
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="create-outline" size={20} color={colors.white} />
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Profile card ── */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={styles.avatarContainer}>
            <Image
              source={user?.photo ? { uri: user.photo } : DEFAULT_AVATAR}
              style={styles.avatarImg}
            />
            <View style={styles.editAvatarBadge}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
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
            { label: 'Saved',    value: savedCount },
            { label: 'Listings', value: listingsCount },
            { label: 'Reviews',  value: reviewCount, screen: 'ProfileReviews' },
          ].map((s) => (
            <TouchableOpacity
              key={s.label}
              style={styles.statItem}
              onPress={() => s.screen && navigation.navigate(s.screen)}
              activeOpacity={s.screen ? 0.7 : 1}
            >
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={[styles.statLabel, s.screen && { color: colors.primary }]}>
                {s.label}{s.screen ? ' ›' : ''}
              </Text>
            </TouchableOpacity>
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
  safe: { flex: 1, backgroundColor: colors.background, paddingTop: 15 },
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
    backgroundColor: colors.card,
    marginHorizontal: SIZES.medium,
    borderRadius: SIZES.radius.xl,
    padding: SIZES.large,
    alignItems: 'center',
    marginTop: -40,
    ...SHADOWS.medium,
  },
  avatarContainer: {
    marginBottom: SIZES.medium,
    position: 'relative',
  },
  avatarCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: colors.primaryOpacity,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: colors.card,
  },
  avatarInitials: { ...FONTS.h1, color: colors.primary, fontSize: 32 },
  avatarImg: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 3, borderColor: colors.card,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.card,
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
