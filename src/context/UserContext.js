// context/UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/auth';

const UserContext = createContext();

const EMPTY_USER = {
  name: '',
  email: '',
  phone: '',
  city: '',
  photo: null,
  username: '',
  role: 'tenant', // default to tenant
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(EMPTY_USER);
  const [loaded, setLoaded] = useState(false);

  // Load saved data on app start — keyed by Firebase uid so each account
  // has its own isolated profile, and Firestore is the source of truth.
  useEffect(() => {
    let unsubscribeDoc = null;

    const unsubscribeAuth = getAuth().onAuthStateChanged(async (firebaseUser) => {
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (!firebaseUser) {
        setUser(EMPTY_USER);
        setLoaded(true);
        return;
      }

      const uid = firebaseUser.uid;
      const storageKey = `user_profile_${uid}`;

      try {
        // Try AsyncStorage cache first for instant load
        const cached = await AsyncStorage.getItem(storageKey);
        if (cached) {
          setUser(JSON.parse(cached));
        }

        // Always sync with Firestore as source of truth in real-time
        unsubscribeDoc = onSnapshot(doc(db, 'users', uid), (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const merged = {
              name: data.fullName || data.name || '',
              email: data.email || firebaseUser.email || '',
              phone: data.phone || '',
              city: data.city || '',
              photo: data.avatarUrl || data.photo || null,
              username: data.username || '',
              role: data.role || 'tenant',
            };
            setUser(merged);
            AsyncStorage.setItem(storageKey, JSON.stringify(merged));
          }
        });
      } catch (e) {
        console.warn('UserContext load error:', e);
      }

      setLoaded(true);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  // Save whenever user changes — both AsyncStorage (cache) and Firestore
  const updateUser = async (newData) => {
    const auth = getAuth();
    const firebaseUser = auth.currentUser;
    const updated = { ...user, ...newData };
    setUser(updated);

    if (!firebaseUser) return;

    const uid = firebaseUser.uid;
    const storageKey = `user_profile_${uid}`;

    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
      // Map back to Firestore field names
      await updateDoc(doc(db, 'users', uid), {
        fullName: updated.name,
        phone: updated.phone,
        city: updated.city,
        avatarUrl: updated.photo,
        username: updated.username,
      });
    } catch (e) {
      console.warn('UserContext updateUser error:', e);
    }
  };

  if (!loaded) return null;

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);

