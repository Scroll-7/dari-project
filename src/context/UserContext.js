// context/UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

const DEFAULT_USER = {
  name: 'Ahmed Ben Salah',
  email: 'ahmed.bensalah@gmail.com',
  phone: '+216 XX XXX XXX',
  city: 'Tunis',
  photo: null,
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_USER);
  const [loaded, setLoaded] = useState(false);

  // Load saved data on app start
  useEffect(() => {
    AsyncStorage.getItem('user_profile').then(data => {
      if (data) setUser(JSON.parse(data));
      setLoaded(true);
    });
  }, []);

  // Save whenever user changes
  const updateUser = async (newData) => {
    const updated = { ...user, ...newData };
    setUser(updated);
    await AsyncStorage.setItem('user_profile', JSON.stringify(updated));
  };

  if (!loaded) return null;

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
