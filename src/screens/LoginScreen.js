import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { loginUser } from "../firebase/auth";
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
import { COLORS, FONTS, SHADOWS, SIZES } from "../constants/theme";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      // The onAuthStateChanged listener in AuthContext will automatically 
      // navigate the user to the Main stack.
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
            Unlocking doors to your perfect home, ideal roommates, and essential services.
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
              color={COLORS.textLight}
              style={styles.inputIcon}
            />
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
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={COLORS.textLight}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.textLight}
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
                color={COLORS.textLight}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1, justifyContent: "center", padding: SIZES.large },
  headerContainer: { marginBottom: 40, alignItems: "center" },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: -0.5,
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    ...FONTS.body1,
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    paddingHorizontal: 16,
    lineHeight: 22,
    fontWeight: "400",
  },
  formContainer: {
    backgroundColor: COLORS.white,
    padding: 28,
    borderRadius: 24,
    paddingBottom: 36,
    ...SHADOWS.medium,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#475569",
    marginBottom: 10,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    marginBottom: 24,
    paddingHorizontal: 16,
    height: 54,
  },
  inputIcon: { marginRight: 12, color: "#94A3B8" },
  input: { flex: 1, height: "100%", fontSize: 15, color: "#1E293B", fontWeight: "500" },
  eyeIcon: { padding: 8 },
  forgotPassword: { alignSelf: "flex-end", marginBottom: 28 },
  forgotPasswordText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "700",
  },
  loginBtn: {
    borderRadius: 16,
    overflow: "hidden",
    ...SHADOWS.medium,
    shadowColor: COLORS.primary,
    marginBottom: 24,
  },
  loginGradient: { height: 58, justifyContent: "center", alignItems: "center" },
  loginBtnText: { fontSize: 16, color: "#FFFFFF", fontWeight: "800", letterSpacing: 0.5 },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  footerText: { fontSize: 14, color: "#64748B", fontWeight: "500" },
  signupText: { fontSize: 14, color: COLORS.primary, fontWeight: "800" },
  welcomeFooter: {
    marginTop: 16,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9", // extremely soft divider
    alignItems: "center",
    paddingHorizontal: 16,
  },
  welcomeFooterText: {
    ...FONTS.body2,
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
  },
});
