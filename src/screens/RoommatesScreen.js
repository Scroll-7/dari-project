import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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

import { useConversations } from '../context/ConversationContext';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';

// ─── Mock Data ───────────────────────────────────────────────────────────────

export const ROOMMATES = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    role: 'Étudiante en médecine',
    age: 24,
    city: 'Tunis',
    compatibility: 95,
    recommended: true,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    bio: 'Passionnée par la médecine et les voyages. Je cherche un colocataire calme et organisé pour partager un appartement proche de la faculté.',
    budget: '400 – 600 DT/mois',
    interests: ['Lecture', 'Yoga', 'Cuisine', 'Cinéma'],
    habits: ['Non-fumeur', 'Rentre tard', 'Animaux OK'],
    experiences: [
      { id: 'e1', place: 'Résidence universitaire', duration: '2 ans', year: '2021–2023', rating: 5, note: 'Très bonne cohabitation' },
      { id: 'e2', place: 'Colocation 3 personnes, Lac', duration: '1 an', year: '2023–2024', rating: 4, note: 'Ambiance agréable, appartement lumineux' },
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
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    bio: 'Développeur travaillant à distance. Je suis calme, rangé et autonome. Je cherche un espace calme pour télétravailler.',
    budget: '500 – 800 DT/mois',
    interests: ['Technologie', 'Gaming', 'Running', 'Musique'],
    habits: ['Non-fumeur', 'Noctambule', 'Pas d\'animaux'],
    experiences: [
      { id: 'e1', place: 'Studio partagé, Menzah', duration: '1 an 6 mois', year: '2022–2024', rating: 5, note: 'Excellent colocataire, très respectueux' },
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
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400',
    bio: 'Designer créative cherchant une colocation dans un quartier animé. J\'adore décorer les espaces et cuisiner pour mes colocataires.',
    budget: '400 – 700 DT/mois',
    interests: ['Art', 'Photographie', 'Cuisine', 'Randonnée'],
    habits: ['Fumeur (extérieur)', 'Lève-tôt', 'Animaux OK'],
    experiences: [
      { id: 'e1', place: 'Colocation 2 personnes, Gammarth', duration: '8 mois', year: '2023', rating: 3, note: 'Quelques incompatibilités d\'horaires' },
      { id: 'e2', place: 'Appartement partagé, Sidi Bou Saïd', duration: '1 an', year: '2022–2023', rating: 4, note: 'Cadre magnifique, bonne entente' },
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
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    bio: 'Professionnelle sérieuse, recherche une colocation calme et propre. Je rentre souvent tôt et je respecte les espaces communs.',
    budget: '600 – 900 DT/mois',
    interests: ['Droit', 'Podcast', 'Jardinage', 'Natation'],
    habits: ['Non-fumeur', 'Couche-tôt', 'Pas d\'animaux'],
    experiences: [
      { id: 'e1', place: 'Appartement 2 chambres, Centre-ville', duration: '2 ans', year: '2022–2024', rating: 5, note: 'Parfaite cohabitation, très organisée' },
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
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    bio: 'Architecte passionné par le design et l\'art. Je cherche un logement proche de la côte, calme et inspirant.',
    budget: '500 – 750 DT/mois',
    interests: ['Architecture', 'Surf', 'Cinéma', 'Voyages'],
    habits: ['Fumeur (extérieur)', 'Noctambule', 'Animaux OK'],
    experiences: [
      { id: 'e1', place: 'Colocation studio, La Marsa', duration: '1 an', year: '2023–2024', rating: 4, note: 'Bonne ambiance créative' },
      { id: 'e2', place: 'Résidence estudiantine', duration: '2 ans', year: '2020–2022', rating: 3, note: 'Standard, sans problème majeur' },
    ],
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function CompatBar({ score }) {
  const color =
    score >= 90 ? COLORS.success :
    score >= 80 ? COLORS.primary :
    COLORS.warning;

  return (
    <View style={styles.barRow}>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.score, { color }]}>{score}%</Text>
    </View>
  );
}

function ExperiencePill({ text }) {
  return (
    <View style={styles.expPill}>
      <Text style={styles.expPillText}>{text}</Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function RoommatesScreen() {
  const navigation = useNavigation();
  const { openOrCreateConversation } = useConversations();
  const [filter, setFilter] = useState('all'); // 'all' | 'recommended'

  const handleChat = (item) => {
    openOrCreateConversation({ id: `roommate_${item.id}`, name: item.name, tag: 'roommate' });
    navigation.navigate('Chat', { personId: `roommate_${item.id}` });
  };

  const data = filter === 'recommended'
    ? ROOMMATES.filter((r) => r.recommended)
    : ROOMMATES;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => navigation.navigate('RoommateProfile', { roommate: item })}
    >
      {/* Left: photo + recommended badge */}
      <View>
        <Image source={{ uri: item.image }} style={styles.photo} />
        {item.recommended && (
          <View style={styles.recBadge}>
            <Ionicons name="star" size={9} color="#fff" />
          </View>
        )}
      </View>

      {/* Center: info */}
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{item.name}</Text>
          {item.recommended && (
            <View style={styles.recTag}>
              <Text style={styles.recTagText}>Recommandé</Text>
            </View>
          )}
        </View>

        <Text style={styles.role}>{item.role} · {item.age} ans · {item.city}</Text>

        <CompatBar score={item.compatibility} />

        {/* Past experiences preview */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScroll}
          contentContainerStyle={{ gap: 6 }}
        >
          {item.experiences.map((e) => (
            <ExperiencePill key={e.id} text={e.place} />
          ))}
        </ScrollView>
      </View>

      {/* Right: chat button */}
      <TouchableOpacity
        style={styles.chatBtn}
        onPress={(ev) => { ev.stopPropagation?.(); handleChat(item); }}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubble-ellipses" size={18} color={COLORS.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Colocataires</Text>
          <Text style={styles.subtitle}>{data.length} suggestions pour vous</Text>
        </View>
        <TouchableOpacity style={styles.filterIconBtn} activeOpacity={0.8}>
          <Ionicons name="options-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Filter pills */}
      <View style={styles.filterRow}>
        {[['all', 'Tous'], ['recommended', '⭐ Recommandés']].map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterPill, filter === key && styles.filterPillActive]}
            onPress={() => setFilter(key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterPillText, filter === key && styles.filterPillTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SIZES.medium,
    paddingTop: SIZES.large,
    paddingBottom: SIZES.small,
  },
  title:    { ...FONTS.h1, color: COLORS.text },
  subtitle: { ...FONTS.body2, color: COLORS.textLight, marginTop: 4 },
  filterIconBtn: {
    width: 42, height: 42,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.card,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.light,
  },

  // Filter pills
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: SIZES.medium,
    paddingBottom: SIZES.medium,
  },
  filterPill: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: SIZES.radius.pill,
    backgroundColor: COLORS.card,
    borderWidth: 1.5, borderColor: 'transparent',
    ...SHADOWS.xs,
  },
  filterPillActive:     { borderColor: COLORS.primary, backgroundColor: COLORS.primaryOpacity },
  filterPillText:       { ...FONTS.caption, color: COLORS.textLight, fontWeight: '600' },
  filterPillTextActive: { color: COLORS.primary },

  list: { paddingHorizontal: SIZES.medium, paddingBottom: 100 },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.xl,
    padding: 12,
    marginBottom: SIZES.medium,
    gap: 12,
    ...SHADOWS.light,
  },

  photo: {
    width: 68, height: 68,
    borderRadius: SIZES.radius.lg,
  },
  recBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#F59E0B',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.card,
  },

  info: { flex: 1, minWidth: 0 },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 3,
  },
  name: { ...FONTS.h3, color: COLORS.text },

  recTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: SIZES.radius.pill,
  },
  recTagText: {
    fontSize: 10, fontWeight: '700', color: '#D97706',
  },

  role: { ...FONTS.body2, color: COLORS.textLight, marginBottom: 8 },

  barRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  barTrack: { flex: 1, height: 5, borderRadius: 3, backgroundColor: COLORS.line, overflow: 'hidden' },
  barFill:  { height: '100%', borderRadius: 3 },
  score:    { ...FONTS.caption, fontWeight: '700', minWidth: 34 },

  pillScroll: { flexGrow: 0 },
  expPill: {
    backgroundColor: COLORS.primaryOpacity,
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: SIZES.radius.pill,
  },
  expPillText: { fontSize: 10, fontWeight: '600', color: COLORS.primary },

  chatBtn: {
    width: 38, height: 38, borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.primaryOpacity,
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center',
  },
});
