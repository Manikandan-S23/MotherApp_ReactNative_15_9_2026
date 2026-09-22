import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import ScreenHeader from "../components/ScreenHeader";

type Props = NativeStackScreenProps<RootStackParamList, "FAQs">;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How do I add a new app?",
    answer:
      'Tap the "Scan QR" button on the Home screen or open the Scanner tab. Point your camera at the QR code provided with your device or project. Once scanned, your app is added to My Apps automatically.',
  },
  {
    question: "How do I access my connected apps?",
    answer:
      "Open the Home tab to see every app you have added, along with its current connection status.",
  },
  {
    question: "How do I control my connected device?",
    answer:
      "Tap an app on the Home screen to open its control panel, where you can turn it on or off and adjust its settings.",
  },
  {
    question: "Why is my device not connecting?",
    answer:
      "Check that the device is powered on and within range, then confirm Bluetooth and Local Network permissions are enabled in App Permissions.",
  },
  {
    question: "How do I scan a QR code?",
    answer:
      'Open the Scanner tab, tap "Start Scanning", and point your camera at the code. You can also enter a URL manually if a camera isn\'t handy.',
  },
  {
    question: "Can I add multiple apps?",
    answer:
      "Yes. Scan or enter as many devices or projects as you like — they'll all appear on your Home screen.",
  },
  {
    question: "How do I reset my password?",
    answer:
      'Tap "Forgot Password?" on the login screen, confirm your email, then choose a new password.',
  },
  {
    question: "Can I turn off notifications?",
    answer:
      "Yes, go to Profile > Notifications and toggle off any alerts you don't want to receive.",
  },
  {
    question: "Is my data stored securely?",
    answer:
      "Your account and device data are stored locally on your device and are never shared without your permission.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Go to Profile > Help & Support > Contact Support, describe your issue, and our team will respond within 24 hours.",
  },
];

export default function FAQScreen({ navigation }: Props) {
  const [search, setSearch] = useState<string>("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleItem = (index: number): void => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const filtered = FAQ_ITEMS.filter((item) =>
    item.question.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="FAQs" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search FAQs"
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <Text style={styles.countLabel}>{filtered.length} questions</Text>

        {filtered.map((item) => {
          const originalIndex = FAQ_ITEMS.indexOf(item);
          const isOpen = expandedIndex === originalIndex;
          return (
            <TouchableOpacity
              key={item.question}
              style={[styles.faqCard, isOpen && styles.faqCardActive]}
              activeOpacity={0.85}
              onPress={() => toggleItem(originalIndex)}
            >
              <View style={styles.faqHeaderRow}>
                <View style={styles.numberBadge}>
                  <Text style={styles.numberBadgeText}>{originalIndex + 1}</Text>
                </View>
                <Text style={styles.faqQuestion}>{item.question}</Text>
              </View>
              {isOpen && (
                <>
                  <View style={styles.faqDivider} />
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const ACCENT = "#2563EB";

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { padding: 20, paddingTop: 15, paddingBottom: 15 },
  searchWrap: { marginBottom: 16 },
  searchInput: {
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  countLabel: { color: "#94A3B8", fontSize: 12, marginBottom: 12 },
  faqCard: {
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  faqCardActive: { borderColor: ACCENT },
  faqHeaderRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ACCENT,
    justifyContent: "center",
    alignItems: "center",
  },
  numberBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  faqQuestion: { flex: 1, color: "#0F172A", fontSize: 14, fontWeight: "700" },
  faqDivider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 12 },
  faqAnswer: { color: "#64748B", fontSize: 13, lineHeight: 20 },
});
