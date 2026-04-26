import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const FavoritesContext = createContext(null);

const STORAGE_KEY = '@dari_favorites';

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(new Set());
  const [loaded, setLoaded] = useState(false);

  // Load from storage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const ids = JSON.parse(raw);
          setFavorites(new Set(ids));
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const persist = useCallback((set) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...set])).catch(() => {});
  }, []);

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      persist(next);
      return next;
    });
  }, [persist]);

  const isFavorite = useCallback((id) => favorites.has(id), [favorites]);

  const getFavoriteIds = useCallback(() => [...favorites], [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, getFavoriteIds, loaded }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
}
