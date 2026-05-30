// screens/EditPreferencesScreen.js
// Routes the user to the correct preferences editor based on their role:
//   - service providers  → ServiceCategoryScreen (edit mode)
//   - tenants / landlords → PreferencesOnboardingScreen (edit mode)

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/auth';
import PreferencesOnboardingScreen from './PreferencesOnboardingScreen';
import ServiceCategoryScreen from './ServiceCategoryScreen';
import { useTheme } from '../context/ThemeContext';

export default function EditPreferencesScreen({ navigation }) {
  const { colors } = useTheme();
  const [loading, setLoading]           = useState(true);
  const [initialPrefs, setInitialPrefs] = useState(null);
  const [role, setRole]                 = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uid = getAuth().currentUser?.uid;
        if (uid) {
          const snap = await getDoc(doc(db, 'users', uid));
          if (snap.exists()) {
            const data = snap.data();
            setRole(data.role || 'tenant');
            setInitialPrefs(data.preferences || null);
            setCurrentCategory(data.serviceCategory || null);
          }
        }
      } catch (err) {
        console.warn('Failed to load existing preferences', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  // Service providers edit their service category
  if (role === 'service') {
    return (
      <ServiceCategoryScreen
        isEditing={true}
        initialCategory={currentCategory}
        onDone={() => navigation.goBack()}
      />
    );
  }

  // Everyone else edits their tenant/landlord preferences
  return (
    <PreferencesOnboardingScreen
      isEditing={true}
      initialPrefs={initialPrefs}
      onDone={() => navigation.goBack()}
    />
  );
}
