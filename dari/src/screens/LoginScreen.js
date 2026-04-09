import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // Navigate to the Main Tab interface
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>dari</Text>
          <Text style={styles.subtitle}>Welcome back! Please enter your details to find your next home.</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.textLight}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.loginGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.loginBtnText}>Sign In</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.socialContainer}>
            <View style={styles.divider} />
            <Text style={styles.socialText}>Or continue with</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.googleBtn}>
            <Ionicons name="logo-google" size={20} color={COLORS.text} style={{ marginRight: 10 }} />
            <Text style={styles.googleBtnText}>Sign in with Google</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <TouchableOpacity>
            <Text style={styles.signupText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1, justifyContent: 'center', padding: SIZES.large },
  headerContainer: { marginBottom: SIZES.xxl, alignItems: 'center' },
  title: { fontSize: 48, fontWeight: 'bold', color: COLORS.primary, letterSpacing: -1, marginBottom: 8 },
  subtitle: { ...FONTS.body1, color: COLORS.textLight, textAlign: 'center', paddingHorizontal: SIZES.large },
  formContainer: { backgroundColor: COLORS.white, padding: SIZES.large, borderRadius: 24, ...SHADOWS.medium },
  inputLabel: { ...FONTS.h3, color: COLORS.text, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 12, marginBottom: SIZES.medium, paddingHorizontal: SIZES.small, height: 50 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: '100%', ...FONTS.body1, color: COLORS.text },
  eyeIcon: { padding: 8 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: SIZES.xl },
  forgotPasswordText: { ...FONTS.body2, color: COLORS.primary, fontWeight: '600' },
  loginBtn: { borderRadius: 16, overflow: 'hidden', ...SHADOWS.medium, marginBottom: SIZES.xl },
  loginGradient: { height: 56, justifyContent: 'center', alignItems: 'center' },
  loginBtnText: { ...FONTS.h3, color: COLORS.white, fontWeight: 'bold' },
  socialContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.xl },
  divider: { flex: 1, height: 1, backgroundColor: COLORS.textLight, opacity: 0.2 },
  socialText: { paddingHorizontal: 16, ...FONTS.body2, color: COLORS.textLight },
  googleBtn: { flexDirection: 'row', height: 56, backgroundColor: COLORS.white, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  googleBtnText: { ...FONTS.h3, color: COLORS.text, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SIZES.xxl },
  footerText: { ...FONTS.body1, color: COLORS.textLight },
  signupText: { ...FONTS.body1, color: COLORS.primary, fontWeight: 'bold' },
});
