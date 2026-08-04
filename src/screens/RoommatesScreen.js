import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getOrCreateConversation } from '../firebase/chat';
import { useConversations } from '../context/ConversationContext';
import { StarRating } from '../components/StarRating';
import { FONTS, GRADIENTS, SHADOWS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import DEFAULT_AVATAR from '../constants/defaultAvatar';

const db = getFirestore();

function CheckboxItem({ label, checked, onChange, colors }) {
  return (
    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }} onPress={onChange} activeOpacity={0.7}>
      <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: checked ? colors.primary : colors.textLight, backgroundColor: checked ? colors.primary : 'transparent', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
        {checked && <Ionicons name="checkmark" size={14} color="#fff" />}
      </View>
      <Text style={{ ...FONTS.body2, fontWeight: '500', color: colors.text, letterSpacing: 0.3 }}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const ROOMMATES = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    role: 'Étudiante en médecine',
    age: 24,
    city: 'Tunis',
    compatibility: 95,
    recommended: true,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    bio: 'Passionnée par la médecine et les voyages. Je cherche un colocataire calme et organisé.',
    budget: '400 – 600 DT/mois',
    interests: ['Lecture', 'Yoga', 'Cuisine', 'Cinéma'],
    habits: ['Non-fumeur', 'Rentre tard', 'Animaux OK'],
    experiences: [
      { id: 'e1', place: 'Résidence universitaire', duration: '2 ans', year: '2021–2023', rating: 5, note: '' },
      { id: 'e2', place: 'Colocation Lac',          duration: '1 an', year: '2023–2024', rating: 4, note: '' },
    ],
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Développeur fullstack',
    age: 28,
    city: 'Tunis',
    compatibility: 88,
    recommended: true,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    bio: 'Développeur travaillant à distance. Calme, rangé et autonome.',
    budget: '500 – 800 DT/mois',
    interests: ['Technologie', 'Gaming', 'Running', 'Musique'],
    habits: ['Non-fumeur', 'Noctambule', "Pas d'animaux"],
    experiences: [
      { id: 'e1', place: 'Studio partagé, Menzah', duration: '1,5 an', year: '2022–2024', rating: 5, note: '' },
    ],
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    role: 'Designer UX/UI',
    age: 26,
    city: 'Carthage',
    compatibility: 82,
    recommended: false,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    bio: 'Designer créative cherchant une colocation dans un quartier animé.',
    budget: '400 – 700 DT/mois',
    interests: ['Art', 'Photographie', 'Cuisine', 'Randonnée'],
    habits: ['Fumeur (ext.)', 'Lève-tôt', 'Animaux OK'],
    experiences: [
      { id: 'e1', place: 'Colocation Gammarth', duration: '8 mois', year: '2023', rating: 3, note: '' },
    ],
  },
  {
    id: '4',
    name: 'Yasmine Belkahia',
    role: 'Avocate junior',
    age: 27,
    city: 'Tunis',
    compatibility: 79,
    recommended: true,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    bio: 'Professionnelle sérieuse, recherche une colocation calme et propre.',
    budget: '600 – 900 DT/mois',
    interests: ['Droit', 'Podcast', 'Jardinage', 'Natation'],
    habits: ['Non-fumeur', 'Couche-tôt', "Pas d'animaux"],
    experiences: [
      { id: 'e1', place: 'Appart. 2ch Centre-ville', duration: '2 ans', year: '2022–2024', rating: 5, note: '' },
    ],
  },
  {
    id: '5',
    name: 'Amine Dridi',
    role: 'Architecte',
    age: 30,
    city: 'La Marsa',
    compatibility: 74,
    recommended: false,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    bio: "Architecte passionné par le design et l'art. Je cherche un logement côtier.",
    budget: '500 – 750 DT/mois',
    interests: ['Architecture', 'Surf', 'Cinéma', 'Voyages'],
    habits: ['Fumeur (ext.)', 'Noctambule', 'Animaux OK'],
    experiences: [
      { id: 'e1', place: 'Studio La Marsa', duration: '1 an', year: '2023–2024', rating: 4, note: '' },
    ],
  },
];

