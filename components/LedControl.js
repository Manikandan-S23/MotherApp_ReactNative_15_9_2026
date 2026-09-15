import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";

export default function LedControl({ isOn, onToggle }) {
  return (
    <View style={styles.card}>
      <View
        style={[
          styles.bulbCircle,
          { backgroundColor: isOn ? "#FDE68A" : "#334155" },
        ]}
      >
        <Text style={styles.bulbEmoji}>💡</Text>
      </View>

      <Text style={styles.statusText}>{isOn ? "ON" : "OFF"}</Text>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Power</Text>
        <Switch
          value={isOn}
          onValueChange={onToggle}
          trackColor={{ false: "#334155", true: "#22D3EE" }}
          thumbColor="#fff"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  bulbCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  bulbEmoji: { fontSize: 54 },
  statusText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    letterSpacing: 1,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 8,
  },
  switchLabel: { color: "#94A3B8", fontSize: 15 },
});
