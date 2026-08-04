import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert, Linking } from 'react-native';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { useConversations } from '../context/ConversationContext';
import { useUser } from '../context/UserContext';
import { getOrCreateConversation } from '../firebase/chat';
import { FONTS, SHADOWS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

// ─── Stars display ────────────────────────────────────────────────────────────
function Stars({ count, size = 14 }) {
  const full = Math.floor(count);
  const half = count - full >= 0.4;
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => {
        const name = s <= full ? 'star' : s === full + 1 && half ? 'star-half' : 'star-outline';
        return <Ionicons key={s} name={name} size={size} color="#F59E0B" />;
      })}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ServiceProviderProfileScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { provider, category } = route.params;
  const { user } = useUser();
  const { openOrCreateConversation } = useConversations();

  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  // Firestore doc ID for this provider (composite to avoid collisions)
  const providerId = `${category}_${provider.id}`;

  const [comments, setComments]           = useState([]);
  const [newComment, setNewComment]       = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [submitting, setSubmitting]       = useState(false);
  const [avgRating, setAvgRating]         = useState(provider.rating || 0);
  const [reviewCount, setReviewCount]     = useState(provider.reviews || 0);

  // ── Fetch live comments ────────────────────────────────────────────────────
  useEffect(() => {
    const q = query(
      collection(db, 'serviceProviders', providerId, 'comments'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setComments(fetched);
      // Recalculate live avg
      const rated = fetched.filter((c) => c.rating > 0);
      if (rated.length > 0) {
        const avg = rated.reduce((s, c) => s + c.rating, 0) / rated.length;
        setAvgRating(parseFloat(avg.toFixed(1)));
        setReviewCount(rated.length);
      } else {
        setAvgRating(provider.rating || 0);
        setReviewCount(provider.reviews || 0);
      }
    });
    return unsub;
  }, [providerId, db, provider.rating, provider.reviews]);

  // ── Update global avg in Firestore ────────────────────────────────────────
  const updateProviderAvg = async () => {
    try {
      const snaps = await getDocs(
        collection(db, 'serviceProviders', providerId, 'comments')
      );
      let total = 0, count = 0;
      snaps.forEach((d) => {
        const r = d.data().rating;
        if (r) { total += r; count++; }
      });
      const avg = count > 0 ? parseFloat((total / count).toFixed(1)) : null;
      await setDoc(
        doc(db, 'serviceProviders', providerId),
        { rating: avg, reviewCount: count, name: provider.name, category },
        { merge: true }
      );
    } catch (e) {
      console.warn('Could not update provider avg', e);
    }
  };

  // ── Submit comment ─────────────────────────────────────────────────────────
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    if (!currentUser) {
      Alert.alert('Erreur', 'Vous devez être connecté pour commenter.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingCommentId) {
        await updateDoc(
          doc(db, 'serviceProviders', providerId, 'comments', editingCommentId),
          { text: newComment.trim() }
        );
        setEditingCommentId(null);
      } else {
        await addDoc(collection(db, 'serviceProviders', providerId, 'comments'), {
          text: newComment.trim(),
          rating: selectedRating,
          authorId: currentUser.uid,
          authorName: user?.name || user?.username || currentUser.displayName || 'Utilisateur',
          createdAt: serverTimestamp(),
        });
        await updateProviderAvg();
      }
      setNewComment('');
      setSelectedRating(0);
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete comment ─────────────────────────────────────────────────────────
  const handleDeleteComment = async (commentId) => {
    Alert.alert('Supprimer', 'Supprimer ce commentaire ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(
              doc(db, 'serviceProviders', providerId, 'comments', commentId)
            );
            await updateProviderAvg();
          } catch (e) {
            Alert.alert('Erreur', e.message);
          }
        },
      },
    ]);
  };

  // ── Contact handlers ───────────────────────────────────────────────────────
  const handleChat = async () => {
    // Real registered service provider → persistent Firestore conversation
    if (provider.isReal && provider.uid) {
      const myUid = getAuth().currentUser?.uid;
      if (myUid && myUid !== provider.uid) {
        try {
          const conversationId = await getOrCreateConversation(myUid, provider.uid);
          navigation.navigate('Chat', {
            conversationId,
            otherUid: provider.uid,
            otherName: provider.name,
            otherPhoto: null,
            otherUsername: '',
          });
          return;
        } catch (e) {
          console.warn('Chat init error:', e);
        }
      }
    }
    // Mock provider (no user account) → local fallback
    openOrCreateConversation({
      id: `service_${provider.id}_${provider.name}`,
      name: provider.name,
      avatarColor: provider.avatarColor,
      tag: 'service',
    });
    navigation.navigate('Chat', { personId: `service_${provider.id}_${provider.name}` });
  };

  const handleCall = () => {
    const url = `tel:${provider.phone.replace(/\s/g, '')}`;
    Linking.canOpenURL(url).then((ok) => {
      if (ok) Linking.openURL(url);
      else Alert.alert('Erreur', 'Impossible de passer un appel.');
    });
  };

  const handleWhatsApp = () => {
    const number = provider.phone.replace(/[\s+]/g, '');
    const url = `whatsapp://send?phone=${number}`;
    Linking.canOpenURL(url).then((ok) => {
      if (ok) Linking.openURL(url);
      else Alert.alert('WhatsApp', "WhatsApp n'est pas installé.");
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero Card ── */}
        <View style={styles.heroCard}>
          {/* Avatar */}
          <View style={[styles.avatarCircle, { backgroundColor: provider.avatarColor + '22' }]}>
            <Text style={[styles.avatarText, { color: provider.avatarColor }]}>
              {provider.initials}
            </Text>
          </View>

          {/* Info */}
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{provider.name}</Text>
            <Text style={styles.heroSpecialty}>{provider.specialty}</Text>

            {/* Rating row */}
            <View style={styles.ratingRow}>
              <Stars count={avgRating} size={13} />
              <Text style={styles.ratingNum}>{avgRating > 0 ? avgRating.toFixed(1) : '–'}</Text>
              <Text style={styles.ratingCount}>({reviewCount} avis)</Text>
            </View>

            {/* Availability badge */}
            <View style={[styles.badge, provider.available ? styles.badgeAvail : styles.badgeBusy]}>
              <View style={[styles.badgeDot, { backgroundColor: provider.available ? '#22C55E' : '#EF233C' }]} />
              <Text style={[styles.badgeText, { color: provider.available ? '#16A34A' : '#EF233C' }]}>
                {provider.available ? 'Disponible' : 'Occupé'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Details Row ── */}
        <View style={styles.detailsRow}>
          <View style={styles.detailCard}>
            <Ionicons name="time-outline" size={22} color={colors.primary} />
            <Text style={styles.detailLabel}>Expérience</Text>
            <Text style={styles.detailValue}>{provider.experience}</Text>
          </View>
          <View style={styles.detailCard}>
            <Ionicons name="wallet-outline" size={22} color={colors.primary} />
            <Text style={styles.detailLabel}>Tarif</Text>
            <Text style={styles.detailValue}>{provider.price}</Text>
          </View>
          <View style={styles.detailCard}>
            <Ionicons name="construct-outline" size={22} color={colors.primary} />
            <Text style={styles.detailLabel}>Catégorie</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{category}</Text>
          </View>
        </View>

        {/* ── Contact Buttons ── */}
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.btnChat} onPress={handleChat} activeOpacity={0.8}>
            <Ionicons name="chatbubble-ellipses" size={18} color={colors.primary} />
            <Text style={[styles.btnText, { color: colors.primary }]}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnWA} onPress={handleWhatsApp} activeOpacity={0.8}>
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            <Text style={[styles.btnText, { color: '#fff' }]}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCall} onPress={handleCall} activeOpacity={0.8}>
            <Ionicons name="call" size={18} color="#fff" />
            <Text style={[styles.btnText, { color: '#fff' }]}>Appeler</Text>
          </TouchableOpacity>
        </View>

        {/* ── Reviews Section ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Avis clients</Text>
            {avgRating > 0 && (
              <View style={styles.avgBadge}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.avgText}>{avgRating.toFixed(1)}</Text>
                <Text style={styles.avgCount}> ({reviewCount})</Text>
              </View>
            )}
          </View>

          {/* Comment list */}
          {comments.length === 0 ? (
            <Text style={styles.noComments}>Aucun avis pour le moment. Soyez le premier !</Text>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentAvatarCircle}>
                    <Text style={styles.commentAvatarText}>
                      {(comment.authorName || 'U')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                    {comment.rating > 0 && <Stars count={comment.rating} size={12} />}
                  </View>
                  {currentUser?.uid === comment.authorId && (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => {
                          setEditingCommentId(comment.id);
                          setNewComment(comment.text);
                          setSelectedRating(comment.rating || 0);
                        }}
                      >
                        <Ionicons name="pencil" size={16} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                        <Ionicons name="trash" size={16} color="#EF233C" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            ))
          )}
        </View>

        {/* ── Add Comment ── */}
        {currentUser && (
          <View style={styles.addCommentBox}>
            <Text style={styles.addCommentTitle}>
              {editingCommentId ? 'Modifier votre avis' : 'Laisser un avis'}
            </Text>

            {!editingCommentId && (
              <View style={styles.starPickerRow}>
                <Text style={styles.starPickerLabel}>Note :</Text>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity key={s} onPress={() => setSelectedRating(s)} activeOpacity={0.7}>
                    <Ionicons
                      name={s <= selectedRating ? 'star' : 'star-outline'}
                      size={28}
                      color={s <= selectedRating ? '#F59E0B' : colors.textLight}
                    />
                  </TouchableOpacity>
                ))}
                {selectedRating > 0 && (
                  <TouchableOpacity onPress={() => setSelectedRating(0)} style={{ marginLeft: 4 }}>
                    <Ionicons name="close-circle" size={18} color={colors.textLight} />
                  </TouchableOpacity>
                )}
              </View>
            )}

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
                  onPress={() => { setEditingCommentId(null); setNewComment(''); setSelectedRating(0); }}
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
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.commentBtnText}>{editingCommentId ? 'Modifier' : 'Envoyer'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const getStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, paddingTop: 15 },
  scroll: { paddingTop: 60, paddingHorizontal: SIZES.medium },

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
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '800' },
  heroInfo: { flex: 1 },
  heroName: { ...FONTS.h2, color: colors.text, marginBottom: 4 },
  heroSpecialty: { ...FONTS.body2, color: colors.textLight, marginBottom: 8 },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  ratingNum:   { ...FONTS.body2, fontWeight: '700', color: colors.text },
  ratingCount: { ...FONTS.caption, color: colors.textLight },

  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: SIZES.radius.pill },
  badgeAvail: { backgroundColor: '#DCFCE7' },
  badgeBusy:  { backgroundColor: '#FEE2E2' },
  badgeDot:   { width: 7, height: 7, borderRadius: 4 },
  badgeText:  { ...FONTS.caption, fontWeight: '700' },

  // Details row
  detailsRow: { flexDirection: 'row', gap: 8, marginBottom: SIZES.medium },
  detailCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: SIZES.radius.lg,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    ...SHADOWS.xs,
  },
  detailLabel: { ...FONTS.caption, color: colors.textLight, textAlign: 'center' },
  detailValue: { ...FONTS.body2, fontWeight: '700', color: colors.text, textAlign: 'center' },

  // Contact
  contactRow: { flexDirection: 'row', gap: 8, marginBottom: SIZES.large },
  btnChat: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.primaryOpacity, paddingVertical: 12, borderRadius: SIZES.radius.pill,
  },
  btnWA: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#25D366', paddingVertical: 12, borderRadius: SIZES.radius.pill,
  },
  btnCall: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.primary, paddingVertical: 12, borderRadius: SIZES.radius.pill,
  },
  btnText: { ...FONTS.caption, fontWeight: '700' },

  // Section
  section: { marginBottom: SIZES.medium },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SIZES.small },
  sectionTitle: { ...FONTS.h3, color: colors.text },
  avgBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: SIZES.radius.pill },
  avgText:  { ...FONTS.body2, fontWeight: '700', color: '#F59E0B', marginLeft: 4 },
  avgCount: { ...FONTS.caption, color: colors.textLight },

  noComments: { ...FONTS.body2, color: colors.textLight, fontStyle: 'italic', textAlign: 'center', paddingVertical: 20 },

  // Comment card
  commentCard: {
    backgroundColor: colors.card,
    borderRadius: SIZES.radius.lg,
    padding: 12,
    marginBottom: SIZES.small,
    ...SHADOWS.xs,
  },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  commentAvatarCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.primaryOpacity,
    justifyContent: 'center', alignItems: 'center',
  },
  commentAvatarText: { ...FONTS.body2, fontWeight: '700', color: colors.primary },
  commentAuthor: { ...FONTS.body2, fontWeight: '700', color: colors.text, marginBottom: 2 },
  commentText:   { ...FONTS.body2, color: colors.textBody, lineHeight: 20 },

  // Add comment
  addCommentBox: {
    backgroundColor: colors.card,
    borderRadius: SIZES.radius.xl,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    ...SHADOWS.light,
  },
  addCommentTitle: { ...FONTS.h3, color: colors.text, marginBottom: SIZES.small },
  starPickerRow:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: SIZES.small },
  starPickerLabel: { ...FONTS.body2, fontWeight: '600', color: colors.text, marginRight: 4 },
  commentInput: {
    borderWidth: 1,
    borderRadius: SIZES.radius.md,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    ...FONTS.body2,
    marginBottom: SIZES.small,
  },
  commentBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: SIZES.radius.pill,
    ...SHADOWS.xs,
  },
  commentBtnText: { color: '#fff', fontWeight: '700', ...FONTS.body2 },
});
