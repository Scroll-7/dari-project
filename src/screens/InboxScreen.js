import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import { useConversations } from '../context/ConversationContext';
import { Avatar } from '../components/Avatar';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';

// ─── Mock data ────────────────────────────────────────────────────────────────

const BINOME_REQUESTS = [
  {
    id: 'br1',
    name: 'Karim Aissani',
    initials: 'KA',
    color: '#4B5BF5',
    bgColor: '#EEF0FF',
    major: 'Computer Science student',
    sentAt: '5m ago',
  },
];

const CHATS = [
  { id: 'c1', name: 'Sara Benali',    initials: 'SB', color: '#D85A30', bgColor: '#FFD6CC', lastMessage: 'Is the apartment still available?',    time: '2m ago',   unread: 2, online: true,  isBinome: false, type: 'property' },
  { id: 'c2', name: 'Youssef Mansour', initials: 'YM', color: '#185FA5', bgColor: '#D6EDFF', lastMessage: 'Sure, we can schedule a visit',         time: '1h ago',   unread: 0, online: false, isBinome: false, type: 'roommate' },
  { id: 'c3', name: 'Rania Lakhal',   initials: 'RL', color: '#0F6E56', bgColor: '#E1F5EE', lastMessage: "Let's split the utilities 50/50",       time: 'Yesterday', unread: 0, online: true,  isBinome: true,  type: 'roommate' },
  { id: 'c4', name: 'Ahmed Hamdi',    initials: 'AH', color: '#BA7517', bgColor: '#FFF0D6', lastMessage: 'The landlord confirmed the price',       time: 'Mon',       unread: 0, online: false, isBinome: false, type: 'property' },
  { id: 'c5', name: 'Lina Dridi',     initials: 'LD', color: '#993556', bgColor: '#FBEAF0', lastMessage: 'Can we meet this weekend?',              time: 'Sun',       unread: 1, online: false, isBinome: false, type: 'roommate' },
];

// Online-first contacts (for story-style row)
const STORIES = CHATS.filter((c) => c.online).slice(0, 5);

const FILTERS = ['All', 'Roommates', 'Property'];

const TAG_CONFIG = {
  'binome-actuel':  { label: 'Binôme', bg: '#E1F5EE', color: '#0F6E56' },
  'demande-binome': { label: 'Roommate', bg: '#EEF0FF', color: '#4B5BF5' },
  service:          { label: 'Service', bg: '#FFF3E0', color: '#E65100' },
  property:         { label: 'Propriété', bg: '#E8F4FD', color: '#0077B6' },
};
function resolveTag(item) {
  if (item.isBinome) return 'binome-actuel';
  if (item.type === 'service' || item.tag === 'service') return 'service';
  if (item.type === 'roommate') return 'demande-binome';
  if (item.type === 'property') return 'property';
  return null;
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const anim = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -5, duration: 250, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 250, useNativeDriver: true }),
        ])
      ).start();
    dots.forEach((d, i) => anim(d, i * 150));
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 }}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.textLight, transform: [{ translateY: d }] }} />
      ))}
    </View>
  );
}

// ─── Chat Row ─────────────────────────────────────────────────────────────────

