import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendEmailVerification 
} from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initFirebase } from './config';

// Ensure Firebase is initialized
initFirebase();

const auth = getAuth();
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

export { auth };
