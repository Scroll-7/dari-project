// screens/WelcomeUsernameScreen.js
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase/auth';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';

export default function WelcomeUsernameScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('tenant'); // 'tenant' or 'landlord'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Subtle shake animation for error
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleContinue = async () => {
    const trimmed = username.trim();

    if (!trimmed) {
      setError('Please enter a username.');
      shake();
      return;
    }
    if (trimmed.length < 3) {
      setError('Username must be at least 3 characters.');
      shake();
      return;
    }
    if (trimmed.length > 30) {
      setError('Username must be 30 characters or fewer.');
      shake();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const auth = getAuth();
      const uid = auth.currentUser?.uid;

      if (!uid) throw new Error('No authenticated user found.');

      // Persist username and role in Firestore under the user's document
      await updateDoc(doc(db, 'users', uid), { 
        username: trimmed.toLowerCase(),
        role: role,
      });

      // Navigation is automatic: once Firestore writes `username`,
      // AuthContext's onSnapshot fires → hasUsername becomes true →
      // AppNavigator swaps to the fully-authenticated stack automatically.
    } catch (err) {
      setError('Could not save username. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.inner}>
          {/* Top illustration / icon */}
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary || '#6C63FF']}
            style={styles.iconCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="person" size={48} color="#fff" />
          </LinearGradient>

          {/* Heading */}
          <Text style={styles.title}>Welcome To Dari!</Text>
          <Text style={styles.subtitle}>
            Choose a username so others can find and recognise you.
          </Text>

          {/* Input */}
          <Animated.View
            style={[styles.inputWrap, { transform: [{ translateX: shakeAnim }] }]}
          >
            <Ionicons
              name="at-outline"
              size={20}
              color={COLORS.textLight}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor={COLORS.textLight}
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                if (error) setError('');
              }}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </Animated.View>

          {/* Role Selection */}
          <Text style={styles.sectionLabel}>Je suis :</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[styles.roleCard, role === 'tenant' && styles.roleCardActive]}
              onPress={() => setRole('tenant')}
              activeOpacity={0.8}
            >
              <Ionicons name="search" size={24} color={role === 'tenant' ? COLORS.primary : COLORS.textLight} />
              <Text style={[styles.roleText, role === 'tenant' && styles.roleTextActive]}>Chercheur</Text>
              <Text style={styles.roleSubtext}>Je cherche un bien ou coloc</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.roleCard, role === 'landlord' && styles.roleCardActive]}
              onPress={() => setRole('landlord')}
              activeOpacity={0.8}
            >
              <Ionicons name="home" size={24} color={role === 'landlord' ? COLORS.primary : COLORS.textLight} />
              <Text style={[styles.roleText, role === 'landlord' && styles.roleTextActive]}>Propriétaire</Text>
              <Text style={styles.roleSubtext}>Je propose un bien</Text>
            </TouchableOpacity>
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {/* CTA */}
          <TouchableOpacity
            style={styles.btn}
            onPress={handleContinue}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary || '#6C63FF']}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.btnText}>
                {isLoading ? 'Saving…' : 'Continue'}
              </Text>
              {!isLoading && (
                <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.hint}>
            You can always change this later in Settings.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.large,
    paddingVertical: SIZES.xxl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...FONTS.body1,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white || '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    width: '100%',
    marginBottom: 8,
    ...SHADOWS.small,
  },
  input: {
    flex: 1,
    height: '100%',
    ...FONTS.body1,
    color: COLORS.text,
    fontSize: 16,
  },
  errorText: {
    color: '#E53935',
    fontSize: 13,
    marginBottom: 12,
    alignSelf: 'flex-start',
    fontWeight: '500',
  },
  sectionLabel: {
    ...FONTS.h3,
    color: COLORS.text,
    alignSelf: 'flex-start',
    marginTop: SIZES.large,
    marginBottom: SIZES.small,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SIZES.medium,
    width: '100%',
  },
  roleCard: {
    flex: 1,
    backgroundColor: COLORS.card || '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  roleCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryOpacity || '#F0F0FF',
  },
  roleText: {
    ...FONTS.h3,
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
    marginBottom: 4,
  },
  roleTextActive: {
    color: COLORS.primary,
  },
  roleSubtext: {
    fontSize: 10,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  btn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 12,
    ...SHADOWS.medium,
  },
  btnGradient: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    ...FONTS.h3,
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  hint: {
    marginTop: 20,
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});
