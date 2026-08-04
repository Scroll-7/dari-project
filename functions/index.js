/**
 * Dari — Cloud Functions
 *
 * Sends FCM push notifications when a new chat message is written to
 * Firestore. Requires the Blaze (pay-as-you-go) plan to deploy, since
 * Cloud Functions now requires it.
 *
 * Prereqs on the app side:
 *  - `expo-notifications` installed and configured (expo config plugin +
 *    android google-services.json downloaded from Firebase console)
 *  - Each signed-in user stores their device FCM token at `users/{uid}.fcmToken`
 *
 * Deploy: `firebase deploy --only functions`
 */
const functions = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

exports.sendMessagePush = functions.onDocumentCreated(
  'conversations/{conversationId}/messages/{messageId}',
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const messageId = event.params.messageId;
    const conversationId = event.params.conversationId;
    const msg = snap.data();
    const text = (msg.text || '').toString().trim();
    if (!text) return;

    const senderId = msg.senderId;
    if (!senderId) return;

    const convSnap = await db.doc(`conversations/${conversationId}`).get();
    if (!convSnap.exists) return;
    const participants = (convSnap.data().participants || []).filter((uid) => uid && uid !== senderId);
    if (!participants.length) return;

    // Look up sender display name + recipient device tokens in parallel.
    const senderSnap = await db.doc(`users/${senderId}`).get();
    const senderName = (senderSnap.exists && (senderSnap.data().name || senderSnap.data().username)) || 'Dari';

    const tokens = [];
    const snapshots = await Promise.all(participants.map((uid) => db.doc(`users/${uid}`).get()));
    for (const u of snapshots) {
      if (!u.exists) continue;
      const token = u.data().fcmToken;
      if (typeof token === 'string' && token) tokens.push(token);
    }
    if (!tokens.length) return;

    const body = text.length > 140 ? `${text.slice(0, 140)}…` : text;

    const res = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title: senderName, body },
      data: {
        type: 'chat',
        conversationId,
        messageId,
        senderId,
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'chat',
          icon: 'ic_launcher',
        },
      },
    });

    console.log(`Sent to ${res.successCount} device(s), ${res.failureCount} failed (msg ${messageId})`);
  }
);
