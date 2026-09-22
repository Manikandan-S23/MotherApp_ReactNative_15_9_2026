import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { MainTabParamList, RootStackParamList } from "../types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Profile">,
  NativeStackScreenProps<RootStackParamList>
>;

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
}

interface SettingsRow {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  danger?: boolean;
}

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuth();

  const confirmLogout = (): void => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => logout() },
    ]);
  };

  const settingsRows: SettingsRow[] = [
    {
      icon: "notifications-outline",
      label: "Notifications",
      onPress: () => navigation.navigate("Notifications"),
    },
    {
      icon: "shield-checkmark-outline",
      label: "App Permissions",
      onPress: () => navigation.navigate("AppPermissions"),
    },
    {
      icon: "help-circle-outline",
      label: "Help & Support",
      onPress: () => navigation.navigate("HelpSupport"),
    },
    {
      icon: "information-circle-outline",
      label: "About",
      onPress: () => Alert.alert("Innotrat", "Version 1.0.0"),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>My Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <Text style={styles.name}>{user?.name || "User"}</Text>
          <Text style={styles.email}>{user?.email || "—"}</Text>
        </View>

        <Text style={styles.sectionLabel}>USER DETAILS</Text>
        <View style={styles.sectionBox}>
          <DetailRow label="Name" value={user?.name || "—"} />
          <DetailRow label="Email" value={user?.email || "—"} />
          <DetailRow label="Mobile" value={user?.mobile || "Not added"} />
        
        </View>

        <Text style={styles.sectionLabel}>SETTINGS</Text>
        <View style={styles.sectionBox}>
          {settingsRows.map((row, index) => (
            <TouchableOpacity
              key={row.label}
              style={[
                styles.settingsRow,
                index === settingsRows.length - 1 && styles.noBorder,
              ]}
              activeOpacity={0.7}
              onPress={row.onPress}
            >
              <Ionicons name={row.icon} size={19} color="#334155" />
              <Text style={styles.settingsLabel}>{row.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={confirmLogout}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.detailRow, isLast && styles.noBorder]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F6FA",paddingTop: 45 },
  container: { padding: 20, paddingTop: 15, paddingBottom: 32 },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 18,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 26,
    alignItems: "center",
    marginBottom: 22,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { color: "#FFFFFF", fontSize: 24, fontWeight: "700" },
  name: { fontSize: 17, fontWeight: "700", color: "#0F172A" },
  email: { fontSize: 13, color: "#64748B", marginTop: 2 },
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
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  detailLabel: { color: "#64748B", fontSize: 13 },
  detailValue: { color: "#0F172A", fontSize: 13, fontWeight: "600" },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  settingsLabel: { flex: 1, color: "#0F172A", fontSize: 14, fontWeight: "500" },
  noBorder: { borderBottomWidth: 0 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    paddingVertical: 14,
  },
  logoutText: { color: "#EF4444", fontWeight: "700", fontSize: 14 },
});
