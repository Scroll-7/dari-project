// screens/ProfileReviewsScreen.js
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { FONTS, SHADOWS, SIZES } from '../constants/theme';
import { GRADIENTS } from '../constants/theme';

// ─── Star row ───────────────────────────────────────────────────────────────
function Stars({ count = 0 }) {
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

// ─── Single review card ─────────────────────────────────────────────────────
function ReviewCard({ item, currentUid, onDelete, colors }) {
  const styles = getStyles(colors);
  const isOwner = item.authorId === currentUid;

  const date = item.createdAt
    ? item.createdAt.toDate().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <View style={styles.card}>
      {/* Avatar + name row */}
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>
            {(item.authorName || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.authorName}>{item.authorName || 'Utilisateur'}</Text>
          <Stars count={item.rating || 0} />
        </View>
        {isOwner && (
          <TouchableOpacity
            onPress={() => onDelete(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error || '#EF4444'} />
          </TouchableOpacity>
        )}
      </View>

      {/* Comment text */}
      <Text style={styles.commentText}>{item.text}</Text>

      {/* Date */}
      <Text style={styles.dateText}>{date}</Text>
    </View>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────
export default function ProfileReviewsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { user } = useUser();
  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'users', currentUser.uid, 'comments'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setReviews(fetched);
      setLoading(false);
    });

    return unsub;
  }, [currentUser]);

  const handleDelete = (commentId) => {
    Alert.alert(
      'Supprimer le commentaire',
      'Voulez-vous vraiment supprimer votre commentaire ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(
                doc(db, 'users', currentUser.uid, 'comments', commentId)
              );
            } catch (e) {
              Alert.alert('Erreur', 'Impossible de supprimer ce commentaire.');
            }
          },
        },
      ]
    );
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient
        colors={colors.gradientPrimary || GRADIENTS.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Mes Avis</Text>
          <Text style={styles.headerSub}>
            {reviews.length} commentaire{reviews.length !== 1 ? 's' : ''}
            {avgRating ? `  ·  ⭐ ${avgRating}` : ''}
          </Text>
        </View>
        <View style={{ width: 38 }} />
      </LinearGradient>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="chatbubbles-outline" size={72} color={colors.line} />
          <Text style={styles.emptyTitle}>Aucun avis pour l'instant</Text>
          <Text style={styles.emptySubtitle}>
            Les commentaires que d'autres utilisateurs laissent sur votre profil apparaîtront ici.
          </Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReviewCard
              item={item}
              currentUid={currentUser?.uid}
              onDelete={handleDelete}
              colors={colors}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const getStyles = (colors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SIZES.medium,
      paddingTop: SIZES.large,
      paddingBottom: SIZES.large,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: { ...FONTS.h2, color: '#fff' },
    headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyTitle: {
      ...FONTS.h3,
      color: colors.text,
      marginTop: 16,
      textAlign: 'center',
    },
    emptySubtitle: {
      ...FONTS.body2,
      color: colors.textLight,
      marginTop: 8,
      textAlign: 'center',
      lineHeight: 20,
    },

    list: { padding: SIZES.medium, gap: SIZES.medium },

    card: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius.lg,
      padding: SIZES.medium,
      ...SHADOWS.xs,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.primaryOpacity,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarInitial: {
      ...FONTS.h3,
      color: colors.primary,
      fontWeight: '700',
    },
    authorName: {
      ...FONTS.body1,
      color: colors.text,
      fontWeight: '600',
      marginBottom: 3,
    },
    commentText: {
      ...FONTS.body2,
      color: colors.text,
      lineHeight: 20,
      marginBottom: 8,
    },
    dateText: {
      ...FONTS.caption,
      color: colors.textLight,
    },
  });
