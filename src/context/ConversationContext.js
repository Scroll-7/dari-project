import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

// ─── Context ────────────────────────────────────────────────────────────────
// NOTE: This context ONLY backs conversations with placeholder/mock entities
// that have no real Firebase user account (mock service providers, mock
// roommates, mock property owners). All real user-to-user chat is handled by
// src/firebase/chat.js against Firestore. Conversations here are persisted
// locally so they survive app restarts.

const ConversationContext = createContext(null);

const STORAGE_KEY = '@dari_mock_conversations';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function parseInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Deterministic avatar color from name string */
const AVATAR_COLORS = [
  '#4461F2', '#E83E8C', '#20C997', '#FD7E14',
  '#6F42C1', '#FFC107', '#D85A30', '#185FA5',
];
function pickColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ConversationProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);

  // Load persisted mock conversations on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) setConversations(parsed);
          } catch (_) {}
        }
      })
      .catch(() => {})
      .finally(() => {
        loadedRef.current = true;
        setLoaded(true);
      });
  }, []);

  // Persist whenever conversations change (after initial load)
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(conversations)).catch(() => {});
  }, [conversations, loaded]);

  /**
   * Returns an existing conversation id for the given person, or creates one.
   * @param {object} person  { id, name, tag? }  where tag is 'service' | 'roommate'
   * @returns {string} conversationId
   */
  const openOrCreateConversation = useCallback((person) => {
    let existing = null;
    setConversations((prev) => {
      existing = prev.find((c) => c.personId === person.id);
      if (existing) return prev;

      const color = person.avatarColor ?? pickColor(person.name);
      const newConv = {
        id: makeId(),
        personId: person.id,
        name: person.name,
        avatar: person.avatar || null,
        initials: parseInitials(person.name),
        avatarColor: color,
        bgColor: color + '22',
        tag: person.tag ?? null,       // 'service' | 'roommate' | null
        messages: [],
        lastMessage: '',
        lastTime: new Date().toISOString(),
        unread: 0,
        online: false,
      };
      existing = newConv;
      return [newConv, ...prev];
    });

    // Return the personId used to look up the conversation later.
    return person.id;
  }, []);

  /**
   * Send a message in a conversation identified by personId.
   */
  const sendMessage = useCallback((personId, text, fromSelf = true) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.personId !== personId) return conv;
        const msg = {
          id: makeId(),
          text,
          fromSelf,
          time: new Date().toISOString(),
        };
        return {
          ...conv,
          messages: [...conv.messages, msg],
          lastMessage: fromSelf ? `You: ${text}` : text,
          lastTime: msg.time,
          unread: fromSelf ? 0 : conv.unread + 1,
        };
      })
    );
  }, []);

  /**
   * Mark all messages in a conversation as read.
   */
  const markRead = useCallback((personId) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.personId === personId ? { ...conv, unread: 0 } : conv
      )
    );
  }, []);

  /**
   * Delete a local conversation
   */
  const deleteConversation = useCallback((personId) => {
    setConversations((prev) => prev.filter((c) => c.personId !== personId));
  }, []);

  const deleteMessage = useCallback((personId, messageId) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.personId !== personId) return conv;
        const newMessages = conv.messages.filter(m => m.id !== messageId);
        const lastMsg = newMessages.length > 0 ? newMessages[newMessages.length - 1] : { text: '', time: conv.lastTime, fromSelf: false };
        return {
          ...conv,
          messages: newMessages,
          lastMessage: lastMsg.fromSelf ? `You: ${lastMsg.text}` : lastMsg.text,
          lastTime: lastMsg.time,
        };
      })
    );
  }, []);

  return (
    <ConversationContext.Provider
      value={{ conversations, openOrCreateConversation, sendMessage, markRead, deleteConversation, deleteMessage }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useConversations() {
  const ctx = useContext(ConversationContext);
  if (!ctx) throw new Error('useConversations must be used inside ConversationProvider');
  return ctx;
}
