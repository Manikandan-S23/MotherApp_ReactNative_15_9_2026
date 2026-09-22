import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { Device, MainTabParamList, RootStackParamList } from "../types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

// Icon per device type - purely for the dashboard list preview
const DEVICE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  LED: "bulb-outline",
  FAN: "sync-outline",
};

export default function DashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);

  const loadDevices = async (): Promise<void> => {
    const raw = await AsyncStorage.getItem("myDevices");
    setDevices(raw ? (JSON.parse(raw) as Device[]) : []);
  };

  // Refresh device list every time Dashboard comes into focus
  // (e.g. after scanning + saving a new device)
  useFocusEffect(
    useCallback(() => {
      loadDevices();
    }, [])
  );

  const openDevice = (device: Device): void => {
    navigation.navigate("DeviceControl", { device });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>
              Hello, {user?.name?.split(" ")[0] || "there"} 👋
            </Text>
            <Text style={styles.subtitle}>Manage and control your apps</Text>
          </View>
        </View>

        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListHeaderComponent={
            <>
              <TouchableOpacity
                style={styles.scanBanner}
                activeOpacity={0.9}
                onPress={() => navigation.navigate("Scanner")}
              >
                <View style={styles.scanIconBox}>
                  <Ionicons name="qr-code-outline" size={26} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scanTitle}>Scan &amp; Get Your App Here</Text>
                  <Text style={styles.scanSubtitle}>
                    Scan the QR code to quickly add your app to your
                    collection.
                  </Text>
                  <View style={styles.scanButton}>
                    <Text style={styles.scanButtonText}>Scan QR</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>My Apps</Text>
              <Text style={styles.sectionSubtitle}>Your connected projects</Text>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="cube-outline" size={28} color="#94A3B8" />
              <Text style={styles.emptyText}>
                No devices added yet. Tap “Scan QR Code” above to add a
                device.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.deviceCard}
              onPress={() => openDevice(item)}
              activeOpacity={0.85}
            >
              <View style={styles.deviceIconBox}>
                <Ionicons
                  name={DEVICE_ICONS[item.deviceType] ?? "hardware-chip-outline"}
                  size={22}
                  color="#2563EB"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.deviceName}>{item.name}</Text>
                <Text style={styles.deviceId}>{item.id.toUpperCase()}</Text>
                <View style={styles.statusRow}>
                  <Ionicons
                    name="wifi"
                    size={12}
                    color={item.status ? "#16A34A" : "#94A3B8"}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: item.status ? "#16A34A" : "#94A3B8" },
                    ]}
                  >
                    {item.status ? "Connected" : "Offline"}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F6FA" },
  container: { flex: 1, backgroundColor: "#F4F6FA", paddingHorizontal: 20, paddingTop: 65 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  hello: { color: "#0F172A", fontSize: 19, fontWeight: "700" },
  subtitle: { color: "#64748B", fontSize: 13, marginTop: 2 },
 
  scanBanner: {
    backgroundColor: "#2563EB",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    marginBottom: 26,
    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  scanIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  scanTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  scanSubtitle: {
    color: "#DBEAFE",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  scanButton: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
  },
  scanButtonText: { color: "#2563EB", fontWeight: "700", fontSize: 13 },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  sectionSubtitle: { color: "#94A3B8", fontSize: 12, marginBottom: 14 },
  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 10,
  },
  deviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  deviceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  deviceName: { color: "#0F172A", fontSize: 15, fontWeight: "700" },
  deviceId: { color: "#94A3B8", fontSize: 12, marginTop: 2 },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 },
  statusText: { fontSize: 12, fontWeight: "600" },
});
