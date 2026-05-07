import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { subscribeToConversations } from '../firebase/chat';
import { useConversations } from '../context/ConversationContext';
import { FONTS, SHADOWS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

const AVATAR_COLORS = ['#4461F2','#E83E8C','#20C997','#FD7E14','#6F42C1','#FFC107','#D85A30'];
function pickColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + h * 31;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function formatTime(date) {
  if (!date) return '';
  const now = new Date();
  const d = date instanceof Date ? date : new Date(date);
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return d.toLocaleDateString('fr-FR', { weekday: 'short' });
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

// ─── Tag chip ─────────────────────────────────────────────────────────────────

const TAG_CONFIG = {
  service:  { label: 'Service',  bg: '#FFF3E0', color: '#E65100' },
  firebase: { label: 'Message', bg: '#EEF2FF', color: '#4F46E5' },
};

// ─── Chat Row ─────────────────────────────────────────────────────────────────

function ChatRow({ item, onPress }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const name = item.name || item.otherName || 'Utilisateur';
  const color = item.avatarColor || pickColor(name);
  const initials = item.initials || getInitials(name);
  const preview = item.lastMessage || 'Démarrez la conversation…';
  const timeStr = item.time || (item.lastTime ? formatTime(item.lastTime) : '');
  const tagKey = item.tag || 'firebase';
  const tag = TAG_CONFIG[tagKey];

  return (
    <TouchableOpacity style={styles.chatRow} onPress={() => onPress(item)} activeOpacity={0.7}>
      <View style={[styles.avatar, { backgroundColor: color + '22' }]}>
        <Text style={[styles.avatarText, { color }]}>{initials}</Text>
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatTop}>
          <View style={styles.chatNameRow}>
            <Text style={styles.chatName} numberOfLines={1}>{name}</Text>
            {tag && (
              <View style={[styles.tagChip, { backgroundColor: colors.isDark ? '#1E1B4B' : tag.bg }]}>
                <Text style={[styles.tagText, { color: colors.isDark ? colors.primary : tag.color }]}>{tag.label}</Text>
              </View>
            )}
          </View>
          <Text style={styles.chatTime}>{timeStr}</Text>
        </View>
        <Text style={styles.chatPreview} numberOfLines={1}>{preview}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function InboxScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const myUid = getAuth().currentUser?.uid;
  const { conversations: localConvs } = useConversations();

  const [firebaseConvs, setFirebaseConvs] = useState([]);
  const [loadingFb, setLoadingFb] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!myUid) return;
    const unsub = subscribeToConversations(myUid, (convs) => {
      setFirebaseConvs(convs);
      setLoadingFb(false);
    });
    return () => unsub();
  }, [myUid]);

  const handlePress = (item) => {
    if (item.personId) {
      // Local mock conversation
      navigation.navigate('Chat', { personId: item.personId });
    } else {
      // Firebase real conversation
      navigation.navigate('Chat', { conversationId: item.id, otherUid: item.otherUid, otherName: item.otherName });
    }
  };

  // Merge local (services) and firebase chats
  const allConvs = [...localConvs, ...firebaseConvs];
  const filtered = allConvs.filter(c => 
    (c.name || c.otherName || '').toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => (b.lastTime || 0) - (a.lastTime || 0));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('NewChat')}>
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une discussion…"
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {loadingFb ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubbles-outline" size={64} color={colors.line} />
          <Text style={styles.emptyText}>Aucune discussion trouvée</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatRow item={item} onPress={handlePress} />}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
  },
  headerTitle: { ...FONTS.h1, color: colors.text },
  newBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.light,
  },
  searchContainer: { paddingHorizontal: SIZES.medium, marginBottom: SIZES.small },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: 12, height: 46,
    ...SHADOWS.xs,
  },
  searchInput: { flex: 1, marginLeft: 10, ...FONTS.body1, color: colors.text },
  list: { paddingBottom: 100 },
  chatRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: SIZES.medium,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  avatar: {
    width: 54, height: 54, borderRadius: 27,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700' },
  chatInfo: { flex: 1, marginLeft: 15 },
  chatTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chatNameRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  chatName: { ...FONTS.h3, color: colors.text, marginRight: 8 },
  chatTime: { ...FONTS.caption, color: colors.textLight },
  chatPreview: { ...FONTS.body2, color: colors.textLight },
  tagChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { ...FONTS.body1, color: colors.textLight, marginTop: 10 },
});
