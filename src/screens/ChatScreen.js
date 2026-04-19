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
} from 'react-native';

import { useConversations } from '../context/ConversationContext';

const ACCENT = '#4461F2';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Bubble ──────────────────────────────────────────────────────────────────

function Bubble({ msg }) {
  const self = msg.fromSelf;
  return (
    <View style={[styles.bubbleWrap, self ? styles.bubbleWrapRight : styles.bubbleWrapLeft]}>
      <View style={[styles.bubble, self ? styles.bubbleSelf : styles.bubbleOther]}>
        <Text style={[styles.bubbleText, self ? styles.bubbleTextSelf : styles.bubbleTextOther]}>
          {msg.text}
        </Text>
      </View>
      <Text style={[styles.bubbleTime, self ? styles.bubbleTimeRight : styles.bubbleTimeLeft]}>
        {formatTime(msg.time)}
      </Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function ChatScreen({ route, navigation }) {
  const { personId } = route.params;
  const { conversations, sendMessage, markRead } = useConversations();
  const [input, setInput] = useState('');
  const listRef = useRef(null);

  const conv = conversations.find((c) => c.personId === personId);

  // Mark read when screen opens
  useEffect(() => {
    markRead(personId);
  }, [personId, markRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (conv?.messages?.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [conv?.messages?.length]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    sendMessage(personId, text, true);
    setInput('');
  };

  if (!conv) {
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

        {/* Avatar */}
        <View style={[styles.headerAvatar, { backgroundColor: conv.bgColor }]}>
          <Text style={[styles.headerAvatarText, { color: conv.avatarColor }]}>
            {conv.initials}
          </Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{conv.name}</Text>
          {conv.tag && (
            <Text style={styles.headerTag}>
              {conv.tag === 'service' ? '🔧 Service Provider' : '🏠 Roommate'}
            </Text>
          )}
        </View>

        {/* Call shortcut */}
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="call-outline" size={20} color={ACCENT} />
        </TouchableOpacity>
      </View>

      {/* ── Messages ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={conv.messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <Bubble msg={item} />}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={[styles.emptyAvatar, { backgroundColor: conv.bgColor }]}>
                <Text style={[styles.emptyAvatarText, { color: conv.avatarColor }]}>
                  {conv.initials}
                </Text>
              </View>
              <Text style={styles.emptyName}>{conv.name}</Text>
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
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  headerAvatarText: { fontSize: 15, fontWeight: '700' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '700', color: '#111' },
  headerTag: { fontSize: 11, color: '#888', marginTop: 1 },
  headerAction: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: ACCENT + '15',
    justifyContent: 'center', alignItems: 'center',
  },

  // Messages
  messagesList: { padding: 16, paddingBottom: 8 },

  // Empty
  emptyWrap: { flex: 1, alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyAvatar: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  emptyAvatarText: { fontSize: 26, fontWeight: '700' },
  emptyName: { fontSize: 18, fontWeight: '700', color: '#111' },
  emptyHint: { fontSize: 14, color: '#888' },

  // Bubbles
  bubbleWrap: { marginBottom: 6, maxWidth: '80%' },
  bubbleWrapRight: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubbleWrapLeft: { alignSelf: 'flex-start', alignItems: 'flex-start' },

  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  bubbleSelf: {
    backgroundColor: ACCENT,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  bubbleTextSelf: { color: '#fff' },
  bubbleTextOther: { color: '#111' },

  bubbleTime: { fontSize: 10, color: '#aaa', marginTop: 3 },
  bubbleTimeRight: { marginRight: 4 },
  bubbleTimeLeft: { marginLeft: 4 },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111',
    maxHeight: 100,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: ACCENT,
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#E8E8E8' },
});
