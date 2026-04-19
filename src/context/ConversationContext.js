import React, { createContext, useCallback, useContext, useState } from 'react';

// ─── Context ────────────────────────────────────────────────────────────────

const ConversationContext = createContext(null);

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

    // If existing was already found before setState call, return its id
    // Otherwise we need to grab it after state update — we'll just return person.id
    // and look up by personId in the Inbox.
    return person.id; // used as personId to find the conv
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

  return (
    <ConversationContext.Provider
      value={{ conversations, openOrCreateConversation, sendMessage, markRead }}
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