// ─── Matching algorithm ───────────────────────────────────────────────────────

/** Jaccard similarity as a 0–1 percentage */
function jaccardPct(a = [], b = []) {
  if (!a.length && !b.length) return 1;
  const setA = new Set(a);
  const union = new Set([...a, ...b]);
  let inter = 0;
  b.forEach((x) => { if (setA.has(x)) inter++; });
  return union.size === 0 ? 0 : inter / union.size;
}

/** Budget overlap score: 1 if same range, 0.5 if adjacent, 0 otherwise */
const BUDGET_RANKS = { '0-300': 0, '300-500': 1, '500-800': 2, '800-1200': 3, '1200+': 4 };
function budgetOverlapPct(a, b) {
  if (!a || !b) return 0;
  const diff = Math.abs((BUDGET_RANKS[a] ?? 2) - (BUDGET_RANKS[b] ?? 2));
  if (diff === 0) return 1;
  if (diff === 1) return 0.6;
  return 0;
}

/** Main match scorer: 0–100 */
function computeMatch(myPrefs, otherPrefs) {
  if (!myPrefs || !otherPrefs) return null;
  const interests = jaccardPct(myPrefs.interests, otherPrefs.interests) * 50;
  const budget    = budgetOverlapPct(myPrefs.budgetRange, otherPrefs.budgetRange) * 30;
  const lifestyle = jaccardPct(myPrefs.lifestyle, otherPrefs.lifestyle) * 20;
  return Math.round(interests + budget + lifestyle);
}

// ─── CompatRing ───────────────────────────────────────────────────────────────

function CompatRing({ score }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const color =
    score >= 90 ? colors.success :
    score >= 80 ? colors.primary :
    colors.warning;

  return (
    <View style={styles.ringWrap}>
      <View style={[styles.ringOuter, { borderColor: color }]}>
        <Text style={[styles.ringScore, { color }]}>{score}</Text>
        <Text style={styles.ringPct}>%</Text>
      </View>
    </View>
  );
}

// ─── RoommateCard ─────────────────────────────────────────────────────────────

