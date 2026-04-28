import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';

const db = getFirestore();

// ─── Conversation ID helper ───────────────────────────────────────────────────
// Always the same regardless of who initiates the chat (sorted UIDs joined by '_')
export function getConversationId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

// ─── Get or create a conversation between two users ──────────────────────────
export async function getOrCreateConversation(currentUid, otherUid) {
  const convId = getConversationId(currentUid, otherUid);
  const convRef = doc(db, 'conversations', convId);
  const snap = await getDoc(convRef);

  if (!snap.exists()) {
    await setDoc(convRef, {
      participants: [currentUid, otherUid],
      createdAt: serverTimestamp(),
      lastMessage: '',
      lastSenderId: '',
      lastTime: serverTimestamp(),
    });
  }

  return convId;
}

// ─── Send a message ───────────────────────────────────────────────────────────
export async function sendMessage(conversationId, senderUid, text) {
  const msgRef = collection(db, 'conversations', conversationId, 'messages');
  await addDoc(msgRef, {
    text,
    senderId: senderUid,
    createdAt: serverTimestamp(),
  });

  // Update conversation metadata
  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessage: text,
    lastSenderId: senderUid,
    lastTime: serverTimestamp(),
  });
}

// ─── Subscribe to messages in a conversation (real-time) ─────────────────────
export function subscribeToMessages(conversationId, callback) {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(msgs);
  });
}

// ─── Subscribe to all conversations for a user (real-time) ───────────────────
export function subscribeToConversations(uid, callback) {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', uid)
  );
  return onSnapshot(q, async (snap) => {
    const convs = await Promise.all(
      snap.docs.map(async (d) => {
        const data = d.data();
        const otherUid = data.participants.find((p) => p !== uid);
        // Fetch the other user's profile
        let otherUser = { username: 'Utilisateur', fullName: '' };
        try {
          const userSnap = await getDoc(doc(db, 'users', otherUid));
          if (userSnap.exists()) otherUser = userSnap.data();
        } catch (_) {}

        return {
          id: d.id,
          otherUid,
          otherName: otherUser.fullName || otherUser.username || 'Utilisateur',
          otherUsername: otherUser.username || '',
          lastMessage: data.lastMessage || '',
          lastTime: data.lastTime?.toDate?.() ?? null,
          participants: data.participants,
        };
      })
    );
    // Sort by most recent
    convs.sort((a, b) => (b.lastTime ?? 0) - (a.lastTime ?? 0));
    callback(convs);
  });
}

// ─── Search users by username ─────────────────────────────────────────────────
export async function searchUsersByUsername(searchText) {
  if (!searchText.trim()) return [];
  const q = query(
    collection(db, 'users'),
    where('username', '>=', searchText.toLowerCase()),
    where('username', '<=', searchText.toLowerCase() + '\uf8ff')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

// ─── Get all users (for "New Chat" user list) ────────────────────────────────
export async function getAllUsers(excludeUid) {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs
    .map((d) => ({ uid: d.id, ...d.data() }))
    .filter((u) => u.uid !== excludeUid);
}
