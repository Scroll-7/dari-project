import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useConversations } from "../context/ConversationContext";
import {
    FlatList,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ── Mock data ────────────────────────────────────────────────────────────────

const BINOME_REQUESTS = [
  {
    id: "br1",
    name: "Karim Aissani",
    initials: "KA",
    color: "#4B5BF5",
    bgColor: "#EEF0FF",
    major: "Computer Science student",
    sentAt: "5m ago",
  },
];

const CHATS = [
  {
    id: "c1",
    name: "Sara Benali",
    initials: "SB",
    color: "#D85A30",
    bgColor: "#FFD6CC",
    lastMessage: "Is the apartment still available?",
    time: "2m ago",
    unread: 2,
    online: true,
    isBinome: false,
    type: "property",
  },
  {
    id: "c2",
    name: "Youssef Mansour",
    initials: "YM",
    color: "#185FA5",
    bgColor: "#D6EDFF",
    lastMessage: "You: Sure, we can schedule a visit",
    time: "1h ago",
    unread: 0,
    online: false,
    isBinome: false,
    type: "roommate",
  },
  {
    id: "c3",
    name: "Rania Lakhal",
    initials: "RL",
    color: "#0F6E56",
    bgColor: "#E1F5EE",
    lastMessage: "Let's split the utilities 50/50",
    time: "Yesterday",
    unread: 0,
    online: true,
    isBinome: true,
    type: "roommate",
  },
  {
    id: "c4",
    name: "Ahmed Hamdi",
    initials: "AH",
    color: "#BA7517",
    bgColor: "#FFF0D6",
    lastMessage: "The landlord confirmed the price",
    time: "Mon",
    unread: 0,
    online: false,
    isBinome: false,
    type: "property",
  },
  {
    id: "c5",
    name: "Lina Dridi",
    initials: "LD",
    color: "#993556",
    bgColor: "#FBEAF0",
    lastMessage: "Can we meet this weekend to see the place?",
    time: "Sun",
    unread: 1,
    online: false,
    isBinome: false,
    type: "roommate",
  },
];

const FILTERS = ["All", "Roommate Requests", "Property"];

// ── Sub-components ───────────────────────────────────────────────────────────

const Avatar = ({ initials, color, bgColor, size = 46 }) => (
  <View
    style={[
      styles.avatar,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor,
      },
    ]}
  >
    <Text style={[styles.avatarText, { color, fontSize: size * 0.33 }]}>
      {initials}
    </Text>
  </View>
);

const OnlineDot = () => <View style={styles.onlineDot} />;

const UnreadBadge = ({ count }) => (
  <View style={styles.unreadBadge}>
    <Text style={styles.unreadBadgeText}>{count}</Text>
  </View>
);

// ── Context Tag ─────────────────────────────────────────────────────────────
// Resolves a colored pill label from a chat item's type & isBinome fields.

const CONTEXT_TAG_CONFIG = {
  'binome-actuel':   { label: 'Binôme actuel',     bg: '#E1F5EE', color: '#0F6E56' },
  'demande-binome':  { label: 'Demande de binôme', bg: '#EEF0FF', color: '#4B5BF5' },
  'service':         { label: 'Service',            bg: '#FFF3E0', color: '#E65100' },
  'property':        { label: 'Propriété',          bg: '#E8F4FD', color: '#0077B6' },
};

function resolveTag(item) {
  if (item.isBinome)                    return 'binome-actuel';
  if (item.type === 'service' || item.tag === 'service') return 'service';
  if (item.type === 'roommate')          return 'demande-binome';
  if (item.type === 'property')          return 'property';
  return null;
}

const ContextTag = ({ item }) => {
  const key = resolveTag(item);
  if (!key) return null;
  const { label, bg, color } = CONTEXT_TAG_CONFIG[key];
  return (
    <View style={[styles.contextTag, { backgroundColor: bg }]}>
      <Text style={[styles.contextTagText, { color }]}>{label}</Text>
    </View>
  );
};

// ── Binome Request Card ──────────────────────────────────────────────────────

