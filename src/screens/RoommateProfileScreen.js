import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

import { useConversations } from '../context/ConversationContext';
import { useUser } from '../context/UserContext';
import { FONTS, SHADOWS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

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
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

// ─── Tag pill ────────────────────────────────────────────────────────────────
function Tag({ text, accent = false }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={[styles.tag, accent && styles.tagAccent]}>
      <Text style={[styles.tagText, accent && styles.tagTextAccent]}>{text}</Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function RoommateProfileScreen({ route }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const { openOrCreateConversation } = useConversations();
  const { roommate } = route.params;
  const { user } = useUser();

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  useEffect(() => {
    // We only fetch live comments if this is a real user (has uid)
    if (!roommate.uid) return;
    
    const q = query(
      collection(db, 'users', roommate.uid, 'comments'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setComments(fetched);
    });
    return unsub;
  }, [roommate.uid]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    if (!currentUser) {
      Alert.alert('Erreur', 'Vous devez être connecté pour commenter.');
      return;
    }
    if (!roommate.uid) {
      Alert.alert('Erreur', "Vous ne pouvez commenter que sur les vrais profils.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingCommentId) {
        // Edit mode
        await updateDoc(doc(db, 'users', roommate.uid, 'comments', editingCommentId), {
          text: newComment.trim(),
        });
        setEditingCommentId(null);
      } else {
        // Create mode
        await addDoc(collection(db, 'users', roommate.uid, 'comments'), {
          text: newComment.trim(),
          authorId: currentUser.uid,
          authorName: user?.name || user?.username || currentUser.displayName || 'Utilisateur',
          createdAt: serverTimestamp(),
        });
        
        // Notification
        if (currentUser.uid !== roommate.uid) {
          await addDoc(collection(db, 'users', roommate.uid, 'notifications'), {
            type: 'comment',
            fromName: user?.name || user?.username || currentUser.displayName || 'Utilisateur',
            createdAt: serverTimestamp(),
            read: false,
            message: newComment.trim(),
          });
        }
      }
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment: ', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le commentaire.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (comment) => {
    setEditingCommentId(comment.id);
    setNewComment(comment.text);
  };

  const handleDeleteComment = (commentId) => {
    Alert.alert('Supprimer', 'Voulez-vous vraiment supprimer ce commentaire ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
          try {
            await deleteDoc(doc(db, 'users', roommate.uid, 'comments', commentId));
          } catch (error) {
            console.error('Error deleting comment: ', error);
            Alert.alert('Erreur', 'Impossible de supprimer ce commentaire.');
          }
      } }
    ]);
  };

  const scoreColor =
    roommate.compatibility >= 90 ? colors.success :
    roommate.compatibility >= 80 ? colors.primary :
    colors.warning;

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
      <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* ── Floating back button ── */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={20} color={colors.text} />
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
                  <Ionicons name="star" size={11} color={colors.white} />
                  <Text style={styles.recBadgeText}>Recommandé</Text>
                </View>
              )}
            </View>

            <Text style={styles.heroRole}>{roommate.role}</Text>

            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={colors.textLight} />
              <Text style={styles.metaText}>{roommate.city}</Text>
              <View style={styles.dot} />
              <Ionicons name="person-outline" size={14} color={colors.textLight} />
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
          <Ionicons name="wallet-outline" size={16} color={colors.primary} />
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

        {/* ── Avis et Commentaires ── */}
        <View style={styles.section}>
          <SectionTitle label="Avis d'anciens colocataires" />
          
          {/* Mock experiences (if any) */}
          {roommate.experiences?.map((exp, idx) => (
            <View key={exp.id} style={styles.expCard}>
              <View style={styles.timelineCol}>
                <View style={[styles.timelineDot, { backgroundColor: colors.primary }]} />
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.expContent}>
                <View style={styles.expHeader}>
                  <Text style={styles.expPlace} numberOfLines={1}>{exp.place}</Text>
                  <Text style={styles.expYear}>{exp.year}</Text>
                </View>
                <Text style={styles.expDuration}>{exp.duration}</Text>
                <Stars count={exp.rating} />
                {exp.note ? <Text style={styles.expNote}>{exp.note}</Text> : null}
              </View>
            </View>
          ))}

          {/* Real comments */}
          {comments.map((comment, idx) => (
            <View key={comment.id} style={styles.expCard}>
              <View style={styles.timelineCol}>
                <View style={[styles.timelineDot, { backgroundColor: colors.primary }]} />
                {idx < comments.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.expContent}>
                <View style={styles.expHeader}>
                  <Text style={styles.expPlace} numberOfLines={1}>{comment.authorName}</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    {currentUser && currentUser.uid === comment.authorId && (
                      <TouchableOpacity onPress={() => handleEditClick(comment)}>
                        <Ionicons name="pencil" size={16} color={colors.primary} />
                      </TouchableOpacity>
                    )}
                    {currentUser && (currentUser.uid === comment.authorId || currentUser.uid === roommate.uid) && (
                      <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                        <Ionicons name="trash" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <Text style={styles.expNote}>{comment.text}</Text>
              </View>
            </View>
          ))}

          {(!roommate.experiences?.length && comments.length === 0) && (
            <Text style={styles.noExp}>Aucun avis pour le moment.</Text>
          )}

          {/* Add/Edit Comment Input */}
          {roommate.uid && (
            <View style={styles.commentInputWrap}>
              <TextInput
                style={[styles.commentInput, { color: colors.text, borderColor: colors.line }]}
                placeholder="Laissez un commentaire..."
                placeholderTextColor={colors.textLight}
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                {editingCommentId && (
                  <TouchableOpacity
                    style={[styles.commentBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line }]}
                    onPress={() => {
                      setEditingCommentId(null);
                      setNewComment('');
                    }}
                  >
                    <Text style={[styles.commentBtnText, { color: colors.text }]}>Annuler</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.commentBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSubmitComment}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.commentBtnText}>{editingCommentId ? 'Modifier' : 'Envoyer'}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Bottom padding for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Fixed bottom action bar ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.chatBtn} onPress={handleChat} activeOpacity={0.85}>
          <Ionicons name="chatbubble-ellipses" size={20} color={colors.white} />
          <Text style={styles.chatBtnText}>Envoyer un message</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const getStyles = (colors) => StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  scroll: { padding: SIZES.medium, paddingTop: SIZES.xxl + SIZES.small },

  backBtn: {
    position: 'absolute',
    top: SIZES.large,
    left: SIZES.medium,
    zIndex: 10,
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.light,
  },

  // Hero
  heroCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
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
  heroName: { ...FONTS.h2, color: colors.text, flex: 1 },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: SIZES.radius.pill,
  },
  recBadgeText: { fontSize: 10, fontWeight: '700', color: colors.white },

  heroRole: { ...FONTS.body2, color: colors.textLight, marginBottom: 6 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  metaText: { ...FONTS.caption, color: colors.textLight },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.line },

  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barTrack: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.line, overflow: 'hidden' },
  barFill:  { height: '100%', borderRadius: 3 },
  scoreText: { ...FONTS.caption, fontWeight: '700', minWidth: 110 },

  // Budget
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    ...SHADOWS.xs,
  },
  budgetLabel: { ...FONTS.body2, color: colors.textLight },
  budgetValue: { ...FONTS.body2, fontWeight: '700', color: colors.primary },

  // Sections
  section: { marginBottom: SIZES.large },
  sectionLabel: {
    ...FONTS.label,
    color: colors.textLight,
    marginBottom: SIZES.small,
  },
  bio: { ...FONTS.body1, color: colors.textBody, lineHeight: 24 },

  // Tags
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: SIZES.radius.pill,
    backgroundColor: colors.line,
  },
  tagText: { ...FONTS.caption, color: colors.textBody, fontWeight: '600' },
  tagAccent: { backgroundColor: colors.primaryOpacity },
  tagTextAccent: { color: colors.primary },

  // Experiences timeline
  noExp: { ...FONTS.body2, color: colors.textLight },
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
    backgroundColor: colors.line,
    marginTop: 4,
  },
  expContent: {
    flex: 1,
    backgroundColor: colors.card,
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
  expPlace:    { ...FONTS.h3, color: colors.text, flex: 1, marginRight: 8 },
  expYear:     { ...FONTS.caption, color: colors.textLight },
  expDuration: { ...FONTS.body2, color: colors.textLight, marginBottom: 6 },
  expNote:     { ...FONTS.body2, color: colors.textBody, marginTop: 6, fontStyle: 'italic' },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.medium,
    paddingBottom: SIZES.large,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    borderRadius: SIZES.radius.pill,
    paddingVertical: 14,
    ...SHADOWS.card,
  },
  chatBtnText: {
    ...FONTS.body1,
    fontWeight: '700',
    color: colors.white,
  },
  
  // Comment Input
  commentInputWrap: {
    marginTop: SIZES.medium,
    gap: SIZES.small,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: SIZES.radius.md,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    ...FONTS.body2,
  },
  commentBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: SIZES.radius.pill,
    ...SHADOWS.xs,
  },
  commentBtnText: {
    color: '#fff',
    fontWeight: '700',
    ...FONTS.body2,
  },
});