function RoommateCard({ item, onPress, onChat }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const CardContainer = TouchableOpacity;

  return (
    <CardContainer
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Left: photo or fallback */}
      <View style={styles.photoWrap}>
        <Image 
          source={item.image ? { uri: item.image } : DEFAULT_AVATAR} 
          style={styles.photo} 
        />
        {item.recommended && (
          <View style={styles.recDot}>
            <Ionicons name="star" size={9} color={colors.white} />
          </View>
        )}

      </View>

      {/* Center: info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{item.name}</Text>
          {item.recommended && (
            <View style={styles.recTag}>
              <Text style={styles.recTagText}>⭐ Recommandé</Text>
            </View>
          )}
        </View>
        <Text style={styles.role} numberOfLines={2}>
          {item.role}{item.age ? ` · ${item.age} ans` : ''}{item.city ? ` · ${item.city}` : ''}
        </Text>
        {item.rating != null && <StarRating rating={item.rating} size={11} reviews={item.reviewCount || undefined} />}
        {item.budget ? (
          <Text style={styles.budgetText}>💰 {item.budget}</Text>
        ) : null}
        {item.interests?.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll} contentContainerStyle={{ gap: 5, paddingTop: 6 }}>
            {item.interests.slice(0, 3).map((int) => (
              <View key={int} style={styles.interestPill}>
                <Text style={styles.interestText}>{int}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Right: compat + chat */}
      <View style={styles.rightCol}>
        {item.compatibility != null && <CompatRing score={item.compatibility} />}
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={(e) => { e.stopPropagation?.(); onChat(item); }}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-ellipses" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </CardContainer>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RoommatesScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const myUid = getAuth().currentUser?.uid;
  const { openOrCreateConversation } = useConversations();
  const [showPreferences, setShowPreferences] = useState(false);
  const [filters, setFilters] = useState({ male: false, female: false, matching: false, rating: false });
  const [realPosts, setRealPosts] = useState([]);
  const [loadingReal, setLoadingReal] = useState(true);
  const [myPrefs, setMyPrefs] = useState(null);

  // Fetch current user's preferences once
  useEffect(() => {
    if (!myUid) return;
    import('firebase/firestore').then(({ doc, getDoc }) => {
      getDoc(doc(db, 'users', myUid)).then((snap) => {
        if (snap.exists()) setMyPrefs(snap.data()?.preferences || null);
      }).catch(() => {});
    });
  }, [myUid]);

  useEffect(() => {
    const q = query(collection(db, 'roommatePosts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const posts = snap.docs
        .map((d) => ({ firestoreId: d.id, ...d.data() }))
        .filter((p) => p.uid !== myUid);
      setRealPosts(posts);
      setLoadingReal(false);
    });
    return unsub;
  }, [myUid]);

  const realAsCards = realPosts.map((p) => {
    const otherPrefs = p.preferences || null;
    const score      = computeMatch(myPrefs, otherPrefs);
    return {
      id: `real_${p.firestoreId}`,
      uid: p.uid,
      name: p.name || 'Utilisateur',
      username: p.username || '',
      role: p.description?.slice(0, 50) || 'Cherche colocation',
      age: p.age || null,
      city: p.city || '',
      compatibility: score,
      recommended: score !== null && score >= 85,
      rating: p.rating || null,
      reviewCount: p.reviewCount || 0,
      image: null,
      bio: p.description || '',
      budget: p.budget || '',
      interests: p.interests || [],
      habits: p.habits || [],
      experiences: [],
      isReal: true,
    };
  });

  const combined = [...realAsCards, ...ROOMMATES.map((r) => ({ ...r, isReal: false }))];

  const handleChat = async (item) => {
    if (item.isReal) {
      try {
        if (!myUid) { Alert.alert('Erreur', "Vous n'êtes pas connecté."); return; }
        if (!item.uid) { Alert.alert('Erreur', "L'utilisateur n'a pas d'ID."); return; }
        await getOrCreateConversation(myUid, item.uid);
        navigation.navigate('Chat', { otherUid: item.uid, otherName: item.name, otherUsername: item.username });
      } catch (e) {
        console.error('Chat error:', e);
        Alert.alert('Erreur', e.message);
      }
    } else {
      openOrCreateConversation({
        id: `roommate_${item.id}`,
        name: item.name,
        tag: 'roommate',
      });
      navigation.navigate('Chat', { personId: `roommate_${item.id}` });
    }
  };

  let data = combined.filter((r) => {
    let pass = true;
    if (filters.male || filters.female) {
      // Mock logic since we don't have gender saved yet: Names ending in 'a' or 'e' generally mapped to female mock users
      const isFemaleMock = r.name.toLowerCase().endsWith('a') || r.name.toLowerCase().endsWith('e');
      if (filters.female && !filters.male && !isFemaleMock) pass = false;
      if (filters.male && !filters.female && isFemaleMock) pass = false;
    }
    return pass;
  });

  if (filters.rating) {
    data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
  if (filters.matching) {
    data.sort((a, b) => (b.compatibility || 0) - (a.compatibility || 0));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Colocataires</Text>
            <Text style={styles.subtitle}>{data.length} suggestions pour vous</Text>
          </View>
        </View>
      </View>

      {/* ── Hero tip card ── */}
      <LinearGradient colors={GRADIENTS.primary} style={styles.tipBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Ionicons name="information-circle-outline" size={20} color="rgba(255,255,255,0.9)" />
        <Text style={styles.tipText}>
          Notre algorithme analyse la compatibilité selon vos habitudes, budget et centres d’intérêt.
        </Text>
      </LinearGradient>

      {/* ── Preferences Dropdown ── */}
      <View style={{ paddingHorizontal: SIZES.medium, marginBottom: SIZES.small, zIndex: 10 }}>
        <TouchableOpacity 
          style={styles.prefBtn}
          onPress={() => setShowPreferences(!showPreferences)}
          activeOpacity={0.8}
        >
          <Ionicons name="options-outline" size={18} color={colors.primary} />
          <Text style={styles.prefBtnText}>Préférences</Text>
          <Ionicons name={showPreferences ? "chevron-up" : "chevron-down"} size={16} color={colors.primary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {showPreferences && (
          <View style={styles.dropdownBox}>
            <CheckboxItem label="Homme" checked={filters.male} onChange={() => setFilters({...filters, male: !filters.male})} colors={colors} />
            <CheckboxItem label="Femme" checked={filters.female} onChange={() => setFilters({...filters, female: !filters.female})} colors={colors} />
            <CheckboxItem label="Selon le matching" checked={filters.matching} onChange={() => setFilters({...filters, matching: !filters.matching})} colors={colors} />
            <CheckboxItem label="Selon le rating" checked={filters.rating} onChange={() => setFilters({...filters, rating: !filters.rating})} colors={colors} />
          </View>
        )}
      </View>

      {/* ── List ── */}
      {loadingReal ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RoommateCard
              item={item}
              onPress={() => navigation.navigate('RoommateProfile', { roommate: item })}
              onChat={handleChat}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const getStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, paddingTop: 15 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.medium, paddingTop: 10, paddingBottom: SIZES.medium,
  },
  headerLeft: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  title: { ...FONTS.h1, color: colors.text },
  subtitle: { ...FONTS.body2, color: colors.textLight, marginTop: 2 },
  filterIconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.line,
  },

  tipBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: SIZES.medium, borderRadius: SIZES.radius.lg,
    padding: 12, marginBottom: SIZES.small,
  },
  tipText: { flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.9)', lineHeight: 16 },

  prefBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 12, borderRadius: SIZES.radius.lg, borderWidth: 1, borderColor: colors.line, gap: 8 },
  prefBtnText: { ...FONTS.h3, color: colors.text },
  dropdownBox: { backgroundColor: colors.card, marginTop: 8, borderRadius: SIZES.radius.lg, padding: 12, borderWidth: 1, borderColor: colors.line, ...SHADOWS.medium },

  list: { paddingHorizontal: SIZES.medium, paddingBottom: 100 },

  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: colors.card, borderRadius: SIZES.radius.xl,
    padding: 12, marginBottom: SIZES.medium, gap: 10,
    ...SHADOWS.light,
  },

  photoWrap:         { position: 'relative' },
  photo:             { width: 70, height: 70, borderRadius: SIZES.radius.lg },
  photoInitials:     { justifyContent: 'center', alignItems: 'center' },
  photoInitialsText: { fontSize: 24, fontWeight: '800' },
  recDot: {
    position: 'absolute', bottom: -2, right: -2,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#F59E0B',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.card,
  },
  realBadge: {
    position: 'absolute', top: -4, left: -4,
    backgroundColor: colors.primary,
    paddingHorizontal: 5, paddingVertical: 2,
    borderRadius: 6,
  },
  realBadgeText: { fontSize: 8, color: colors.white, fontWeight: '800' },
  budgetText:    { fontSize: 11, color: colors.textLight, marginTop: 3 },

  info:    { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginBottom: 3 },
  name:    { ...FONTS.h3, color: colors.text },
  recTag:  { backgroundColor: '#FEF3C7', paddingHorizontal: 7, paddingVertical: 2, borderRadius: SIZES.radius.pill },
  recTagText: { fontSize: 9, fontWeight: '700', color: '#D97706' },
  role:    { ...FONTS.caption, color: colors.textLight, marginBottom: 4 },

  pillScroll:    { flexGrow: 0 },
  interestPill:  { backgroundColor: colors.primaryOpacity, paddingHorizontal: 8, paddingVertical: 3, borderRadius: SIZES.radius.pill },
  interestText:  { fontSize: 10, color: colors.primary, fontWeight: '600' },

  rightCol:  { alignItems: 'center', gap: 8 },
  ringWrap:  { alignItems: 'center' },
  ringOuter: { width: 48, height: 48, borderRadius: 24, borderWidth: 3, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  ringScore: { fontSize: 13, fontWeight: '800' },
  ringPct:   { fontSize: 8, fontWeight: '600', color: colors.textLight },

  chatBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primaryOpacity,
    justifyContent: 'center', alignItems: 'center',
  },
});
