import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { registerUser } from "../firebase/auth";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { FONTS, SHADOWS, SIZES } from "../constants/theme";
import { useTheme } from '../context/ThemeContext';

export default function SignupScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    // Basic length check
    if (password.length < 6) {
      setErrorMessage("Password should be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const { user, error } = await registerUser(email, password, fullName);

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
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Join dari</Text>
            <Text style={styles.subtitle}>
              Create an account to start finding your perfect home or roommate.
            </Text>
          </View>

          <View style={styles.formContainer}>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textLight}
                autoCapitalize="words"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

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
                placeholder="Create a password"
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

            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={colors.textLight}
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity style={styles.loginBtn} onPress={handleSignup}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.loginGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.loginBtnText}>
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginText}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: SIZES.large, paddingVertical: SIZES.xxl },
  headerContainer: { marginBottom: SIZES.xl, alignItems: "center" },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: colors.primary,
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    ...FONTS.body1,
    color: colors.textLight,
    textAlign: "center",
    paddingHorizontal: SIZES.large,
  },
  formContainer: {
    backgroundColor: colors.card,
    padding: SIZES.large,
    borderRadius: 24,
    ...SHADOWS.medium,
  },
  errorText: {
    color: colors.error,
    marginBottom: SIZES.medium,
    textAlign: 'center',
    fontWeight: '600',
  },
  inputLabel: { ...FONTS.h3, color: colors.text, marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: SIZES.medium,
    paddingHorizontal: SIZES.small,
    height: 50,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: "100%", ...FONTS.body1, color: colors.text },
  eyeIcon: { padding: 8 },
  loginBtn: {
    borderRadius: 16,
    overflow: "hidden",
    ...SHADOWS.medium,
    marginTop: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  loginGradient: { height: 56, justifyContent: "center", alignItems: "center" },
  loginBtnText: { ...FONTS.h3, color: colors.white, fontWeight: "bold" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SIZES.xxl,
  },
  footerText: { ...FONTS.body1, color: colors.textLight },
  loginText: { ...FONTS.body1, color: colors.primary, fontWeight: "bold" },
});
