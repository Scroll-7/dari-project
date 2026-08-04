import { SafeAreaView } from 'react-native-safe-area-context';
// screens/WelcomeUsernameScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase/auth';
import { FONTS, SHADOWS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export default function WelcomeUsernameScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date(2000, 0, 1));
  const [role, setRole] = useState('tenant'); // 'tenant', 'landlord', 'service'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const computeAge = (date) => {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
    return age;
  };

  // Extra fields for service providers
  const [tarif, setTarif] = useState('');
  const [phone, setPhone] = useState('');
  const [workingTime, setWorkingTime] = useState('');

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
    
    const ageNum = computeAge(birthDate);
    if (ageNum < 18 || ageNum > 100) {
      setError('You must be at least 18 years old.');
      shake();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const auth = getAuth();
      const uid = auth.currentUser?.uid;

      if (!uid) throw new Error('No authenticated user found.');

      // Persist username, age, and role in Firestore under the user's document
      const updateData = { 
        username: trimmed.toLowerCase(),
        age: ageNum,
        birthDate: birthDate.toISOString(),
        role: role,
      };

      if (role === 'service') {
        if (!tarif.trim() || !phone.trim() || !workingTime.trim()) {
          setIsLoading(false);
          setError('Veuillez remplir tous les champs du prestataire.');
          shake();
          return;
        }

        // Validate workingTime format (e.g., 8-19)
        const timeRegex = /^([0-9]|1[0-9]|2[0-3])-([0-9]|1[0-9]|2[0-3])$/;
        if (!timeRegex.test(workingTime.trim())) {
          setIsLoading(false);
          setError('Horaires invalides. Utilisez le format "8-19" (0 à 23).');
          shake();
          return;
        }

        updateData.tarif = tarif.trim();
        updateData.phone = phone.trim();
        updateData.workingTime = workingTime.trim();
      }

      await updateDoc(doc(db, 'users', uid), updateData);

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
        <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
          {/* Top illustration / icon */}
          <LinearGradient
            colors={[colors.primary, colors.secondary || '#6C63FF']}
            style={styles.iconCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="person" size={48} color={colors.white} />
          </LinearGradient>

          {/* Heading */}
          <Text style={styles.title}>Welcome To Dari!</Text>
          <Text style={styles.subtitle}>
            Choose a username so others can find and recognise you.
          </Text>

          {/* Inputs */}
          <Animated.View
            style={[styles.inputWrap, { transform: [{ translateX: shakeAnim }] }]}
          >
            <Ionicons
              name="at-outline"
              size={20}
              color={colors.textLight}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor={colors.textLight}
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                if (error) setError('');
              }}
              returnKeyType="next"
            />
          </Animated.View>

          {/* Date of Birth Picker */}
          <TouchableOpacity
            style={styles.inputWrap}
            onPress={() => {
              setTempDate(birthDate);
              setShowDatePicker(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.textLight}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.input, { color: birthDate ? colors.text : colors.textLight, paddingVertical: 0, lineHeight: 54 }]}>
              {birthDate
                ? `${birthDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} (${computeAge(birthDate)} ans)`
                : 'Date de naissance'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.textLight} />
          </TouchableOpacity>

          {/* Date Picker — Android: native dialog, iOS: bottom-sheet modal */}
          {Platform.OS === 'android' && showDatePicker && (
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (event.type === 'set' && selectedDate) {
                  setBirthDate(selectedDate);
                  if (error) setError('');
                }
              }}
              maximumDate={new Date()}
              minimumDate={new Date(1924, 0, 1)}
            />
          )}

          {Platform.OS === 'ios' && (
            <Modal
              visible={showDatePicker}
              transparent
              animationType="slide"
              onRequestClose={() => setShowDatePicker(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowDatePicker(false)}
              />
              <View style={styles.pickerModal}>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={[styles.pickerAction, { color: colors.textLight }]}>Annuler</Text>
                  </TouchableOpacity>
                  <Text style={styles.pickerTitle}>Date de naissance</Text>
                  <TouchableOpacity onPress={() => {
                    setBirthDate(tempDate);
                    if (error) setError('');
                    setShowDatePicker(false);
                  }}>
                    <Text style={[styles.pickerAction, { color: colors.primary }]}>Confirmer</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) setTempDate(selectedDate);
                  }}
                  maximumDate={new Date()}
                  minimumDate={new Date(1924, 0, 1)}
                  style={{ width: '100%' }}
                />
              </View>
            </Modal>
          )}

          {/* Role Selection */}
          <Text style={styles.sectionLabel}>Je suis :</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[styles.roleCard, role === 'tenant' && styles.roleCardActive]}
              onPress={() => setRole('tenant')}
              activeOpacity={0.8}
            >
              <Ionicons name="search" size={24} color={role === 'tenant' ? colors.primary : colors.textLight} />
              <Text style={[styles.roleText, role === 'tenant' && styles.roleTextActive]}>Chercheur</Text>
              <Text style={styles.roleSubtext}>Je cherche un bien</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.roleCard, role === 'landlord' && styles.roleCardActive]}
              onPress={() => setRole('landlord')}
              activeOpacity={0.8}
            >
              <Ionicons name="home" size={24} color={role === 'landlord' ? colors.primary : colors.textLight} />
              <Text style={[styles.roleText, role === 'landlord' && styles.roleTextActive]}>Propriétaire</Text>
              <Text style={styles.roleSubtext}>Je propose un bien</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.roleCard, role === 'service' && styles.roleCardActive]}
              onPress={() => setRole('service')}
              activeOpacity={0.8}
            >
              <Ionicons name="construct" size={24} color={role === 'service' ? colors.primary : colors.textLight} />
              <Text style={[styles.roleText, role === 'service' && styles.roleTextActive]}>Prestataire</Text>
              <Text style={styles.roleSubtext}>Je propose mes services</Text>
            </TouchableOpacity>
          </View>

          {role === 'service' && (
            <View style={{ width: '100%', marginBottom: 16 }}>
              <View style={[styles.inputWrap, { height: 48, marginBottom: 8 }]}>
                <Ionicons name="pricetag-outline" size={18} color={colors.textLight} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Tarif (en DT)"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                  value={tarif}
                  onChangeText={(text) => setTarif(text.replace(/[^0-9]/g, ''))}
                />
              </View>
              <View style={[styles.inputWrap, { height: 48, marginBottom: 8 }]}>
                <Ionicons name="logo-whatsapp" size={18} color={colors.textLight} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Numéro WhatsApp"
                  placeholderTextColor={colors.textLight}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
                />
              </View>
              <View style={[styles.inputWrap, { height: 48 }]}>
                <Ionicons name="time-outline" size={18} color={colors.textLight} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Horaires de travail (ex: 8-19)"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numbers-and-punctuation"
                  value={workingTime}
                  onChangeText={(text) => setWorkingTime(text.replace(/[^0-9-]/g, ''))}
                />
              </View>
            </View>
          )}

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {/* CTA */}
          <TouchableOpacity
            style={styles.btn}
            onPress={handleContinue}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary || '#6C63FF']}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.btnText}>
                {isLoading ? 'Saving…' : 'Continue'}
              </Text>
              {!isLoading && (
                <Ionicons name="arrow-forward" size={18} color={colors.white} style={{ marginLeft: 8 }} />
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.hint}>
            You can always change this later in Settings.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flexGrow: 1,
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
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...FONTS.body1,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card || colors.white,
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
    color: colors.text,
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
    color: colors.text,
    alignSelf: 'flex-start',
    marginTop: SIZES.large,
    marginBottom: SIZES.small,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SIZES.medium,
    width: '100%',
  },
  roleCard: {
    flex: 1,
    backgroundColor: colors.card || colors.white,
    borderRadius: 14,
    padding: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryOpacity || '#F0F0FF',
  },
  roleText: {
    ...FONTS.h3,
    fontSize: 12,
    color: colors.textLight,
    marginTop: 8,
    marginBottom: 2,
  },
  roleTextActive: {
    color: colors.primary,
  },
  roleSubtext: {
    fontSize: 9,
    color: colors.textLight,
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
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  hint: {
    marginTop: 20,
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  pickerModal: {
    backgroundColor: colors.card || colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
    paddingHorizontal: 16,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border || '#e8e8e8',
    marginBottom: 4,
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  pickerAction: {
    fontSize: 15,
    fontWeight: '600',
  },
});
