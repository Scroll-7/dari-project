import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

let firestore: ReturnType<typeof getFirestore> | null = null;

/**
 * Call this once on app startup. Replace the config values with your Firebase project config.
 */
export function initFirebase() {
  if (getApps().length === 0) {
    const firebaseConfig = {
      apiKey: "AIzaSyBo0kbbnJBDBv-ShS1dg_BpIuMyLkrOVoI",
      authDomain: "dari-app-70704.firebaseapp.com",
      projectId: "dari-app-70704",
      storageBucket: "dari-app-70704.firebasestorage.app",
      messagingSenderId: "742100137395",
      appId: "1:742100137395:web:1dc2b159a7fe9596da87c6",
      measurementId: "G-4H3T7EJ7N9"
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