import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

// Icon per device type - purely for the dashboard list preview
const ICONS = {
  LED: "💡",
  FAN: "🌀",
  DEFAULT: "🔌",
};

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [devices, setDevices] = useState([]);

  const loadDevices = async () => {
    const raw = await AsyncStorage.getItem("myDevices");
    setDevices(raw ? JSON.parse(raw) : []);
  };

  // Refresh device list every time Dashboard comes into focus
  // (e.g. after scanning + saving a new device)
  useFocusEffect(
    useCallback(() => {
      loadDevices();
    }, [])
  );

  const openDevice = (device) => {
    navigation.navigate("DeviceControl", { device });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Hello</Text>
          <Text style={styles.name}>{user?.name || "User"} 👋</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.scanCard}
        onPress={() => navigation.navigate("Scanner")}
      >
        <Text style={styles.scanEmoji}>📷</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.scanTitle}>Scan QR Code</Text>
          <Text style={styles.scanSubtitle}>
            Scan QR, UI show automatic 
          </Text>
        </View>
        <Text style={styles.arrow}>➜</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>My Devices</Text>

      {devices.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
           No devices added yet. Please tap the “Scan QR Code” button above to add a device.
          </Text>
        </View>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.deviceCard}
              onPress={() => openDevice(item)}
            >
              <Text style={styles.deviceIcon}>
                {ICONS[item.deviceType] || ICONS.DEFAULT}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.deviceName}>{item.name}</Text>
                <Text style={styles.deviceType}>{item.deviceType}</Text>
              </View>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: item.status ? "#22C55E" : "#475569" },
                ]}
              />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e4e6eb", padding: 20, paddingTop: 60 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  hello: { color: "#94A3B8", fontSize: 14 },
  name: { color: "#181717", fontSize: 22, fontWeight: "700" },
  logout: { color: "#F87171", fontWeight: "600" },
  scanCard: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  scanEmoji: { fontSize: 30, marginRight: 14 },
  scanTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  scanSubtitle: { color: "#94A3B8", fontSize: 12, marginTop: 2 },
  arrow: { color: "#22D3EE", fontSize: 20, marginLeft: 8 },
  sectionTitle: {
    color: "#262424",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  emptyBox: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 20,
  },
  emptyText: { color: "#94A3B8", fontSize: 13, lineHeight: 20 },
  deviceCard: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems:"center",
    marginBottom: 12,
  },
  deviceIcon: { fontSize: 26, marginRight: 14 },
  deviceName: { color: "#fff", fontSize: 15, fontWeight: "600" },
  deviceType: { color: "#94A3B8", fontSize: 12, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
});
