import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

const PLACEHOLDER_COLOR = "#94A3B8";

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { resetPassword } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleContinue = (): void => {
    if (!email.trim()) {
      Alert.alert("Email required", "Please enter the email on your account.");
      return;
    }
    setStep(2);
  };

  const handleReset = async (): Promise<void> => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Missing info", "Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Passwords don't match",
        "Please make sure both passwords are the same."
      );
      return;
    }
    try {
      setLoading(true);
      const cleanEmail = email.trim().toLowerCase();
      await resetPassword(cleanEmail, newPassword);
      Alert.alert(
        "Password Reset",
        "Your password has been updated. Please log in.",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("Login", {
                prefillEmail: cleanEmail,
                prefillPassword: newPassword,
              }),
          },
        ]
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      Alert.alert("Reset Failed", message);
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
        <View style={styles.headerBlock}>
          <View style={styles.logoCircle}>
            <Ionicons name="key-outline" size={30} color="#FFFFFF" />
          </View>
          <Text style={styles.brandTitle}>Reset Password</Text>
          <Text style={styles.brandSubtitle}>
            {step === 1
              ? "Enter your account email to continue"
              : "Choose a new password for your account"}
          </Text>
        </View>

        <View style={styles.card}>
          {step === 1 ? (
            <>
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

              <TouchableOpacity
                style={styles.button}
                onPress={handleContinue}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.fieldLabel}>New Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#64748B"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
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

              <Text style={styles.fieldLabel}>Confirm Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#64748B"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter new password"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleReset}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Updating..." : "Reset Password"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>Back to Login</Text>
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
  brandTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    color: "#94A3B8",
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 40,
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
  input: { flex: 1, color: "#0F172A", paddingVertical: 13, fontSize: 15 },
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
  buttonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  secondaryButtonText: { color: ACCENT, fontWeight: "700", fontSize: 15 },
});
