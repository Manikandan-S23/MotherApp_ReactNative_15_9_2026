import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import ScreenHeader from "../components/ScreenHeader";

type Props = NativeStackScreenProps<RootStackParamList, "Notifications">;

interface ToggleRow {
  key: string;
  label: string;
  description: string;
}

const TOGGLE_ROWS: ToggleRow[] = [
  { key: "push", label: "Push Notifications", description: "Receive all app notifications" },
  { key: "device", label: "Device Alerts", description: "Alerts from connected hardware" },
  { key: "connection", label: "Connection Alerts", description: "Device connect / disconnect events" },
  { key: "updates", label: "App Updates", description: "New features and improvements" },
];

interface SupportUpdate {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  message: string;
  time: string;
}

const SUPPORT_UPDATES: SupportUpdate[] = [
  {
    icon: "chatbubble-outline",
    iconBg: "#EFF6FF",
    iconColor: "#2563EB",
    title: "Support Request Received",
    message: "Your support request has been received. We'll get back to you soon.",
    time: "Yesterday",
  },
  {
    icon: "alert-circle-outline",
    iconBg: "#FFF7ED",
    iconColor: "#F59E0B",
    title: "Support Ticket Updated",
    message: "Your support ticket has been updated. Our team is reviewing your case.",
    time: "Yesterday",
  },
  {
    icon: "checkmark-circle-outline",
    iconBg: "#ECFDF5",
    iconColor: "#16A34A",
    title: "Issue Resolved",
    message: "Your issue has been resolved. Let us know if you need anything else.",
    time: "2 days ago",
  },
];

export default function NotificationsScreen({ navigation }: Props) {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    push: true,
    device: true,
    connection: true,
    updates: false,
  });

  const toggle = (key: string): void => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionLabel}>NOTIFICATION SETTINGS</Text>
        <View style={styles.sectionBox}>
          {TOGGLE_ROWS.map((row, index) => (
            <View
              key={row.key}
              style={[styles.row, index === TOGGLE_ROWS.length - 1 && styles.noBorder]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowDescription}>{row.description}</Text>
              </View>
              <Switch
                value={toggles[row.key]}
                onValueChange={() => toggle(row.key)}
                trackColor={{ false: "#E2E8F0", true: "#2563EB" }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>SUPPORT UPDATES</Text>
        {SUPPORT_UPDATES.map((update, index) => (
          <View key={index} style={styles.updateCard}>
            <View style={[styles.updateIconBox, { backgroundColor: update.iconBg }]}>
              <Ionicons name={update.icon} size={18} color={update.iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.updateHeaderRow}>
                <Text style={styles.updateTitle}>{update.title}</Text>
                <Text style={styles.updateTime}>{update.time}</Text>
              </View>
              <Text style={styles.updateMessage}>{update.message}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F6FA" },
  container: { padding: 20, paddingTop: 15, paddingBottom: 15 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 22,
    paddingHorizontal: 16,
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
  },
  noBorder: { borderBottomWidth: 0 },
  rowLabel: { color: "#0F172A", fontSize: 14, fontWeight: "700" },
  rowDescription: { color: "#94A3B8", fontSize: 12, marginTop: 2 },
  updateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    marginBottom: 12,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  updateIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  updateHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  updateTitle: { color: "#0F172A", fontSize: 13, fontWeight: "700", flex: 1, marginRight: 8 },
  updateTime: { color: "#94A3B8", fontSize: 11 },
  updateMessage: { color: "#64748B", fontSize: 12, marginTop: 3, lineHeight: 17 },
});
