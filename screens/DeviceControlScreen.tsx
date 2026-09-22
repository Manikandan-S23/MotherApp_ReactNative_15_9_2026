import React, { useState, useLayoutEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import LedControl from "../components/LedControl";
import FanControl from "../components/FanControl";
import { Device, RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "DeviceControl">;

// ---------------------------------------------------------------------------
// THIS is the "dynamic" part: the QR code only tells us `deviceType` + `id`.
// Based on `deviceType` we decide WHICH control UI component to render.
// To support a new physical device, just:
//   1. Make a new QR with a new deviceType, e.g. "DOOR_LOCK"
//   2. Add a case below that renders your custom control component
// No other screen needs to change.
// ---------------------------------------------------------------------------

export default function DeviceControlScreen({ route, navigation }: Props) {
  const { device } = route.params;
  const [isOn, setIsOn] = useState<boolean>(device.status || false);
  const [speed, setSpeed] = useState<number>(device.speed || 1);

  useLayoutEffect(() => {
    navigation.setOptions({ title: device.name });
  }, [navigation, device]);

  const persist = async (updates: Partial<Device>): Promise<void> => {
    const raw = await AsyncStorage.getItem("myDevices");
    const devices: Device[] = raw ? JSON.parse(raw) : [];
    const idx = devices.findIndex((d) => d.id === device.id);
    if (idx >= 0) {
      devices[idx] = { ...devices[idx], ...updates };
    }
    await AsyncStorage.setItem("myDevices", JSON.stringify(devices));
  };

  const toggleLed = (val: boolean): void => {
    setIsOn(val);
    persist({ status: val });
    // TODO: replace with your real hardware call, e.g.
    // fetch(`http://<esp32-ip>/led?state=${val ? "on" : "off"}`)
  };

  const toggleFan = (val: boolean): void => {
    setIsOn(val);
    persist({ status: val });
  };

  const changeSpeed = (val: number): void => {
    setSpeed(val);
    persist({ speed: val });
  };

  const renderControl = () => {
    switch (device.deviceType) {
      case "LED":
        return <LedControl isOn={isOn} onToggle={toggleLed} />;
      case "FAN":
        return (
          <FanControl
            isOn={isOn}
            speed={speed}
            onToggle={toggleFan}
            onSpeedChange={changeSpeed}
          />
        );
      default:
        return (
          <View style={styles.unknownCard}>
            <Text style={styles.unknownText}>
              No UI design is available yet for the "{device.deviceType}"
              device type. Please add a new component in the components/
              folder.
            </Text>
          </View>
        );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
    >
      <View style={styles.headerRow}>
        <Text style={styles.deviceName}>{device.name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{device.deviceType}</Text>
        </View>
      </View>
      <Text style={styles.deviceId}>ID: {device.id}</Text>

      <View style={{ marginTop: 24 }}>{renderControl()}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deviceName: { color: "#fff", fontSize: 22, fontWeight: "700" },
  deviceId: { color: "#64748B", fontSize: 12, marginTop: 4 },
  badge: {
    backgroundColor: "#334155",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { color: "#22D3EE", fontSize: 11, fontWeight: "700" },
  unknownCard: {
    backgroundColor: "#1E293B",
    padding: 24,
    borderRadius: 16,
  },
  unknownText: { color: "#94A3B8", fontSize: 13, lineHeight: 20 },
});
