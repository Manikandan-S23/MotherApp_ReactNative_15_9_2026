import React, { useState, useRef, useEffect } from "react";
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
  Image,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BarcodeScanningResult } from "expo-camera";
import { Device, MainTabParamList, RootStackParamList } from "../types";
import dummyQrLed from "../assets/dummy_qr_led.png";
import dummyQrFan from "../assets/dummy_qr_fan.png";

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

// Demo devices shown as scannable previews so app-store reviewers (and
// anyone without physical hardware on hand) can try the "add app" flow.
const DEMO_DEVICES: { image: number; payload: string; label: string }[] = [
  {
    image: dummyQrLed,
    label: "Smart LED Controller",
    payload: JSON.stringify({
      id: "INNO-LED-001",
      name: "Smart LED Controller",
      deviceType: "LED",
    }),
  },
  {
    image: dummyQrFan,
    label: "Smart Fan Controller",
    payload: JSON.stringify({
      id: "INNO-FAN-001",
      name: "Smart Fan Controller",
      deviceType: "FAN",
    }),
  },
];

export default function ScannerScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [projectId, setProjectId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Manual entry is dedicated to URLs, so validate accordingly and only
  // enable Submit once the text looks like a real http(s) URL.
  const isValidUrl = (value: string): boolean => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    return /^https?:\/\/[^\s]+\.[^\s]{2,}/i.test(trimmed);
  };

  const urlIsValid = isValidUrl(projectId);

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
      navigation.navigate("AppAdded", { device, appName: device.name });
      return;
    }

    // CASE 2: a URL -> ALWAYS opens inside the app's own WebView screen,
    // never the device's external browser.
    if (/^https?:\/\//i.test(trimmed)) {
      resetScanner();
      navigation.navigate("AppAdded", { url: trimmed, appName: trimmed });
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
      navigation.navigate("AppAdded", { device, appName: device.name });
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
    if (!urlIsValid || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await processData(projectId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoScan = async (payload: string): Promise<void> => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      await processData(payload);
    } finally {
      setIsSubmitting(false);
    }
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
          <Animated.View style={{ opacity: fadeAnim }}>
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

          <Text style={styles.demoLabel}>Try a demo app</Text>
          <Text style={styles.demoSubtitle}>
            No hardware yet? Tap a sample QR below to preview the flow.
          </Text>
          <View style={styles.demoRow}>
            {DEMO_DEVICES.map((demo) => (
              <TouchableOpacity
                key={demo.label}
                style={styles.demoCard}
                activeOpacity={0.85}
                onPress={() => handleDemoScan(demo.payload)}
                disabled={isSubmitting}
              >
                <Image source={demo.image} style={styles.demoImage} resizeMode="contain" />
                <Text style={styles.demoCardLabel} numberOfLines={1}>
                  {demo.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or enter manually</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.fieldLabel}>URL</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g: https://url.com"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            value={projectId}
            onChangeText={setProjectId}
          />
          {projectId.length > 0 && !urlIsValid && (
            <Text style={styles.errorHint}>
              Enter a valid URL starting with http:// or https://
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              (!urlIsValid || isSubmitting) && styles.secondaryButtonDisabled,
            ]}
            onPress={handleAddApp}
            activeOpacity={0.85}
            disabled={!urlIsValid || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={ACCENT} />
            ) : (
              <Text style={styles.secondaryButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const ACCENT = "#2563EB";

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" ,paddingTop: 55},
  flex: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 15, paddingBottom: 32 },
  demoLabel: { fontSize: 14, fontWeight: "700", color: "#0F172A", marginBottom: 2 },
  demoSubtitle: { fontSize: 12, color: "#64748B", marginBottom: 12, lineHeight: 17 },
  demoRow: { flexDirection: "row", gap: 12, marginBottom: 22 },
  demoCard: {
    flex: 1,
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  demoImage: { width: 64, height: 64, marginBottom: 8 },
  demoCardLabel: { fontSize: 12, fontWeight: "600", color: "#334155" },
  errorHint: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
  },
  secondaryButtonDisabled: { borderColor: "#CBD5E1", opacity: 0.6 },
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
