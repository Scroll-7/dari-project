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
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';

const ACCENT = COLORS.primary;

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
              <View style={[styles.tagChip, { backgroundColor: tag.bg }]}>
                <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
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
  const navigation = useNavigation();
  const myUid = getAuth().currentUser?.uid;
  const { conversations: localConvs } = useConversations();

  const [firebaseConvs, setFirebaseConvs] = useState([]);
  const [loadingFb, setLoadingFb] = useState(true);
  const [search, setSearch] = useState('');

  // Subscribe to real Firebase conversations
  useEffect(() => {
    if (!myUid) { setLoadingFb(false); return; }
    const unsub = subscribeToConversations(myUid, (convs) => {
      setFirebaseConvs(convs);
      setLoadingFb(false);
    });
    return unsub;
  }, [myUid]);

  // Map local ConversationContext entries (service providers) to display format.
  // These only exist if the user actually tapped the chat button on a provider.
  const localChatsDisplay = localConvs.map((conv) => {
    const last = conv.messages?.length
      ? conv.messages[conv.messages.length - 1]
      : null;
    return {
      id: conv.id,
      personId: conv.personId,
      name: conv.name,
      initials: conv.initials || getInitials(conv.name),
      avatarColor: conv.avatarColor,
      lastMessage: last
        ? (last.fromSelf ? `Vous: ${last.text}` : last.text)
        : (conv.lastMessage || 'Démarrez la conversation…'),
      time: last
        ? new Date(last.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '',
      tag: 'service',
      isLocal: true,
    };
  });

  // Convert Firebase convs to display format
  const fbChatsDisplay = firebaseConvs.map((c) => ({
    ...c,
    name: c.otherName,
    initials: getInitials(c.otherName),
    avatarColor: pickColor(c.otherName),
    tag: 'firebase',
    isLocal: false,
  }));

  // Combine: service provider chats the user started + real Firebase convs
  const allChats = [...localChatsDisplay, ...fbChatsDisplay];

  const filtered = allChats.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (c.name || '').toLowerCase().includes(q) ||
           (c.otherUsername || '').toLowerCase().includes(q);
  });

  const handleChatPress = (item) => {
    if (item.isLocal) {
      // Open local ConversationContext-based chat (service providers)
      navigation.navigate('Chat', { personId: item.personId });
    } else {
      // Open real Firebase chat
      navigation.navigate('Chat', {
        otherUid: item.otherUid,
        otherName: item.otherName,
        otherUsername: item.otherUsername || '',
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSub}>{allChats.length} conversation{allChats.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.composeBtn}
          onPress={() => navigation.navigate('NewChat')}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher…"
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Content ── */}
      {loadingFb ? (
        <View style={styles.center}>
          <ActivityIndicator color={ACCENT} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => <ChatRow item={item} onPress={handleChatPress} />}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="chatbubbles-outline" size={64} color="#ddd" />
              <Text style={styles.emptyTitle}>Aucun résultat</Text>
              <Text style={styles.emptyHint}>Essayez un autre nom</Text>
            </View>
          }
          ListFooterComponent={
            fbChatsDisplay.length === 0 ? (
              <TouchableOpacity
                style={styles.newChatBanner}
                onPress={() => navigation.navigate('NewChat')}
              >
                <Ionicons name="person-add-outline" size={20} color={ACCENT} />
                <Text style={styles.newChatBannerText}>
                  Discuter avec un autre utilisateur de l'app
                </Text>
                <Ionicons name="chevron-forward" size={18} color={ACCENT} />
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 24, marginTop: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#555', marginTop: 8 },
  emptyHint: { fontSize: 14, color: '#aaa', textAlign: 'center' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.line,
  },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#111', letterSpacing: -0.5 },
  headerSub: { ...FONTS.caption, color: ACCENT, marginTop: 2 },
  composeBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: ACCENT, justifyContent: 'center', alignItems: 'center',
  },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.card,
    marginHorizontal: SIZES.medium, marginVertical: 10,
    borderRadius: SIZES.radius.lg, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.line,
    ...SHADOWS.xs,
  },
  searchInput: { flex: 1, ...FONTS.body1, color: COLORS.text },

  listContent: { paddingBottom: 20 },
  sep: { height: 1, backgroundColor: '#f5f5f5', marginLeft: 74 },

  chatRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: SIZES.medium, paddingVertical: 13, gap: 12,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700' },
  chatInfo: { flex: 1, minWidth: 0 },
  chatTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 4 },
  chatName: { fontSize: 15, fontWeight: '600', color: '#111', flexShrink: 1 },
  tagChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  chatTime: { fontSize: 11, color: '#aaa', flexShrink: 0 },
  chatPreview: { fontSize: 13, color: '#888', marginTop: 3 },

  newChatBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    margin: SIZES.medium,
    backgroundColor: COLORS.primaryOpacity,
    borderRadius: SIZES.radius.lg, padding: SIZES.medium,
    borderWidth: 1, borderColor: COLORS.primary + '30',
  },
  newChatBannerText: { flex: 1, ...FONTS.body2, color: ACCENT, fontWeight: '600' },
});
