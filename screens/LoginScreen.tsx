import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../types";
// import logo from "../assets/iconlogo.png";



type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const PLACEHOLDER_COLOR = "#94A3B8";

export default function LoginScreen({ navigation, route }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Auto-fill credentials coming from Register / Forgot Password so the
  // person doesn't have to retype what they just entered.
  useEffect(() => {
    if (route.params?.prefillEmail) setEmail(route.params.prefillEmail);
    if (route.params?.prefillPassword) setPassword(route.params.prefillPassword);
  }, [route.params]);

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert("Missing info", "Email and password are required.");
      return;
    }
    try {
      setLoading(true);
      await login(email.trim().toLowerCase(), password);
      // navigation handled automatically by RootNavigator (user state change)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand header */}
        <View style={styles.headerBlock}>
          {/* <View style={styles.logoCircle}>
            <Ionicons name="hardware-chip-outline" size={34} color="#FFFFFF" />
          </View> */}
          <Text style={styles.brandTitle}>Innotrat</Text>
          <Text style={styles.brandSubtitle}>
            Manage and control your smart devices
          </Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <Text style={styles.fieldLabel}>Email</Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#64748B"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={PLACEHOLDER_COLOR}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={styles.fieldLabel}>Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#64748B"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={PLACEHOLDER_COLOR}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordBtn}
            onPress={() => navigation.navigate("ForgotPassword")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {loading ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>New here?</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Register")}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>Create an Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const ACCENT = "#2563EB";
const NAVY = "#0F172A";

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#F1F5F9" },
  scrollContent: { flexGrow: 1, paddingBottom: 15 },
  forgotPasswordBtn: { alignSelf: "flex-end", marginBottom: 18, marginTop: -6 },
  forgotPasswordText: { color: ACCENT, fontSize: 13, fontWeight: "600" },
  headerBlock: {
    backgroundColor: NAVY,
    paddingTop: 72,
    paddingBottom: 56,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: ACCENT,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
   logoImage: {
    width: 42,
    height: 42,
  },
  brandTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    color: "#e7ecf2",
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: -36,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#0F172A",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    marginBottom: 22,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
    marginTop: 4,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#CBD5E1",
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    backgroundColor: "#F8FAFC",
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    color: "#0F172A",
    paddingVertical: 13,
    fontSize: 15,
  },
  button: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
    shadowColor: ACCENT,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E2E8F0" },
  dividerText: {
    color: "#94A3B8",
    fontSize: 12,
    marginHorizontal: 10,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: ACCENT,
    fontWeight: "700",
    fontSize: 15,
  },
});