const BinomeRequestCard = ({ request, onAccept, onDecline }) => (
  <View style={styles.binomeCard}>
    <View style={styles.binomeCardHeader}>
      <View style={styles.binomeDot} />
      <Text style={styles.binomeCardLabel}>Binome Request</Text>
    </View>
    <View style={styles.binomeCardBody}>
      <Avatar
        initials={request.initials}
        color={request.color}
        bgColor={request.bgColor}
        size={42}
      />
      <View style={styles.binomeCardInfo}>
        <Text style={styles.binomeCardName}>{request.name}</Text>
        <Text style={styles.binomeCardSub} numberOfLines={1}>
          Wants to be your roommate · {request.major}
        </Text>
      </View>
      <View style={styles.binomeCardActions}>
        <TouchableOpacity
          style={styles.declineBtn}
          onPress={() => onDecline(request.id)}
        >
          <Text style={styles.declineBtnText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() => onAccept(request.id)}
        >
          <Text style={styles.acceptBtnText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// ── Chat Row ─────────────────────────────────────────────────────────────────

const ChatRow = ({ item, onPress }) => (
  <TouchableOpacity style={styles.chatRow} onPress={() => onPress(item)}>
    <View style={styles.avatarWrapper}>
      <Avatar
        initials={item.initials}
        color={item.color ?? item.avatarColor}
        bgColor={item.bgColor}
        size={46}
      />
      {item.online && <OnlineDot />}
    </View>
    <View style={styles.chatInfo}>
      <View style={styles.chatRowTop}>
        <View style={styles.chatNameRow}>
          <Text style={styles.chatName} numberOfLines={1}>{item.name}</Text>
          <ContextTag item={item} />
        </View>
        <Text style={styles.chatTime}>{item.time}</Text>
      </View>
      <Text
        style={[styles.chatPreview, item.unread > 0 && styles.chatPreviewBold]}
        numberOfLines={1}
      >
        {item.lastMessage}
      </Text>
    </View>
    {item.unread > 0 && <UnreadBadge count={item.unread} />}
  </TouchableOpacity>
);

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function InboxScreen() {
  const navigation = useNavigation();
  const { conversations } = useConversations();
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState(BINOME_REQUESTS);

  const handleAccept = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDecline = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleChatPress = (chat) => {
    navigation.navigate("Chat", { personId: chat.personId ?? chat.id });
  };

  // Merge mock CHATS with live conversations from context
  // Context convs take priority (they're real). Mock ones fill in the rest.
  const contextIds = new Set(conversations.map((c) => c.personId));
  const mockAsConv = CHATS
    .filter((c) => !contextIds.has(c.id))
    .map((c) => ({
      ...c,
      personId: c.id,
      avatarColor: c.color,
      bgColor: c.bgColor,
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
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === "Roommate Requests") return c.type === "roommate";
    if (activeFilter === "Property") return c.type === "property";
    return true;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <TouchableOpacity style={styles.composeBtn}>
          {/* Compose icon */}
          <Text style={styles.composeBtnText}>✉</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterTab,
              activeFilter === f && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(f)}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === f && styles.filterTabTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          requests.length > 0 ? (
            <View style={styles.requestsSection}>
              {requests.map((r) => (
                <BinomeRequestCard
                  key={r.id}
                  request={r}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))}
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <ChatRow item={item} onPress={handleChatPress} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const ACCENT = "#4F46E5";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
    letterSpacing: -0.5,
  },
  composeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ACCENT,
    justifyContent: "center",
    alignItems: "center",
  },
  composeBtnText: {
    fontSize: 16,
    color: "#fff",
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111",
  },

  // Filters
  filtersScroll: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: "row",
  },
  filterTab: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: ACCENT,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterTabTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  // List
  listContent: {
    paddingBottom: 20,
  },
  requestsSection: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 10,
  },

  // Binome request card
  binomeCard: {
    backgroundColor: "#EEF0FF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#c7ccf7",
  },
  binomeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  binomeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT,
  },
  binomeCardLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: ACCENT,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  binomeCardBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  binomeCardInfo: {
    flex: 1,
  },
  binomeCardName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  binomeCardSub: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  binomeCardActions: {
    flexDirection: "row",
    gap: 6,
  },
  declineBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  declineBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  acceptBtn: {
    backgroundColor: ACCENT,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  acceptBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },

  // Avatar
  avatar: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontWeight: "700",
  },
  avatarWrapper: {
    position: "relative",
  },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#fff",
  },

  // Chat row
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  chatInfo: {
    flex: 1,
    minWidth: 0,
  },
  chatRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  chatName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  chatTime: {
    fontSize: 11,
    color: "#888",
    flexShrink: 0,
  },
  chatPreview: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  chatPreviewBold: {
    color: "#444",
    fontWeight: "500",
  },

  // Context tag (replaces old binomeTag)
  contextTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    flexShrink: 0,
  },
  contextTagText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Unread badge
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ACCENT,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },

  separator: {
    height: 1,
    backgroundColor: "#f5f5f5",
    marginLeft: 72,
  },
});
