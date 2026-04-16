import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

let firestore: ReturnType<typeof getFirestore> | null = null;

/**
 * Call this once on app startup. Replace the config values with your Firebase project config.
 */
export function initFirebase() {
  if (getApps().length === 0) {
    const firebaseConfig = {
      apiKey: 'YOUR_API_KEY',
      authDomain: 'YOUR_AUTH_DOMAIN',
      projectId: 'YOUR_PROJECT_ID',
      storageBucket: 'YOUR_STORAGE_BUCKET',
      messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
      appId: 'YOUR_APP_ID',
    };
    initializeApp(firebaseConfig);
  }
  if (!firestore) {
    firestore = getFirestore();
  }
}

/**
 * Example: write a test message to a `messages` collection.
 */
export async function sendTestMessage(payload: { text: string; user?: string }) {
  if (!firestore) initFirebase();
  return await addDoc(collection(getFirestore(), 'messages'), {
    text: payload.text,
    user: payload.user ?? 'anonymous',
    createdAt: serverTimestamp(),
  });
}