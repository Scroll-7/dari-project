import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FONTS, SHADOWS, SIZES } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { loginUser } from "../firebase/auth";

const STORAGE_KEY = "@dari_saved_creds";

export default function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);

  // ── Load saved credentials on mount ──────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const { savedEmail, savedPassword } = JSON.parse(raw);
          setEmail(savedEmail || "");
          setPassword(savedPassword || "");
          setStaySignedIn(true);
        }
      } catch (_) {}
    })();
  }, []);

  // ── Login ─────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const { user, error } = await loginUser(email, password);

    setIsLoading(false);

    if (error) {
      setErrorMessage(error);
    } else if (user) {
      // Save or clear credentials based on checkbox
      if (staySignedIn) {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ savedEmail: email, savedPassword: password }),
        );
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
      // onAuthStateChanged in AuthContext handles navigation automatically
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome To Dari !</Text>
          <Text style={styles.subtitle}>
            Unlocking doors to your perfect home, ideal roommates, and essential
            services.
          </Text>
        </View>

        <View style={styles.formContainer}>
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={colors.textLight}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.textLight}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={colors.textLight}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={colors.textLight}
              />
            </TouchableOpacity>
          </View>

          {/* ── Stay signed in + Forgot Password row ───────────── */}
          <View style={styles.optionsRow}>
            {/* Checkbox */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setStaySignedIn(!staySignedIn)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  staySignedIn && styles.checkboxChecked,
                ]}
              >
                {staySignedIn && (
                  <Ionicons name="checkmark" size={12} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Stay signed in</Text>
            </TouchableOpacity>

            {/* Forgot password */}
            <TouchableOpacity>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.loginGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.loginBtnText}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.welcomeFooter}>
            <Text style={styles.welcomeFooterText}>
              Welcome! Please enter your details to find your next home.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.signupText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    keyboardView: { flex: 1, justifyContent: "center", padding: SIZES.large },
    headerContainer: { marginBottom: 40, alignItems: "center" },
    title: {
      fontSize: 34,
      fontWeight: "800",
      color: colors.primary,
      letterSpacing: -0.5,
      marginBottom: 16,
      textAlign: "center",
    },
    subtitle: {
      ...FONTS.body1,
      fontSize: 15,
      color: colors.textLight,
      textAlign: "center",
      paddingHorizontal: 16,
      lineHeight: 22,
      fontWeight: "400",
    },
    formContainer: {
      backgroundColor: colors.card,
      padding: 28,
      borderRadius: 24,
      paddingBottom: 36,
      ...SHADOWS.medium,
    },
    errorText: {
      color: colors.error,
      marginBottom: 20,
      textAlign: "center",
      fontWeight: "600",
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: colors.textLight,
      marginBottom: 10,
      marginLeft: 4,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      marginBottom: 24,
      paddingHorizontal: 16,
      height: 54,
    },
    inputIcon: { marginRight: 12, color: colors.textLight },
    input: {
      flex: 1,
      height: "100%",
      fontSize: 15,
      color: colors.text,
      fontWeight: "500",
    },
    eyeIcon: { padding: 8 },

    // ── Options row (checkbox + forgot) ─────────────────────────
    optionsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 28,
    },
    checkboxRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkboxLabel: {
      fontSize: 13,
      color: colors.textBody,
      fontWeight: "500",
    },
    forgotPasswordText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: "700",
    },

    loginBtn: {
      borderRadius: 16,
      overflow: "hidden",
      ...SHADOWS.medium,
      shadowColor: colors.primary,
      marginBottom: 24,
    },
    loginGradient: {
      height: 58,
      justifyContent: "center",
      alignItems: "center",
    },
    loginBtnText: {
      fontSize: 16,
      color: colors.white,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 32,
    },
    footerText: { fontSize: 14, color: colors.textLight, fontWeight: "500" },
    signupText: { fontSize: 14, color: colors.primary, fontWeight: "800" },
    welcomeFooter: {
      marginTop: 16,
      paddingTop: 24,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      alignItems: "center",
      paddingHorizontal: 16,
    },
    welcomeFooterText: {
      ...FONTS.body2,
      fontSize: 14,
      color: colors.textLight,
      textAlign: "center",
      lineHeight: 22,
      fontStyle: "italic",
    },
  });
