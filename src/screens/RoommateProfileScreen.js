import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
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

// ─── Star row ────────────────────────────────────────────────────────────────
function Stars({ count }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons
          key={s}
          name={s <= count ? 'star' : 'star-outline'}
          size={13}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

// ─── Section heading ─────────────────────────────────────────────────────────
function SectionTitle({ label }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

// ─── Tag pill ────────────────────────────────────────────────────────────────
function Tag({ text, accent = false }) {
  return (
    <View style={[styles.tag, accent && styles.tagAccent]}>
      <Text style={[styles.tagText, accent && styles.tagTextAccent]}>{text}</Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function RoommateProfileScreen({ route }) {
  const navigation = useNavigation();
  const { openOrCreateConversation } = useConversations();
  const { roommate } = route.params;

  const scoreColor =
    roommate.compatibility >= 90 ? COLORS.success :
    roommate.compatibility >= 80 ? COLORS.primary :
    COLORS.warning;

  const handleChat = () => {
    openOrCreateConversation({
      id: `roommate_${roommate.id}`,
      name: roommate.name,
      tag: 'roommate',
    });
    navigation.navigate('Chat', { personId: `roommate_${roommate.id}` });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* ── Floating back button ── */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={20} color={COLORS.text} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero card ── */}
        <View style={styles.heroCard}>
          <Image source={{ uri: roommate.image }} style={styles.heroPhoto} />

          <View style={styles.heroInfo}>
            {/* Name + recommended */}
            <View style={styles.nameRow}>
              <Text style={styles.heroName}>{roommate.name}</Text>
              {roommate.recommended && (
                <View style={styles.recBadge}>
                  <Ionicons name="star" size={11} color="#fff" />
                  <Text style={styles.recBadgeText}>Recommandé</Text>
                </View>
              )}
            </View>

            <Text style={styles.heroRole}>{roommate.role}</Text>

            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={COLORS.textLight} />
              <Text style={styles.metaText}>{roommate.city}</Text>
              <View style={styles.dot} />
              <Ionicons name="person-outline" size={14} color={COLORS.textLight} />
              <Text style={styles.metaText}>{roommate.age} ans</Text>
            </View>

            {/* Compatibility score */}
            <View style={styles.scoreRow}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${roommate.compatibility}%`, backgroundColor: scoreColor },
                  ]}
                />
              </View>
              <Text style={[styles.scoreText, { color: scoreColor }]}>
                {roommate.compatibility}% compatible
              </Text>
            </View>
          </View>
        </View>

        {/* ── Budget ── */}
        <View style={styles.budgetRow}>
          <Ionicons name="wallet-outline" size={16} color={COLORS.primary} />
          <Text style={styles.budgetLabel}>Budget : </Text>
          <Text style={styles.budgetValue}>{roommate.budget}</Text>
        </View>

        {/* ── Bio ── */}
        <View style={styles.section}>
          <SectionTitle label="À propos" />
          <Text style={styles.bio}>{roommate.bio}</Text>
        </View>

        {/* ── Interests ── */}
        <View style={styles.section}>
          <SectionTitle label="Centres d'intérêt" />
          <View style={styles.tagWrap}>
            {roommate.interests.map((t) => (
              <Tag key={t} text={t} />
            ))}
          </View>
        </View>

        {/* ── Habits ── */}
        <View style={styles.section}>
          <SectionTitle label="Habitudes de vie" />
          <View style={styles.tagWrap}>
            {roommate.habits.map((h) => {
              const isBad = h.includes('Noctambule') || h.includes('Fumeur');
              return <Tag key={h} text={h} accent={!isBad} />;
            })}
          </View>
        </View>

        {/* ── Past experiences ── */}
        <View style={styles.section}>
          <SectionTitle label="Expériences passées" />
          {roommate.experiences.length === 0 ? (
            <Text style={styles.noExp}>Aucune expérience enregistrée</Text>
          ) : (
            roommate.experiences.map((exp, idx) => (
              <View key={exp.id} style={styles.expCard}>
                {/* Timeline dot */}
                <View style={styles.timelineCol}>
                  <View style={[styles.timelineDot, { backgroundColor: COLORS.primary }]} />
                  {idx < roommate.experiences.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>

                <View style={styles.expContent}>
                  <View style={styles.expHeader}>
                    <Text style={styles.expPlace} numberOfLines={1}>{exp.place}</Text>
                    <Text style={styles.expYear}>{exp.year}</Text>
                  </View>

                  <Text style={styles.expDuration}>{exp.duration}</Text>

                  <Stars count={exp.rating} />

                  <Text style={styles.expNote}>{exp.note}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Bottom padding for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Fixed bottom action bar ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.chatBtn} onPress={handleChat} activeOpacity={0.85}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
          <Text style={styles.chatBtnText}>Envoyer un message</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SIZES.medium, paddingTop: SIZES.xxl + SIZES.small },

  backBtn: {
    position: 'absolute',
    top: SIZES.large,
    left: SIZES.medium,
    zIndex: 10,
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.light,
  },

  // Hero
  heroCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.xl,
    padding: SIZES.medium,
    gap: SIZES.medium,
    marginBottom: SIZES.medium,
    ...SHADOWS.light,
  },
  heroPhoto: {
    width: 90, height: 90,
    borderRadius: SIZES.radius.lg,
  },
  heroInfo: { flex: 1 },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 3,
  },
  heroName: { ...FONTS.h2, color: COLORS.text, flex: 1 },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: SIZES.radius.pill,
  },
  recBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },

  heroRole: { ...FONTS.body2, color: COLORS.textLight, marginBottom: 6 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  metaText: { ...FONTS.caption, color: COLORS.textLight },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: COLORS.line },

  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barTrack: { flex: 1, height: 5, borderRadius: 3, backgroundColor: COLORS.line, overflow: 'hidden' },
  barFill:  { height: '100%', borderRadius: 3 },
  scoreText: { ...FONTS.caption, fontWeight: '700', minWidth: 110 },

  // Budget
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    ...SHADOWS.xs,
  },
  budgetLabel: { ...FONTS.body2, color: COLORS.textLight },
  budgetValue: { ...FONTS.body2, fontWeight: '700', color: COLORS.primary },

  // Sections
  section: { marginBottom: SIZES.large },
  sectionLabel: {
    ...FONTS.label,
    color: COLORS.textLight,
    marginBottom: SIZES.small,
  },
  bio: { ...FONTS.body1, color: COLORS.textBody, lineHeight: 24 },

  // Tags
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: SIZES.radius.pill,
    backgroundColor: COLORS.line,
  },
  tagText: { ...FONTS.caption, color: COLORS.textBody, fontWeight: '600' },
  tagAccent: { backgroundColor: COLORS.primaryOpacity },
  tagTextAccent: { color: COLORS.primary },

  // Experiences timeline
  noExp: { ...FONTS.body2, color: COLORS.textLight },
  expCard: {
    flexDirection: 'row',
    gap: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  timelineCol: { alignItems: 'center', width: 16 },
  timelineDot: {
    width: 12, height: 12, borderRadius: 6,
    marginTop: 4,
  },
  timelineLine: {
    flex: 1, width: 2,
    backgroundColor: COLORS.line,
    marginTop: 4,
  },
  expContent: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: 14,
    ...SHADOWS.xs,
    marginBottom: 0,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  expPlace:    { ...FONTS.h3, color: COLORS.text, flex: 1, marginRight: 8 },
  expYear:     { ...FONTS.caption, color: COLORS.textLight },
  expDuration: { ...FONTS.body2, color: COLORS.textLight, marginBottom: 6 },
  expNote:     { ...FONTS.body2, color: COLORS.textBody, marginTop: 6, fontStyle: 'italic' },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.medium,
    paddingBottom: SIZES.large,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.pill,
    paddingVertical: 14,
    ...SHADOWS.card,
  },
  chatBtnText: {
    ...FONTS.body1,
    fontWeight: '700',
    color: '#fff',
  },
});
