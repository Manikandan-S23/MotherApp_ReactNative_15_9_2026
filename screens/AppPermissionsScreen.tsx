import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Device, RootStackParamList } from "../types";
import ScreenHeader from "../components/ScreenHeader";

type Props = NativeStackScreenProps<RootStackParamList, "AppPermissions">;

interface PermissionRow {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
}

const PERMISSION_ROWS: PermissionRow[] = [
  { key: "camera", icon: "camera-outline", label: "Camera", description: "Scan QR codes" },
  { key: "bluetooth", icon: "bluetooth-outline", label: "Bluetooth", description: "Connect to hardware" },
  { key: "notifications", icon: "notifications-outline", label: "Notifications", description: "Receive device alerts" },
  { key: "localNetwork", icon: "reader-outline", label: "Local Network", description: "Connect with the device" },
];

const PERMISSIONS_KEY = "appPermissions";
const DEFAULT_PERMISSIONS: Record<string, boolean> = {
  camera: true,
  bluetooth: true,
  notifications: false,
  localNetwork: true,
};

const DEVICE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  LED: "bulb-outline",
  FAN: "sync-outline",
};

export default function AppPermissionsScreen({ navigation }: Props) {
  const [device, setDevice] = useState<Device | null>(null);
  const [permissions, setPermissions] = useState<Record<string, boolean>>(DEFAULT_PERMISSIONS);

  const load = async (): Promise<void> => {
    const rawDevices = await AsyncStorage.getItem("myDevices");
    const devices: Device[] = rawDevices ? JSON.parse(rawDevices) : [];
    setDevice(devices[0] ?? null);

    const rawPerms = await AsyncStorage.getItem(PERMISSIONS_KEY);
    if (rawPerms) setPermissions(JSON.parse(rawPerms));
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const togglePermission = async (key: string): Promise<void> => {
    const next = { ...permissions, [key]: !permissions[key] };
    setPermissions(next);
    await AsyncStorage.setItem(PERMISSIONS_KEY, JSON.stringify(next));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="App Permissions"
        subtitle="Manage permissions for your connected apps"
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.appCard}>
          <View style={styles.appIconBox}>
            <Ionicons
              name={device ? DEVICE_ICONS[device.deviceType] ?? "hardware-chip-outline" : "apps-outline"}
              size={22}
              color="#2563EB"
            />
          </View>
          <View>
            <Text style={styles.appName}>{device?.name ?? "No apps connected"}</Text>
            <Text style={styles.appId}>
              {device ? device.id.toUpperCase() : "Scan a QR code to add one"}
            </Text>
          </View>
        </View>

        <View style={styles.sectionBox}>
          {PERMISSION_ROWS.map((row, index) => (
            <View
              key={row.key}
              style={[styles.row, index === PERMISSION_ROWS.length - 1 && styles.noBorder]}
            >
              <View style={styles.rowIconBox}>
                <Ionicons name={row.icon} size={18} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowDescription}>{row.description}</Text>
              </View>
              <Switch
                value={permissions[row.key]}
                onValueChange={() => togglePermission(row.key)}
                trackColor={{ false: "#E2E8F0", true: "#2563EB" }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </View>

        <Text style={styles.footnote}>
          Permissions apply to all apps in your account. Changes take effect immediately.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F6FA" },
  container: { padding: 20, paddingTop: 15, paddingBottom: 15 },
  appCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  appIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  appName: { color: "#0F172A", fontSize: 15, fontWeight: "700" },
  appId: { color: "#94A3B8", fontSize: 12, marginTop: 2 },
  sectionBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
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
  footnote: {
    color: "#94A3B8",
    fontSize: 12,
    textAlign: "center",
    marginTop: 18,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
