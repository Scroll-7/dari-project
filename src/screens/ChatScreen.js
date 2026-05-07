import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { getAuth } from 'firebase/auth';

// Firebase chat utilities
import { sendMessage as fbSend, subscribeToMessages, getOrCreateConversation } from '../firebase/chat';

// Local (mock) conversation context for service providers
import { useConversations } from '../context/ConversationContext';
import { useTheme } from '../context/ThemeContext';

const ACCENT = '#4461F2';

function formatTime(ts) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

// ─── Bubble ──────────────────────────────────────────────────────────────────

function Bubble({ msg, myUid, isLocal }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  // In local mode, fromSelf is a boolean; in Firebase mode, compare senderId
  const self = isLocal ? msg.fromSelf : msg.senderId === myUid;
  const timeVal = isLocal ? msg.time : msg.createdAt;
  return (
    <View style={[styles.bubbleWrap, self ? styles.bubbleWrapRight : styles.bubbleWrapLeft]}>
      <View style={[styles.bubble, self ? styles.bubbleSelf : styles.bubbleOther]}>
        <Text style={[styles.bubbleText, self ? styles.bubbleTextSelf : styles.bubbleTextOther]}>
          {msg.text}
        </Text>
      </View>
      <Text style={[styles.bubbleTime, self ? styles.bubbleTimeRight : styles.bubbleTimeLeft]}>
        {formatTime(timeVal)}
      </Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function ChatScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const params = route.params ?? {};

  // ── LOCAL mode (service providers) ─────────────────────────────────────────
  // Triggered when navigation passes personId (from ConversationContext)
  const isLocal = !!params.personId;
  const { conversations, sendMessage: localSend, markRead } = useConversations();

  // ── FIREBASE mode (real users) ─────────────────────────────────────────────
  const { otherUid, otherName, otherUsername } = params;
  const myUid = getAuth().currentUser?.uid;

  const [conversationId, setConversationId] = useState(null);
  const [firebaseMessages, setFirebaseMessages] = useState([]);
  const [loading, setLoading] = useState(!isLocal);
  const [input, setInput] = useState('');
  const listRef = useRef(null);

  // ── Local mode setup ────────────────────────────────────────────────────────
  const localConv = isLocal ? conversations.find((c) => c.personId === params.personId) : null;

  useEffect(() => {
    if (isLocal && params.personId) markRead(params.personId);
  }, [isLocal, params.personId]);

  // ── Firebase mode setup ─────────────────────────────────────────────────────
  useEffect(() => {
    if (isLocal) return;

    if (params.conversationId) {
      setConversationId(params.conversationId);
      setLoading(false);
    } else if (myUid && otherUid) {
      getOrCreateConversation(myUid, otherUid)
        .then((id) => {
          setConversationId(id);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Chat init error:', err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [isLocal, myUid, otherUid, params.conversationId]);

  useEffect(() => {
    if (isLocal || !conversationId) return;
    const unsub = subscribeToMessages(conversationId, (msgs) => {
      setFirebaseMessages(msgs);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return unsub;
  }, [isLocal, conversationId]);

  // Scroll to bottom when local messages update
  useEffect(() => {
    if (!isLocal) return;
    if (localConv?.messages?.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [localConv?.messages?.length]);

  // ── Send handler ────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    if (isLocal) {
      localSend(params.personId, text, true);
    } else {
      if (conversationId && myUid) await fbSend(conversationId, myUid, text);
    }
  };

  // ── Derived display values ──────────────────────────────────────────────────
  const displayName = isLocal
    ? (localConv?.name ?? 'Prestataire')
    : (otherName || otherUsername || 'Utilisateur');
  const displaySub = isLocal
    ? '🔧 Service Provider'
    : (otherUsername ? `@${otherUsername}` : null);
  const avatarColor = isLocal ? (localConv?.avatarColor ?? ACCENT) : ACCENT;
  const initials = getInitials(displayName);
  const messages = isLocal ? (localConv?.messages ?? []) : firebaseMessages;

  // ── Local: handle missing conversation ─────────────────────────────────────
  if (isLocal && !localConv) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ textAlign: 'center', marginTop: 40, color: '#888' }}>
          Conversation introuvable.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>

        <View style={[styles.headerAvatar, { backgroundColor: avatarColor + '22' }]}>
          <Text style={[styles.headerAvatarText, { color: avatarColor }]}>{initials}</Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{displayName}</Text>
          {!!displaySub && <Text style={styles.headerSub}>{displaySub}</Text>}
        </View>
      </View>

      {/* ── Messages ── */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={ACCENT} size="large" />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <Bubble msg={item} myUid={myUid} isLocal={isLocal} />}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={[styles.emptyAvatar, { backgroundColor: avatarColor + '22' }]}>
                  <Text style={[styles.emptyAvatarText, { color: avatarColor }]}>{initials}</Text>
                </View>
                <Text style={styles.emptyName}>{displayName}</Text>
                <Text style={styles.emptyHint}>Démarrez la conversation 👋</Text>
              </View>
            }
          />

          {/* ── Input bar ── */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Écrire un message..."
              placeholderTextColor="#bbb"
              value={input}
              onChangeText={setInput}
              multiline
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!input.trim()}
            >
              <Ionicons name="send" size={18} color={input.trim() ? '#fff' : '#ccc'} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const getStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerAvatarText: { fontSize: 15, fontWeight: '700' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '700', color: colors.text },
  headerSub: { fontSize: 11, color: colors.textLight, marginTop: 1 },

  messagesList: { padding: 16, paddingBottom: 8 },

  emptyWrap: { flex: 1, alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyAvatar: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyAvatarText: { fontSize: 26, fontWeight: '700' },
  emptyName: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyHint: { fontSize: 14, color: colors.textLight },

  bubbleWrap: { marginBottom: 6, maxWidth: '80%' },
  bubbleWrapRight: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubbleWrapLeft: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  bubbleSelf: { backgroundColor: ACCENT, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: colors.card, borderBottomLeftRadius: 4, elevation: 1 },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  bubbleTextSelf: { color: colors.white },
  bubbleTextOther: { color: colors.text },
  bubbleTime: { fontSize: 10, color: colors.textLight, marginTop: 3 },
  bubbleTimeRight: { marginRight: 4 },
  bubbleTimeLeft: { marginLeft: 4 },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: colors.card, paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: colors.border, gap: 8,
  },
  textInput: {
    flex: 1, backgroundColor: colors.inputBg, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: colors.text, maxHeight: 100,
  },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: ACCENT, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: colors.line },
});
