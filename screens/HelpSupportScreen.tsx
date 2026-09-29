import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import ScreenHeader from "../components/ScreenHeader";

type Props = NativeStackScreenProps<RootStackParamList, "HelpSupport">;

interface HelpRow {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  onPress: () => void;
}

export default function HelpSupportScreen({ navigation }: Props) {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const openContactModal = (): void => setModalVisible(true);

  const closeModal = (): void => {
    if (submitting) return;
    setModalVisible(false);
    setMessage("");
  };

  const handleSubmit = (): void => {
    if (!message.trim()) return;
    setSubmitting(true);
    // Simulated submission — replace with a real support API call.
    setTimeout(() => {
      setSubmitting(false);
      setModalVisible(false);
      setMessage("");
      Alert.alert("Request Sent", "We'll get back to you within 24 hours.");
    }, 900);
  };

  const rows: HelpRow[] = [
    {
      icon: "help-circle-outline",
      label: "FAQs",
      description: "Find answers to common questions",
      onPress: () => navigation.navigate("FAQs"),
    },
    {
      icon: "play-outline",
      label: "Getting Started",
      description: "Learn how to scan, add, and control your app",
      onPress: () => navigation.navigate("FAQs"),
    },
    {
      icon: "wifi-outline",
      label: "Device Connection Help",
      description: "Troubleshoot device connection issues",
      onPress: () => navigation.navigate("FAQs"),
    },
    {
      icon: "chatbubble-outline",
      label: "Contact Support",
      description: "Get help from our support team",
      onPress: openContactModal,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Help & Support" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.sectionBox}>
          {rows.map((row, index) => (
            <TouchableOpacity
              key={row.label}
              style={[styles.row, index === rows.length - 1 && styles.noBorder]}
              activeOpacity={0.7}
              onPress={row.onPress}
            >
              <View style={styles.rowIconBox}>
                <Ionicons name={row.icon} size={18} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowDescription}>{row.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.helpCard}>
          <View style={styles.helpIconBox}>
            <Ionicons name="call-outline" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.helpTitle}>Need More Help?</Text>
          <Text style={styles.helpSubtitle}>
            Still having trouble? Our support team is here for you.
          </Text>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={openContactModal}
            activeOpacity={0.85}
          >
            <Text style={styles.helpButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Contact Support</Text>
              <TouchableOpacity
                onPress={closeModal}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={20} color="#334155" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Describe your issue and we'll get back to you within 24 hours.
            </Text>
            <Text style={styles.fieldLabel}>Your Message</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe your issue here..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={5}
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!message.trim() || submitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!message.trim() || submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F6FA" },
  container: { padding: 20, paddingTop: 15, paddingBottom: 15 },
  sectionBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  noBorder: { borderBottomWidth: 0 },
  rowIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  rowLabel: { color: "#0F172A", fontSize: 14, fontWeight: "700" },
  rowDescription: { color: "#94A3B8", fontSize: 12, marginTop: 2 },
  helpCard: {
    backgroundColor: "#2563EB",
    borderRadius: 18,
    padding: 20,
  },
  helpIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  helpTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
  helpSubtitle: { color: "#DBEAFE", fontSize: 13, marginTop: 4, lineHeight: 18 },
  helpButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 16,
  },
  helpButtonText: { color: "#2563EB", fontWeight: "700", fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  modalSubtitle: { fontSize: 13, color: "#64748B", marginBottom: 18, lineHeight: 18 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: "#334155", marginBottom: 8 },
  textArea: {
    borderWidth: 1.2,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    minHeight: 110,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  submitButtonDisabled: { backgroundColor: "#94A3B8" },
  submitButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
});
