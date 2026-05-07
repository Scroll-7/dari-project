import {
  initializeAuth,
  getReactNativePersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  getAuth,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initFirebase } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps } from 'firebase/app';

// Ensure Firebase is initialized
const app = initFirebase();

// Use AsyncStorage persistence so the auth session survives app restarts
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // initializeAuth throws if already initialized — fall back to getAuth()
  auth = getAuth(app);
}

const db = getFirestore();

/**
 * Log in an existing user
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * Register a new user, send email verification, and save extra details to Firestore
 */
export const registerUser = async (email, password, fullName) => {
  try {
    // 1. Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Send email verification
    await sendEmailVerification(user);

    // 3. Save additional user details in Firestore under the "users" collection
    await setDoc(doc(db, 'users', user.uid), {
      fullName,
      email,
      createdAt: serverTimestamp(),
      avatarUrl: null, // Placeholder for user avatars later
      role: 'user'
    });

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * Log out the current user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export { auth, db };
