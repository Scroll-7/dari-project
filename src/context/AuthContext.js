import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/auth';

export const AuthContext = createContext({
  user: null,
  isLoading: true,
  hasUsername: false,
  hasPreferences: false,
  role: null,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUsername, setHasUsername] = useState(false);
  const [hasPreferences, setHasPreferences] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    let unsubscribeDoc = null;

    // Listen for Firebase Auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Clean up previous Firestore listener when auth user changes
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (firebaseUser) {
        setUser(firebaseUser);

        // Subscribe to this user's Firestore document to detect username + preferences
        unsubscribeDoc = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (snap) => {
            const data = snap.data();
            const uname = data?.username;
            setHasUsername(!!(uname && uname.trim().length > 0));
            setHasPreferences(!!(data?.hasPreferences));
            setRole(data?.role || null);
            setIsLoading(false);
          },
          () => {
            // If Firestore read fails, fall back gracefully
            setHasUsername(false);
            setHasPreferences(false);
            setRole(null);
            setIsLoading(false);
          }
        );
      } else {
        setUser(null);
        setHasUsername(false);
        setHasPreferences(false);
        setRole(null);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, hasUsername, hasPreferences, role }}>
      {children}
    </AuthContext.Provider>
  );
};
