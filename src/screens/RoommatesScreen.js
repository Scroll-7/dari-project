import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { getOrCreateConversation } from '../firebase/chat';
import { FilterPill } from '../components/FilterPill';
import { StarRating } from '../components/StarRating';
import { FONTS, GRADIENTS, SHADOWS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const db = getFirestore();

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

// ─── Avatar color helper ──────────────────────────────────────────────────────

const AVATAR_PALETTE = ['#4461F2', '#E83E8C', '#20C997', '#FD7E14', '#6F42C1', '#FFC107'];
function pickAvatarColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + h * 31;
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

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
  const initials = item.name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
  const avatarColor = pickAvatarColor(item.name);
  const CardContainer = TouchableOpacity;

  return (
    <CardContainer
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Left: photo or initials */}
      <View style={styles.photoWrap}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoInitials, { backgroundColor: avatarColor + '22' }]}>
            <Text style={[styles.photoInitialsText, { color: avatarColor }]}>{initials}</Text>
          </View>
        )}
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
        {item.rating != null && <StarRating rating={item.rating} size={11} />}
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
  const [filter, setFilter] = useState('all');
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
      rating: null,
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
      navigation.navigate('Chat', { personId: `roommate_${item.id}` });
    }
  };

  const data =
    filter === 'recommended' ? combined.filter((r) => r.recommended) :
    filter === 'high_compat'  ? combined.filter((r) => r.compatibility >= 85) :
    combined;

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
        <TouchableOpacity style={styles.filterIconBtn} activeOpacity={0.8}>
          <Ionicons name="options-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* ── Hero tip card ── */}
      <LinearGradient colors={GRADIENTS.primary} style={styles.tipBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Ionicons name="information-circle-outline" size={20} color="rgba(255,255,255,0.9)" />
        <Text style={styles.tipText}>
          Notre algorithme analyse la compatibilité selon vos habitudes, budget et centres d'intérêt.
        </Text>
      </LinearGradient>

      {/* ── Filter pills ── */}
      <View style={styles.filterRowWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: SIZES.medium }}>
          <FilterPill label="Tous"           active={filter === 'all'}         onPress={() => setFilter('all')} />
          <FilterPill label="⭐ Recommandés" active={filter === 'recommended'} onPress={() => setFilter('recommended')} />
          <FilterPill label="🔥 > 85%"       active={filter === 'high_compat'} onPress={() => setFilter('high_compat')} />
        </ScrollView>
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
  safe: { flex: 1, backgroundColor: colors.background },

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

  filterRowWrap: { paddingVertical: 6, marginBottom: SIZES.small },
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
