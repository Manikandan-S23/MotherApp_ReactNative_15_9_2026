import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BarcodeScanningResult } from "expo-camera";
import { Device, MainTabParamList, RootStackParamList } from "../types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Scanner">,
  NativeStackScreenProps<RootStackParamList>
>;

interface ParsedDeviceJson {
  id?: string;
  name?: string;
  deviceType?: string;
  leds?: unknown;
  [key: string]: unknown;
}

export default function ScannerScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [projectId, setProjectId] = useState<string>("");

  // --------------------------------------------------
  // SAVE DEVICE
  // --------------------------------------------------
  const saveDevice = async (device: Device): Promise<void> => {
    try {
      const raw = await AsyncStorage.getItem("myDevices");
      const devices: Device[] = raw ? JSON.parse(raw) : [];
      const idx = devices.findIndex((d) => d.id === device.id);

      if (idx >= 0) {
        devices[idx] = { ...devices[idx], ...device };
      } else {
        devices.push({ ...device, status: false });
      }

      await AsyncStorage.setItem("myDevices", JSON.stringify(devices));
    } catch (error) {
      console.log("Save device error:", error);
    }
  };

  // Guess a device type from a plain project id, e.g. "INNO-LED-001" -> LED
  const guessDeviceType = (id: string): string => {
    const upper = id.toUpperCase();
    if (upper.includes("LED")) return "LED";
    if (upper.includes("FAN")) return "FAN";
    return "UNKNOWN";
  };

  // --------------------------------------------------
  // PROCESS QR / MANUAL DATA
  // --------------------------------------------------
  const processData = async (data: string): Promise<void> => {
    const trimmed = (data || "").trim();

    if (!trimmed) {
      Alert.alert("Empty", "Please scan a QR code or enter a Project ID.");
      setScanned(false);
      return;
    }

    // CASE 1: JSON device data (from an actual product QR code)
    let parsed: ParsedDeviceJson | null = null;
    try {
      const candidate = JSON.parse(trimmed);
      if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
        parsed = candidate as ParsedDeviceJson;
      }
    } catch {
      parsed = null;
    }

    if (parsed) {
      const fallbackId = parsed.id || `device_${Date.now()}`;
      const device: Device = {
        id: fallbackId,
        name: parsed.name || parsed.id || "Unknown Device",
        deviceType: parsed.deviceType
          ? String(parsed.deviceType).toUpperCase()
          : "UNKNOWN",
        status: false,
        raw: parsed,
        ...(parsed.leds ? { leds: parsed.leds } : {}),
      };

      await saveDevice(device);
      resetScanner();
      navigation.navigate("DeviceControl", { device });
      return;
    }

    // CASE 2: a URL -> ALWAYS opens inside the app's own WebView screen,
    // never the device's external browser.
    if (/^https?:\/\//i.test(trimmed)) {
      resetScanner();
      navigation.navigate("WebViewScreen", { url: trimmed });
      return;
    }

    // CASE 3: a plain Project ID, e.g. "INNO-LED-001"
    if (/^[A-Za-z0-9][A-Za-z0-9_-]{2,}$/.test(trimmed)) {
      const device: Device = {
        id: trimmed,
        name: trimmed,
        deviceType: guessDeviceType(trimmed),
        status: false,
      };
      await saveDevice(device);
      resetScanner();
      navigation.navigate("DeviceControl", { device });
      return;
    }

    // CASE 4: neither JSON, URL, nor a valid project id
    Alert.alert(
      "Invalid QR / Text",
      "This is neither a valid device QR code, a URL, nor a Project ID.",
      [{ text: "Try Again", onPress: () => setScanned(false) }]
    );
  };

  const resetScanner = (): void => {
    setScanned(false);
    setIsScanning(false);
    setProjectId("");
  };

  const handleBarCodeScanned = async (result: BarcodeScanningResult): Promise<void> => {
    if (scanned) return;
    setScanned(true);
    await processData(result.data);
  };

  const handleStartScanning = async (): Promise<void> => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Camera permission required",
          "Please allow camera access to scan a QR code, or add your app using the Project ID field below."
        );
        return;
      }
    }
    setScanned(false);
    setIsScanning(true);
  };

  const handleAddApp = async (): Promise<void> => {
    await processData(projectId);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>Scan QR Code</Text>

          <View style={styles.cameraBox}>
            {isScanning && permission?.granted ? (
              <>
                <CameraView
                  style={StyleSheet.absoluteFillObject}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                />
                <View style={styles.scanOverlayCorners} pointerEvents="none" />
                <TouchableOpacity
                  style={styles.stopScanBtn}
                  onPress={() => setIsScanning(false)}
                >
                  <Ionicons name="close" size={18} color="#FFFFFF" />
                  <Text style={styles.stopScanText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
                <Ionicons name="camera-outline" size={44} color="#64748B" />
                <Text style={styles.cameraReadyText}>Camera ready</Text>
              </>
            )}
          </View>

          <Text style={styles.title}>Scan the QR code to add your app</Text>
          <Text style={styles.subtitle}>
            Point your camera at the QR code provided by your project.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartScanning}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>
              {isScanning ? "Scanning…" : "Start Scanning"}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or enter manually</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.fieldLabel}>URL</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g: https:url.com"
            placeholderTextColor="#000000"
            autoCapitalize="characters"
            value={projectId}
            onChangeText={setProjectId}
          />

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleAddApp}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const ACCENT = "#2563EB";

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  flex: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 18,
  },
  cameraBox: {
    height: 260,
    borderRadius: 20,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 20,
  },
  cameraReadyText: { color: "#94A3B8", marginTop: 10, fontSize: 14 },
  cornerTL: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 26,
    height: 26,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: ACCENT,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 26,
    height: 26,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: ACCENT,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    position: "absolute",
    bottom: 16,
    left: 16,
    width: 26,
    height: 26,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: ACCENT,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 26,
    height: 26,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: ACCENT,
    borderBottomRightRadius: 8,
  },
  scanOverlayCorners: { ...StyleSheet.absoluteFillObject },
  stopScanBtn: {
    position: "absolute",
    bottom: 14,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(15,23,42,0.85)",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  stopScanText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 19,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 22,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E2E8F0" },
  dividerText: { color: "#94A3B8", fontSize: 12, marginHorizontal: 10 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.2,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    marginBottom: 20,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  secondaryButtonText: { color: ACCENT, fontWeight: "700", fontSize: 15 },
});