function ChatRow({ item, onPress, typing }) {
  const key  = resolveTag(item);
  const tag  = key ? TAG_CONFIG[key] : null;

  return (
    <TouchableOpacity style={styles.chatRow} onPress={() => onPress(item)}>
      <Avatar
        initials={item.initials}
        color={item.color ?? item.avatarColor}
        bgColor={item.bgColor}
        size={48}
        onlineDot={item.online}
      />
      <View style={styles.chatInfo}>
        <View style={styles.chatRowTop}>
          <View style={styles.chatNameRow}>
            <Text style={styles.chatName} numberOfLines={1}>{item.name}</Text>
            {tag && (
              <View style={[styles.tagChip, { backgroundColor: tag.bg }]}>
                <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
              </View>
            )}
          </View>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        {typing
          ? <TypingDots />
          : <Text style={[styles.chatPreview, item.unread > 0 && styles.chatPreviewBold]} numberOfLines={1}>{item.lastMessage}</Text>
        }
      </View>
      {item.unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Stories Row ─────────────────────────────────────────────────────────────

function StoriesRow({ chats }) {
  return (
    <View style={styles.storiesWrap}>
      <Text style={styles.storiesLabel}>En ligne</Text>
      <View style={styles.storiesRow}>
        {chats.map((c) => (
          <View key={c.id} style={styles.storyItem}>
            <View style={styles.storyRing}>
              <Avatar initials={c.initials} color={c.color} bgColor={c.bgColor} size={44} />
            </View>
            <Text style={styles.storyName} numberOfLines={1}>{c.name.split(' ')[0]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Binome Request ───────────────────────────────────────────────────────────

function BinomeCard({ request, onAccept, onDecline }) {
  return (
    <View style={styles.binomeCard}>
      <View style={styles.binomeHeader}>
        <View style={styles.binomeDot} />
        <Text style={styles.binomeLabel}>ROOMMATE REQUEST</Text>
      </View>
      <View style={styles.binomeBody}>
        <Avatar initials={request.initials} color={request.color} bgColor={request.bgColor} size={42} />
        <View style={styles.binomeInfo}>
          <Text style={styles.binomeName}>{request.name}</Text>
          <Text style={styles.binomeSub} numberOfLines={1}>{request.major} · {request.sentAt}</Text>
        </View>
        <View style={styles.binomeBtns}>
          <TouchableOpacity style={styles.decBtn} onPress={() => onDecline(request.id)}>
            <Text style={styles.decBtnText}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.accBtn} onPress={() => onAccept(request.id)}>
            <Text style={styles.accBtnText}>✓</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function InboxScreen() {
  const navigation = useNavigation();
  const { conversations } = useConversations();
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch]             = useState('');
  const [requests, setRequests]         = useState(BINOME_REQUESTS);
  const [typingId] = useState('c1'); // mock: c1 is "typing"

  const handleChatPress = (chat) =>
    navigation.navigate('Chat', { personId: chat.personId ?? chat.id });

  const contextIds  = new Set(conversations.map((c) => c.personId));
  const mockAsConv  = CHATS.filter((c) => !contextIds.has(c.id)).map((c) => ({
    ...c, personId: c.id, avatarColor: c.color,
  }));
  const allChats = [
    ...conversations.map((c) => ({
      ...c,
      time: new Date(c.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: c.tag === 'roommate' ? 'roommate' : 'service',
      isBinome: false,
    })),
    ...mockAsConv,
  ];

  const filteredChats = allChats.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (activeFilter === 'Roommates') return c.type === 'roommate';
    if (activeFilter === 'Property')  return c.type === 'property';
    return true;
  });

  const totalUnread = allChats.reduce((acc, c) => acc + (c.unread ?? 0), 0);

  // Animated tab indicator
  const indicatorPos = useRef(new Animated.Value(0)).current;
  const TAB_WIDTH = 100;
  const handleFilter = (f, i) => {
    setActiveFilter(f);
    Animated.spring(indicatorPos, { toValue: i * TAB_WIDTH, useNativeDriver: false, tension: 200, friction: 18 }).start();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Inbox</Text>
          {totalUnread > 0 && (
            <Text style={styles.headerSub}>{totalUnread} non lus</Text>
          )}
        </View>
        <TouchableOpacity style={styles.composeBtn}>
          <Ionicons name="create-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
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

      {/* Stories row */}
      {STORIES.length > 0 && <StoriesRow chats={STORIES} />}

      {/* Filter tabs with animated underline */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsRow}>
          {FILTERS.map((f, i) => (
            <TouchableOpacity key={f} style={[styles.tab, { width: TAB_WIDTH }]} onPress={() => handleFilter(f, i)}>
              <Text style={[styles.tabText, activeFilter === f && styles.tabTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Animated.View style={[styles.tabIndicator, { left: indicatorPos, width: TAB_WIDTH }]} />
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          requests.length > 0 ? (
            <View style={styles.requestsSection}>
              {requests.map((r) => (
                <BinomeCard
                  key={r.id}
                  request={r}
                  onAccept={(id) => setRequests((p) => p.filter((x) => x.id !== id))}
                  onDecline={(id) => setRequests((p) => p.filter((x) => x.id !== id))}
                />
              ))}
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <ChatRow item={item} onPress={handleChatPress} typing={item.id === typingId} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const ACCENT = COLORS.primary;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.line,
  },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#111', letterSpacing: -0.5 },
  headerSub:   { ...FONTS.caption, color: COLORS.primary, marginTop: 2 },
  composeBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: ACCENT, justifyContent: 'center', alignItems: 'center',
  },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.card,
    marginHorizontal: SIZES.medium, marginVertical: 10,
    borderRadius: SIZES.radius.lg, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.line,
    ...SHADOWS.xs,
  },
  searchInput: { flex: 1, ...FONTS.body1, color: COLORS.text },

  // Stories
  storiesWrap:  { paddingHorizontal: SIZES.medium, paddingBottom: SIZES.small },
  storiesLabel: { ...FONTS.caption, color: COLORS.textLight, marginBottom: 8, fontWeight: '600', textTransform: 'uppercase' },
  storiesRow:   { flexDirection: 'row', gap: 14 },
  storyItem:    { alignItems: 'center', gap: 4 },
  storyRing: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 2.5, borderColor: ACCENT,
    justifyContent: 'center', alignItems: 'center',
  },
  storyName: { fontSize: 10, color: COLORS.textLight, fontWeight: '600' },

  // Tabs
  tabsContainer: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.line },
  tabsRow:       { flexDirection: 'row' },
  tab:           { paddingVertical: 12, alignItems: 'center' },
  tabText:       { fontSize: 13, fontWeight: '600', color: COLORS.textLight },
  tabTextActive: { color: ACCENT },
  tabIndicator: {
    position: 'absolute', bottom: 0, height: 2.5,
    backgroundColor: ACCENT, borderRadius: 2,
  },

  // List
  listContent:    { paddingBottom: 20 },
  requestsSection:{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4, gap: 10 },

  // Binome card
  binomeCard: {
    backgroundColor: '#EEF0FF', borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: '#c7ccf7',
  },
  binomeHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  binomeDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: ACCENT },
  binomeLabel:  { fontSize: 10, fontWeight: '700', color: ACCENT, letterSpacing: 0.5 },
  binomeBody:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  binomeInfo:   { flex: 1 },
  binomeName:   { fontSize: 14, fontWeight: '600', color: '#111' },
  binomeSub:    { fontSize: 12, color: '#666', marginTop: 2 },
  binomeBtns:   { flexDirection: 'row', gap: 8 },
  decBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd',
    justifyContent: 'center', alignItems: 'center',
  },
  decBtnText: { fontSize: 14, color: '#999', fontWeight: '700' },
  accBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: ACCENT, justifyContent: 'center', alignItems: 'center',
  },
  accBtnText: { fontSize: 14, color: '#fff', fontWeight: '700' },

  // Chat row
  chatRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: SIZES.medium, paddingVertical: 12, gap: 12,
  },
  chatInfo: { flex: 1, minWidth: 0 },
  chatRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  chatName: { fontSize: 15, fontWeight: '600', color: '#111' },
  tagChip:  { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  tagText:  { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  chatTime: { fontSize: 11, color: '#888' },
  chatPreview:     { fontSize: 13, color: '#888', marginTop: 2 },
  chatPreviewBold: { color: '#444', fontWeight: '500' },
  unreadBadge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: ACCENT, justifyContent: 'center', alignItems: 'center',
  },
  unreadText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  separator:  { height: 1, backgroundColor: '#f5f5f5', marginLeft: 76 },
});
