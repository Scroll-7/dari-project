import { useState } from "react";
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

const BinomeTag = () => (
  <View style={styles.binomeTag}>
    <Text style={styles.binomeTagText}>BINOME</Text>
  </View>
);

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
        color={item.color}
        bgColor={item.bgColor}
        size={46}
      />
      {item.online && <OnlineDot />}
    </View>
    <View style={styles.chatInfo}>
      <View style={styles.chatRowTop}>
        <View style={styles.chatNameRow}>
          <Text style={styles.chatName}>{item.name}</Text>
          {item.isBinome && <BinomeTag />}
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
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState(BINOME_REQUESTS);

  const handleAccept = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    // TODO: update state / call API
  };

  const handleDecline = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    // TODO: update state / call API
  };

  const handleChatPress = (chat) => {
    // TODO: navigate to ChatDetailScreen
    console.log("Open chat:", chat.name);
  };

  const filteredChats = CHATS.filter((c) => {
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

const ACCENT = "#4B5BF5";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F5F4F0",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
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
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#eee",
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
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: ACCENT,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#555",
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

  // Binome tag
  binomeTag: {
    backgroundColor: "#E1F5EE",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  binomeTagText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#0F6E56",
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
