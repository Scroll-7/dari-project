import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
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
import { useConversations } from '../context/ConversationContext';
import { FilterPill } from '../components/FilterPill';
import { StarRating } from '../components/StarRating';
import { COLORS, FONTS, GRADIENTS, SHADOWS, SIZES } from '../constants/theme';

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
    habits: ['Non-fumeur', 'Noctambule', 'Pas d\'animaux'],
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
    habits: ['Non-fumeur', 'Couche-tôt', 'Pas d\'animaux'],
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
    bio: 'Architecte passionné par le design et l\'art. Je cherche un logement côtier.',
    budget: '500 – 750 DT/mois',
    interests: ['Architecture', 'Surf', 'Cinéma', 'Voyages'],
    habits: ['Fumeur (ext.)', 'Noctambule', 'Animaux OK'],
    experiences: [
      { id: 'e1', place: 'Studio La Marsa', duration: '1 an', year: '2023–2024', rating: 4, note: '' },
    ],
  },
];

// ─── CompatRing ───────────────────────────────────────────────────────────────

function CompatRing({ score }) {
  const color =
    score >= 90 ? COLORS.success :
    score >= 80 ? COLORS.primary :
    COLORS.warning;

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
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      {/* Left: photo */}
      <View style={styles.photoWrap}>
        <Image source={{ uri: item.image }} style={styles.photo} />
        {item.recommended && (
          <View style={styles.recDot}>
            <Ionicons name="star" size={9} color="#fff" />
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
        <Text style={styles.role}>{item.role} · {item.age} ans · {item.city}</Text>
        <StarRating rating={item.rating} size={11} />

        {/* Interest pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll} contentContainerStyle={{ gap: 5, paddingTop: 6 }}>
          {item.interests.slice(0, 3).map((int) => (
            <View key={int} style={styles.interestPill}>
              <Text style={styles.interestText}>{int}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Right: compat + chat */}
      <View style={styles.rightCol}>
        <CompatRing score={item.compatibility} />
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={(e) => { e.stopPropagation?.(); onChat(item); }}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-ellipses" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RoommatesScreen() {
  const navigation = useNavigation();
  const { openOrCreateConversation } = useConversations();
  const [filter, setFilter] = useState('all'); // 'all' | 'recommended' | 'high_compat'

  const handleChat = (item) => {
    openOrCreateConversation({ id: `roommate_${item.id}`, name: item.name, tag: 'roommate' });
    navigation.navigate('Chat', { personId: `roommate_${item.id}` });
  };

  const data =
    filter === 'recommended' ? ROOMMATES.filter((r) => r.recommended) :
    filter === 'high_compat' ? ROOMMATES.filter((r) => r.compatibility >= 85) :
    ROOMMATES;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Colocataires</Text>
          <Text style={styles.subtitle}>{data.length} suggestions pour vous</Text>
        </View>
        <TouchableOpacity style={styles.filterIconBtn} activeOpacity={0.8}>
          <Ionicons name="options-outline" size={20} color={COLORS.text} />
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ gap: 8, paddingHorizontal: SIZES.medium }}>
        <FilterPill label="Tous" active={filter === 'all'}         onPress={() => setFilter('all')} />
        <FilterPill label="⭐ Recommandés" active={filter === 'recommended'} onPress={() => setFilter('recommended')} />
        <FilterPill label="🔥 > 85%" active={filter === 'high_compat'} onPress={() => setFilter('high_compat')} />
      </ScrollView>

      {/* ── List ── */}
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
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: SIZES.medium,
    paddingTop: SIZES.large, paddingBottom: SIZES.small,
  },
  title:    { ...FONTS.h1, color: COLORS.text },
  subtitle: { ...FONTS.body2, color: COLORS.textLight, marginTop: 4 },
  filterIconBtn: {
    width: 42, height: 42, borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.light,
  },

  // Tip banner
  tipBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: SIZES.medium, borderRadius: SIZES.radius.lg,
    padding: 12, marginBottom: SIZES.small,
  },
  tipText: { flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.9)', lineHeight: 16 },

  // Filter row
  filterRow: { marginBottom: SIZES.medium },

  // List
  list: { paddingHorizontal: SIZES.medium, paddingBottom: 100 },

  // Card
  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: COLORS.card, borderRadius: SIZES.radius.xl,
    padding: 12, marginBottom: SIZES.medium, gap: 10,
    ...SHADOWS.light,
  },

  photoWrap: { position: 'relative' },
  photo: { width: 70, height: 70, borderRadius: SIZES.radius.lg },
  recDot: {
    position: 'absolute', bottom: -2, right: -2,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#F59E0B',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.card,
  },

  info: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginBottom: 3 },
  name: { ...FONTS.h3, color: COLORS.text },
  recTag: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: SIZES.radius.pill,
  },
  recTagText: { fontSize: 9, fontWeight: '700', color: '#D97706' },
  role: { ...FONTS.caption, color: COLORS.textLight, marginBottom: 4 },

  pillScroll: { flexGrow: 0 },
  interestPill: {
    backgroundColor: COLORS.primaryOpacity, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: SIZES.radius.pill,
  },
  interestText: { fontSize: 10, color: COLORS.primary, fontWeight: '600' },

  // Right column: compat ring + chat
  rightCol: { alignItems: 'center', gap: 8 },
  ringWrap: { alignItems: 'center' },
  ringOuter: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 3, justifyContent: 'center', alignItems: 'center',
    flexDirection: 'row',
  },
  ringScore: { fontSize: 13, fontWeight: '800' },
  ringPct:   { fontSize: 8,  fontWeight: '600', color: COLORS.textLight },

  chatBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primaryOpacity,
    justifyContent: 'center', alignItems: 'center',
  },
});
