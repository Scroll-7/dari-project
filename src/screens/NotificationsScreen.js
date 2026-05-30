import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

import { FONTS, SHADOWS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const { user } = useUser();
  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'users', currentUser.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(fetched);
      setLoading(false);
    });

    return unsub;
  }, [currentUser]);

  const handleNotificationPress = async (notif) => {
    // Mark as read
    if (!notif.read && currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid, 'notifications', notif.id), {
          read: true,
        });
      } catch (error) {
        console.error('Error marking notification as read', error);
      }
    }

    // Navigate to own profile's comments page
    if (notif.type === 'comment') {
      navigation.navigate('RoommateProfile', {
        roommate: {
          uid: currentUser.uid,
          name: user?.name || user?.username || 'Mon Profil',
          photo: user?.photo || null,
          image: user?.photo || null,
          city: user?.city || '',
          age: user?.age || null,
          description: user?.description || '',
          bio: user?.description || '',
          compatibility: null,
          budget: user?.budget || null,
          interests: user?.interests || [],
          habits: user?.habits || [],
          lifestyle: user?.lifestyle || [],
          experiences: [],
          recommended: false,
        },
      });
    }
  };

  const renderItem = ({ item }) => {
    const isUnread = !item.read;
    const date = item.createdAt ? item.createdAt.toDate().toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    }) : '';

    return (
      <TouchableOpacity 
        style={[styles.notifCard, isUnread && { backgroundColor: colors.primaryOpacity }]} 
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.iconWrap}>
          <Ionicons name="chatbubble-ellipses" size={24} color={colors.primary} />
        </View>
        <View style={styles.contentWrap}>
          <Text style={styles.notifTitle}>
            <Text style={{ fontWeight: 'bold' }}>{item.fromName}</Text> a commenté sur votre profil
          </Text>
          <Text style={styles.notifMessage} numberOfLines={2}>"{item.message}"</Text>
          <Text style={styles.notifTime}>{date}</Text>
        </View>
        {isUnread && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="notifications-off-outline" size={64} color={colors.line} />
          <Text style={styles.emptyText}>Aucune notification</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: { padding: 4 },
  headerTitle: { ...FONTS.h2, color: colors.text },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...FONTS.body1, color: colors.textLight, marginTop: 10 },
  list: { padding: SIZES.medium, gap: SIZES.medium },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.medium,
    ...SHADOWS.xs,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  contentWrap: { flex: 1 },
  notifTitle: { ...FONTS.body2, color: colors.text, marginBottom: 4 },
  notifMessage: { ...FONTS.body2, color: colors.textLight, fontStyle: 'italic', marginBottom: 8 },
  notifTime: { ...FONTS.caption, color: colors.textLight },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginLeft: SIZES.small,
    marginTop: SIZES.small,
  },
});
