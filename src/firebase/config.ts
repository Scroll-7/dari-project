import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBo0kbbnJBDBv-ShS1dg_BpIuMyLkrOVoI",
  authDomain: "dari-app-70704.firebaseapp.com",
  projectId: "dari-app-70704",
  storageBucket: "dari-app-70704.firebasestorage.app",
  messagingSenderId: "742100137395",
  appId: "1:742100137395:web:1dc2b159a7fe9596da87c6",
  measurementId: "G-4H3T7EJ7N9"
};

/**
 * Initialize Firebase once and return the app instance.
 * Calling this multiple times is safe — it returns the existing app.
 */
export function initFirebase() {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

/**
 * Write a test message to the `messages` collection.
 */
export async function sendTestMessage(payload: { text: string; user?: string }) {
  return await addDoc(collection(getFirestore(), 'messages'), {
    text: payload.text,
    user: payload.user ?? 'anonymous',
    createdAt: serverTimestamp(),
  });
}