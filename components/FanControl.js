import React from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";

const SPEEDS = [1, 2, 3];

export default function FanControl({ isOn, speed, onToggle, onSpeedChange }) {
  return (
    <View style={styles.card}>
      <View
        style={[
          styles.fanCircle,
          { backgroundColor: isOn ? "#22D3EE" : "#334155" },
        ]}
      >
        <Text style={styles.fanEmoji}>🌀</Text>
      </View>

      <Text style={styles.statusText}>{isOn ? "RUNNING" : "STOPPED"}</Text>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Power</Text>
        <Switch
          value={isOn}
          onValueChange={onToggle}
          trackColor={{ false: "#334155", true: "#22D3EE" }}
          thumbColor="#fff"
        />
      </View>

      <Text style={[styles.switchLabel, { marginTop: 20, marginBottom: 10 }]}>
        Speed
      </Text>
      <View style={styles.speedRow}>
        {SPEEDS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.speedBtn,
              speed === s && styles.speedBtnActive,
              !isOn && styles.speedBtnDisabled,
            ]}
            disabled={!isOn}
            onPress={() => onSpeedChange(s)}
          >
            <Text
              style={[
                styles.speedText,
                speed === s && styles.speedTextActive,
              ]}
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
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
  fanCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  fanEmoji: { fontSize: 54 },
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
  speedRow: { flexDirection: "row", gap: 12 },
  speedBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
  },
  speedBtnActive: { backgroundColor: "#22D3EE" },
  speedBtnDisabled: { opacity: 0.4 },
  speedText: { color: "#94A3B8", fontWeight: "700" },
  speedTextActive: { color: "#0F172A" },
});
