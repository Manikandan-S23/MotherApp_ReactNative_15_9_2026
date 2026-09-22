import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "AppAdded">;

const ACCENT = "#2563EB";

export default function AppAddedScreen({ route, navigation }: Props) {
  const { device, url, appName } = route.params;
  const [isOpening, setIsOpening] = useState<boolean>(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleOpenApp = (): void => {
    setIsOpening(true);
    // Brief loader before handoff so the transition doesn't feel abrupt.
    setTimeout(() => {
      setIsOpening(false);
      if (device) {
        navigation.replace("DeviceControl", { device });
      } else if (url) {
        navigation.replace("WebViewScreen", { url });
      } else {
        navigation.replace("Main");
      }
    }, 500);
  };

  const handleBackHome = (): void => {
    navigation.replace("Main");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.iconCircle,
            { transform: [{ scale: scaleAnim }], opacity: fadeAnim },
          ]}
        >
          <Ionicons name="checkmark" size={44} color="#16A34A" />
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
          <Text style={styles.title}>App Added Successfully!</Text>
          <Text style={styles.subtitle}>
            {appName} has been added to My Apps.
          </Text>
        </Animated.View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleOpenApp}
            activeOpacity={0.85}
            disabled={isOpening}
          >
            {isOpening ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Open App</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleBackHome}
            activeOpacity={0.85}
            disabled={isOpening}
          >
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 15,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 21,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  buttonGroup: { width: "100%", marginTop: 32 },
  primaryButton: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 14,
    shadowColor: ACCENT,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  secondaryButtonText: { color: ACCENT, fontWeight: "700", fontSize: 15 },
});
