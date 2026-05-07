import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// ─── Palettes ─────────────────────────────────────────────────────────────────

const LIGHT = {
  // Brand
  primary:        '#4F46E5',
  primaryOpacity: '#EEF2FF',
  secondary:      '#6366F1',
  accent:         '#F72585',
  gold:           '#F59E0B',
  teal:           '#14B8A6',
  rose:           '#FB7185',

  // Text
  text:       '#111827',
  textBody:   '#374151',
  textLight:  '#9CA3AF',
  textInverse:'#FFFFFF',

  // Surfaces
  background:  '#F9FAFB',
  card:        '#FFFFFF',
  cardAlt:     '#F3F4F6',
  white:       '#FFFFFF',
  inputBg:     '#F3F4F6',

  // Borders
  border:  '#E5E7EB',
  line:    '#F3F4F6',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error:   '#EF4444',
  whatsapp:'#25D366',

  // Glass
  glass:       'rgba(255,255,255,0.80)',
  glassBorder: 'rgba(255,255,255,0.50)',

  // Gradients (stored as arrays)
  gradientPrimary: ['#4F46E5', '#7C3AED'],
  gradientCard:    ['#667eea', '#764ba2'],
  gradientGold:    ['#F59E0B', '#EF4444'],
  gradientTeal:    ['#14B8A6', '#0EA5E9'],

  // Tab bar
  tabBar:        '#FFFFFF',
  tabBarBorder:  '#F0F0F0',

  isDark: false,
};

const DARK = {
  // Brand (same)
  primary:        '#6366F1',
  primaryOpacity: '#1E1B4B',
  secondary:      '#818CF8',
  accent:         '#F472B6',
  gold:           '#FCD34D',
  teal:           '#2DD4BF',
  rose:           '#FDA4AF',

  // Text
  text:       '#F9FAFB',
  textBody:   '#D1D5DB',
  textLight:  '#6B7280',
  textInverse:'#111827',

  // Surfaces
  background:  '#0F0F1A',
  card:        '#1A1A2E',
  cardAlt:     '#16213E',
  white:       '#1A1A2E',
  inputBg:     '#16213E',

  // Borders
  border:  '#2D2D44',
  line:    '#1F1F35',

  // Status
  success: '#4ADE80',
  warning: '#FCD34D',
  error:   '#F87171',
  whatsapp:'#25D366',

  // Glass
  glass:       'rgba(26,26,46,0.85)',
  glassBorder: 'rgba(99,102,241,0.25)',

  // Gradients
  gradientPrimary: ['#4F46E5', '#7C3AED'],
  gradientCard:    ['#1A1A2E', '#16213E'],
  gradientGold:    ['#F59E0B', '#EF4444'],
  gradientTeal:    ['#14B8A6', '#0EA5E9'],

  // Tab bar
  tabBar:       '#1A1A2E',
  tabBarBorder: '#2D2D44',

  isDark: true,
};

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext(null);

const STORAGE_KEY = '@dari_theme';

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  // Load persisted preference
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val) => { if (val === 'dark') setIsDark(true); })
      .catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light').catch(() => {});
      return next;
    });
  }, []);

  const colors = isDark ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

