

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   Dimensions,
//   TextInput,
//   KeyboardAvoidingView,
//   Platform,
//   // Linking,
// } from "react-native";
// import { CameraView, useCameraPermissions } from "expo-camera";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const { width } = Dimensions.get("window");
// const BOX_SIZE = width * 0.7;

// export default function ScannerScreen({ navigation }) {
//   const [permission, requestPermission] = useCameraPermissions();
//   const [scanned, setScanned] = useState(false);

//   // --- Manual entry (no camera needed) ---
//   // Scanner option venaam-nu irundha, QR-la irukura data (JSON) or andha
//   // QR-oda plain URL ah directly copy-paste pannalam. Paste panna udane
//   // "Open" click pannina, camera scan pannina maadhiri exact-a same
//   // result varum.
//   const [showManual, setShowManual] = useState(false);
//   const [manualText, setManualText] = useState("");

//   const saveDevice = async (device) => {
//     const raw = await AsyncStorage.getItem("myDevices");

//     const devices = raw ? JSON.parse(raw) : [];

//     const idx = devices.findIndex((d) => d.id === device.id);

//     if (idx >= 0) {
//       devices[idx] = {
//         ...devices[idx],
//         ...device,
//       };
//     } else {
//       devices.push({
//         ...device,
//         status: false,
//       });
//     }

//     await AsyncStorage.setItem("myDevices", JSON.stringify(devices));
//   };

//   // Shared logic for BOTH camera-scanned data AND manually pasted text.
//   // 1. If it's valid JSON device data -> open the dynamic Device Control UI
//   // 2. If it's a plain http/https URL -> open it directly in the browser
//   // 3. Otherwise -> show "Invalid" alert
//   const processData = async (data) => {
//     const trimmed = (data || "").trim();

//     if (!trimmed) {
//       Alert.alert("Empty", "Please paste some URL data.");
//       return;
//     }

//     // Case 1: try JSON (our device format)
//     let parsed = null;
//     try {
//       parsed = JSON.parse(trimmed);
//     } catch (e) {
//       parsed = null;
//     }

//     if (parsed && typeof parsed === "object") {
//       const fallbackId = parsed.id || `device_${Date.now()}`;

//       const device = {
//         id: fallbackId,
//         name: parsed.name || parsed.id || "Unknown Device",
//         deviceType: parsed.deviceType
//           ? String(parsed.deviceType).toUpperCase()
//           : "UNKNOWN",
//         status: false,
//         raw: parsed,
//         ...(parsed.leds ? { leds: parsed.leds } : {}),
//       };

//       await saveDevice(device);

//       setShowManual(false);
//       setManualText("");
//       setScanned(false);

//       navigation.replace("DeviceControl", { device });
//       return;
//     }

//     // Case 2: plain URL -> just open it like a link
//     // if (/^https?:\/\//i.test(trimmed)) {
//     //   const canOpen = await Linking.canOpenURL(trimmed);
//     //   if (canOpen) {
//     //     setShowManual(false);
//     //     setManualText("");
//     //     setScanned(false);
//     //     await Linking.openURL(trimmed);
//     //   } else {
//     //     Alert.alert("Cannot Open");
//     //     setScanned(false);
//     //   }
//     //   return;
//     // }
//     // Case 2: plain URL -> open INSIDE React Native app
// if (/^https?:\/\//i.test(trimmed)) {
//   setShowManual(false);
//   setManualText("");
//   setScanned(false);

//   navigation.navigate("WebViewScreen", {
//     url: trimmed,
//   });

//   return;
// }

//     // Case 3: neither JSON nor URL
//     Alert.alert(
//       "Invalid QR / Text",
//       "This is neither valid device JSON nor a valid URL. Please enter the correct data.",
//       [{ text: "Try Again", onPress: () => setScanned(false) }]
//     );
//   };

//   const handleBarCodeScanned = async ({ data }) => {
//     if (scanned) return;
//     setScanned(true);
//     await processData(data);
//   };

//   const handleManualOpen = async () => {
//     await processData(manualText);
//   };

//   // Permission loading
//   if (!permission) {
//     return (
//       <View style={styles.center}>
//         <Text style={styles.msg}>Camera permission </Text>
//       </View>
//     );
//   }

//   // Permission not granted -> still allow manual paste, no camera needed
//   if (!permission.granted) {
//     return (
//       <KeyboardAvoidingView
//         style={styles.center}
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//       >
//         <Text style={styles.msg}>Camera permission .</Text>

//         <TouchableOpacity
//           style={styles.permissionBtn}
//           onPress={requestPermission}
//         >
//           <Text style={styles.permissionText}>Allow Camera</Text>
//         </TouchableOpacity>

//         <View style={styles.dividerRow}>
//           <View style={styles.dividerLine} />
//           <Text style={styles.dividerText}>OR</Text>
//           <View style={styles.dividerLine} />
//         </View>

//         <Text style={styles.msg}>
//           Scanner not needed? You can directly paste the QR data or URL here:
//         </Text>
//         <TextInput
//           style={styles.manualInputNoCam}
//           placeholder="QR JSON or URL paste"
//           placeholderTextColor="#64748B"
//           value={manualText}
//           onChangeText={setManualText}
//           multiline
//         />
//         <TouchableOpacity
//           style={styles.manualOpenBtn}
//           onPress={handleManualOpen}
//         >
//           <Text style={styles.manualOpenText}>Open</Text>
//         </TouchableOpacity>

//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.backLink}>Back</Text>
//         </TouchableOpacity>
//       </KeyboardAvoidingView>
//     );
//   }

//   const boxTop = (Dimensions.get("window").height - BOX_SIZE) / 2 - 40;

//   return (
//     <View style={styles.container}>
//       {/* Camera - only visible fully inside the cutout box, rest is masked below */}
//       <CameraView
//         style={StyleSheet.absoluteFillObject}
//         facing="back"
//         barcodeScannerSettings={{
//           barcodeTypes: ["qr"],
//         }}
//         onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
//       />

//       {/* Mask: 4 opaque panels around the box so only the box area shows live camera */}
//       <View style={styles.maskWrap} pointerEvents="none">
//         {/* top */}
//         <View
//           style={[styles.mask, { top: 0, left: 0, right: 0, height: boxTop }]}
//         />
//         {/* bottom */}
//         <View
//           style={[
//             styles.mask,
//             { top: boxTop + BOX_SIZE, left: 0, right: 0, bottom: 0 },
//           ]}
//         />
//         {/* left */}
//         <View
//           style={[
//             styles.mask,
//             {
//               top: boxTop,
//               height: BOX_SIZE,
//               left: 0,
//               width: (width - BOX_SIZE) / 2,
//             },
//           ]}
//         />
//         {/* right */}
//         <View
//           style={[
//             styles.mask,
//             {
//               top: boxTop,
//               height: BOX_SIZE,
//               right: 0,
//               width: (width - BOX_SIZE) / 2,
//             },
//           ]}
//         />

//         {/* Title above the box */}
//         <View style={[styles.titleWrap, { top: boxTop - 60 }]}>
//           <Text style={styles.title}>Place the QR code inside the frame</Text>
//         </View>

//         {/* Corner brackets - ticket-scanner style viewfinder */}
//         <View
//           style={[styles.box, { top: boxTop, left: (width - BOX_SIZE) / 2 }]}
//         >
//           <View style={[styles.corner, styles.cornerTL]} />
//           <View style={[styles.corner, styles.cornerTR]} />
//           <View style={[styles.corner, styles.cornerBL]} />
//           <View style={[styles.corner, styles.cornerBR]} />
//         </View>

//         {/* Hint below the box */}
//         <View style={[styles.hintWrap, { top: boxTop + BOX_SIZE + 24 }]}>
//           <Text style={styles.hint}>
//             Open the LED / Fan QR code on another screen and show it to the
//             camera
//           </Text>
//         </View>
//       </View>

//       {/* Scan Again */}
//       {scanned && !showManual && (
//         <TouchableOpacity
//           style={styles.rescanBtn}
//           onPress={() => setScanned(false)}
//         >
//           <Text style={styles.rescanText}>Scan Again</Text>
//         </TouchableOpacity>
//       )}

//       {/* Back */}
//       <TouchableOpacity
//         style={styles.backBtn}
//         onPress={() => navigation.goBack()}
//       >
//         <Text style={styles.backText}>✕</Text>
//       </TouchableOpacity>

//       {/* --- Manual entry panel: scanner illama URL/JSON paste panni open pannalam --- */}
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//         style={styles.manualWrap}
//       >
//         {showManual ? (
//           <View style={styles.manualPanel}>
//             <Text style={styles.manualLabel}>Paste QR data or URL</Text>
//             <TextInput
//               style={styles.manualInput}
//               placeholder='e.g. {"deviceType":"LED","id":"led-001"} or https://...'
//               placeholderTextColor="#94A3B8"
//               value={manualText}
//               onChangeText={setManualText}
//               multiline
//               autoFocus
//             />
//             <View style={styles.manualBtnRow}>
//               <TouchableOpacity
//                 style={[styles.manualBtn, styles.manualOpenBtnSmall]}
//                 onPress={handleManualOpen}
//               >
//                 <Text style={styles.manualOpenText}>Open</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.manualBtn, styles.manualCancelBtn]}
//                 onPress={() => {
//                   setShowManual(false);
//                   setManualText("");
//                 }}
//               >
//                 <Text style={styles.manualCancelText}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         ) : (
//           <TouchableOpacity
//             style={styles.manualToggle}
//             onPress={() => setShowManual(true)}
//           >
//             <Text style={styles.manualToggleText}>
//               📋 No scanner? Paste URL here.
//             </Text>
//           </TouchableOpacity>
//         )}
//       </KeyboardAvoidingView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#000",
//     padding: 24,
//   },

//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#0F172A",
//     padding: 24,
//   },

//   msg: {
//     color: "#fff",
//     textAlign: "center",
//     marginBottom: 20,
//   },

//   permissionBtn: {
//     backgroundColor: "#22D3EE",
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 25,
//   },

//   permissionText: {
//     color: "#0F172A",
//     fontWeight: "700",
//   },

//   dividerRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     width: "100%",
//     marginVertical: 24,
//   },
//   dividerLine: { flex: 1, height: 1, backgroundColor: "#334155" },
//   dividerText: { color: "#64748B", marginHorizontal: 10, fontSize: 12 },

//   manualInputNoCam: {
//     width: "100%",
//     backgroundColor: "#1E293B",
//     color: "#fff",
//     borderRadius: 12,
//     padding: 14,
//     minHeight: 90,
//     textAlignVertical: "top",
//     marginBottom: 14,
//   },

//   backLink: {
//     color: "#94A3B8",
//     marginTop: 24,
//     textAlign: "center",
//   },

//   maskWrap: {
//     ...StyleSheet.absoluteFillObject,
//   },

//   mask: {
//     position: "absolute",
//     backgroundColor: "rgba(0,0,0,0.75)",
//   },

//   titleWrap: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     alignItems: "center",
//     paddingHorizontal: 30,
//   },

//   title: {
//     color: "#fff",
//     fontSize: 15,
//     fontWeight: "600",
//     textAlign: "center",
//   },

//   hintWrap: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     alignItems: "center",
//     paddingHorizontal: 30,
//   },

//   hint: {
//     color: "#E2E8F0",
//     fontSize: 12,
//     textAlign: "center",
//   },

//   box: {
//     position: "absolute",
//     width: BOX_SIZE,
//     height: BOX_SIZE,
//   },

//   corner: {
//     position: "absolute",
//     width: 34,
//     height: 34,
//     borderColor: "#22D3EE",
//   },

//   cornerTL: {
//     top: 0,
//     left: 0,
//     borderTopWidth: 4,
//     borderLeftWidth: 4,
//     borderTopLeftRadius: 16,
//   },

//   cornerTR: {
//     top: 0,
//     right: 0,
//     borderTopWidth: 4,
//     borderRightWidth: 4,
//     borderTopRightRadius: 16,
//   },

//   cornerBL: {
//     bottom: 0,
//     left: 0,
//     borderBottomWidth: 4,
//     borderLeftWidth: 4,
//     borderBottomLeftRadius: 16,
//   },

//   cornerBR: {
//     bottom: 0,
//     right: 0,
//     borderBottomWidth: 4,
//     borderRightWidth: 4,
//     borderBottomRightRadius: 16,
//   },

//   rescanBtn: {
//     position: "absolute",
//     bottom: 130,
//     alignSelf: "center",
//     backgroundColor: "#22D3EE",
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 30,
//   },

//   rescanText: {
//     color: "#0F172A",
//     fontWeight: "700",
//   },

//   backBtn: {
//     position: "absolute",
//     top: 50,
//     left: 20,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   backText: {
//     color: "#fff",
//     fontSize: 18,
//   },

//   // --- manual entry panel styles ---
//   manualWrap: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     bottom: 0,
//   },
//   manualToggle: {
//     backgroundColor: "rgba(15,23,42,0.9)",
//     paddingVertical: 16,
//     alignItems: "center",
//     marginTop: -30,
//   },
//   manualToggleText: {
//     color: "#22D3EE",
//     fontWeight: "600",
//     fontSize: 13,
//   },
//   manualPanel: {
//     backgroundColor: "#0F172A",
//     padding: 18,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   manualLabel: {
//     color: "#94A3B8",
//     fontSize: 12,
//     marginBottom: 8,
//   },
//   manualInput: {
//     backgroundColor: "#1E293B",
//     color: "#fff",
//     borderRadius: 12,
//     padding: 14,
//     minHeight: 70,
//     maxHeight: 120,
//     textAlignVertical: "top",
//     marginBottom: 12,
//   },
//   manualBtnRow: {
//     flexDirection: "row",
//     gap: 10,
//   },
//   manualBtn: {
//     flex: 1,
//     paddingVertical: 13,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   manualOpenBtn: {
//     backgroundColor: "#22D3EE",
//     paddingHorizontal: 24,
//     paddingVertical: 13,
//     borderRadius: 12,
//     marginBottom: 8,
//   },
//   manualOpenBtnSmall: {
//     backgroundColor: "#22D3EE",
//   },
//   manualOpenText: {
//     color: "#0F172A",
//     fontWeight: "700",
//     textAlign: "center",
//   },
//   manualCancelBtn: {
//     backgroundColor: "#334155",
//   },
//   manualCancelText: {
//     color: "#fff",
//     fontWeight: "600",
//     textAlign: "center",
//   },
// });


import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const BOX_SIZE = width * 0.7;

export default function ScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Manual entry
  const [showManual, setShowManual] = useState(false);
  const [manualText, setManualText] = useState("");

  // --------------------------------------------------
  // SAVE DEVICE
  // --------------------------------------------------

  const saveDevice = async (device) => {
    try {
      const raw = await AsyncStorage.getItem("myDevices");

      const devices = raw ? JSON.parse(raw) : [];

      const idx = devices.findIndex((d) => d.id === device.id);

      if (idx >= 0) {
        devices[idx] = {
          ...devices[idx],
          ...device,
        };
      } else {
        devices.push({
          ...device,
          status: false,
        });
      }

      await AsyncStorage.setItem(
        "myDevices",
        JSON.stringify(devices)
      );
    } catch (error) {
      console.log("Save device error:", error);
    }
  };

  // --------------------------------------------------
  // PROCESS QR DATA
  // --------------------------------------------------

  const processData = async (data) => {
    const trimmed = (data || "").trim();

    if (!trimmed) {
      Alert.alert(
        "Empty",
        "Please scan or paste some QR data."
      );
      setScanned(false);
      return;
    }

    // ==================================================
    // CASE 1: JSON DEVICE DATA
    // ==================================================

    let parsed = null;

    try {
      parsed = JSON.parse(trimmed);
    } catch (error) {
      parsed = null;
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      const fallbackId =
        parsed.id || `device_${Date.now()}`;

      const device = {
        id: fallbackId,

        name:
          parsed.name ||
          parsed.id ||
          "Unknown Device",

        deviceType: parsed.deviceType
          ? String(parsed.deviceType).toUpperCase()
          : "UNKNOWN",

        status: false,

        raw: parsed,

        ...(parsed.leds
          ? { leds: parsed.leds }
          : {}),
      };

      await saveDevice(device);

      setShowManual(false);
      setManualText("");
      setScanned(false);

      // Open Device Control screen
      navigation.replace("DeviceControl", {
        device,
      });

      return;
    }

    // ==================================================
    // CASE 2: URL
    // ==================================================

    if (/^https?:\/\//i.test(trimmed)) {
      setShowManual(false);
      setManualText("");
      setScanned(false);

      // IMPORTANT:
      // Don't use Linking.openURL()
      //
      // Instead open URL INSIDE React Native WebView

      navigation.navigate("WebViewScreen", {
        url: trimmed,
      });

      return;
    }

    // ==================================================
    // CASE 3: INVALID DATA
    // ==================================================

    Alert.alert(
      "Invalid QR / Text",
      "This is neither valid device JSON nor a valid URL.",
      [
        {
          text: "Try Again",
          onPress: () => setScanned(false),
        },
      ]
    );
  };

  // --------------------------------------------------
  // QR SCAN
  // --------------------------------------------------

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned) return;

    setScanned(true);

    await processData(data);
  };

  // --------------------------------------------------
  // MANUAL OPEN
  // --------------------------------------------------

  const handleManualOpen = async () => {
    await processData(manualText);
  };

  // --------------------------------------------------
  // CAMERA PERMISSION LOADING
  // --------------------------------------------------

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>
          Camera permission loading...
        </Text>
      </View>
    );
  }

  // --------------------------------------------------
  // CAMERA PERMISSION NOT GRANTED
  // --------------------------------------------------

  if (!permission.granted) {
    return (
      <KeyboardAvoidingView
        style={styles.center}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <Text style={styles.msg}>
          Camera permission is required for QR scanning.
        </Text>

        <TouchableOpacity
          style={styles.permissionBtn}
          onPress={requestPermission}
        >
          <Text style={styles.permissionText}>
            Allow Camera
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />

          <Text style={styles.dividerText}>
            OR
          </Text>

          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.msg}>
          You can directly paste QR data or URL here:
        </Text>

        <TextInput
          style={styles.manualInputNoCam}
          placeholder="QR JSON or URL paste"
          placeholderTextColor="#64748B"
          value={manualText}
          onChangeText={setManualText}
          multiline
        />

        <TouchableOpacity
          style={styles.manualOpenBtn}
          onPress={handleManualOpen}
        >
          <Text style={styles.manualOpenText}>
            Open
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backLink}>
            Back
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );
  }

  // --------------------------------------------------
  // SCANNER UI
  // --------------------------------------------------

  const boxTop =
    (Dimensions.get("window").height -
      BOX_SIZE) /
      2 -
    40;

  return (
    <View style={styles.container}>

      {/* CAMERA */}

      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={
          scanned
            ? undefined
            : handleBarCodeScanned
        }
      />

      {/* MASK */}

      <View
        style={styles.maskWrap}
        pointerEvents="none"
      >

        {/* TOP */}

        <View
          style={[
            styles.mask,
            {
              top: 0,
              left: 0,
              right: 0,
              height: boxTop,
            },
          ]}
        />

        {/* BOTTOM */}

        <View
          style={[
            styles.mask,
            {
              top: boxTop + BOX_SIZE,
              left: 0,
              right: 0,
              bottom: 0,
            },
          ]}
        />

        {/* LEFT */}

        <View
          style={[
            styles.mask,
            {
              top: boxTop,
              height: BOX_SIZE,
              left: 0,
              width:
                (width - BOX_SIZE) / 2,
            },
          ]}
        />

        {/* RIGHT */}

        <View
          style={[
            styles.mask,
            {
              top: boxTop,
              height: BOX_SIZE,
              right: 0,
              width:
                (width - BOX_SIZE) / 2,
            },
          ]}
        />

        {/* TITLE */}

        <View
          style={[
            styles.titleWrap,
            {
              top: boxTop - 60,
            },
          ]}
        >
          <Text style={styles.title}>
            Place the QR code inside the frame
          </Text>
        </View>

        {/* QR FRAME */}

        <View
          style={[
            styles.box,
            {
              top: boxTop,
              left:
                (width - BOX_SIZE) / 2,
            },
          ]}
        >

          <View
            style={[
              styles.corner,
              styles.cornerTL,
            ]}
          />

          <View
            style={[
              styles.corner,
              styles.cornerTR,
            ]}
          />

          <View
            style={[
              styles.corner,
              styles.cornerBL,
            ]}
          />

          <View
            style={[
              styles.corner,
              styles.cornerBR,
            ]}
          />

        </View>

        {/* HINT */}

        <View
          style={[
            styles.hintWrap,
            {
              top:
                boxTop +
                BOX_SIZE +
                24,
            },
          ]}
        >
          <Text style={styles.hint}>
            Scan an LED / Fan QR code
          </Text>
        </View>

      </View>

      {/* SCAN AGAIN */}

      {scanned && !showManual && (
        <TouchableOpacity
          style={styles.rescanBtn}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.rescanText}>
            Scan Again
          </Text>
        </TouchableOpacity>
      )}

      {/* BACK */}

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>
          ✕
        </Text>
      </TouchableOpacity>

      {/* MANUAL ENTRY */}

      <KeyboardAvoidingView
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
        style={styles.manualWrap}
      >

        {showManual ? (
          <View style={styles.manualPanel}>

            <Text style={styles.manualLabel}>
              Paste QR data or URL
            </Text>

            <TextInput
              style={styles.manualInput}
              placeholder='e.g. {"deviceType":"LED","id":"led-001"} or https://example.com'
              placeholderTextColor="#94A3B8"
              value={manualText}
              onChangeText={setManualText}
              multiline
              autoFocus
            />

            <View style={styles.manualBtnRow}>

              <TouchableOpacity
                style={[
                  styles.manualBtn,
                  styles.manualOpenBtnSmall,
                ]}
                onPress={handleManualOpen}
              >
                <Text style={styles.manualOpenText}>
                  Open
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.manualBtn,
                  styles.manualCancelBtn,
                ]}
                onPress={() => {
                  setShowManual(false);
                  setManualText("");
                }}
              >
                <Text style={styles.manualCancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

            </View>

          </View>
        ) : (
          <TouchableOpacity
            style={styles.manualToggle}
            onPress={() =>
              setShowManual(true)
            }
          >
            <Text style={styles.manualToggleText}>
              📋 No scanner? Paste URL here.
            </Text>
          </TouchableOpacity>
        )}

      </KeyboardAvoidingView>

    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 24,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
    padding: 24,
  },

  msg: {
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },

  permissionBtn: {
    backgroundColor: "#22D3EE",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },

  permissionText: {
    color: "#0F172A",
    fontWeight: "700",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 24,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#334155",
  },

  dividerText: {
    color: "#64748B",
    marginHorizontal: 10,
    fontSize: 12,
  },

  manualInputNoCam: {
    width: "100%",
    backgroundColor: "#1E293B",
    color: "#fff",
    borderRadius: 12,
    padding: 14,
    minHeight: 90,
    textAlignVertical: "top",
    marginBottom: 14,
  },

  backLink: {
    color: "#94A3B8",
    marginTop: 24,
    textAlign: "center",
  },

  maskWrap: {
    ...StyleSheet.absoluteFillObject,
  },

  mask: {
    position: "absolute",
    backgroundColor:
      "rgba(0,0,0,0.75)",
  },

  titleWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 30,
  },

  title: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },

  hintWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 30,
  },

  hint: {
    color: "#E2E8F0",
    fontSize: 12,
    textAlign: "center",
  },

  box: {
    position: "absolute",
    width: BOX_SIZE,
    height: BOX_SIZE,
  },

  corner: {
    position: "absolute",
    width: 34,
    height: 34,
    borderColor: "#22D3EE",
  },

  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },

  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },

  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },

  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },

  rescanBtn: {
    position: "absolute",
    bottom: 130,
    alignSelf: "center",
    backgroundColor: "#22D3EE",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },

  rescanText: {
    color: "#0F172A",
    fontWeight: "700",
  },

  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor:
      "rgba(255,255,255,0.2)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  backText: {
    color: "#fff",
    fontSize: 18,
  },

  manualWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },

  manualToggle: {
    backgroundColor:
      "rgba(15,23,42,0.9)",
    paddingVertical: 16,
    alignItems: "center",
    marginTop: -30,
  },

  manualToggleText: {
    color: "#22D3EE",
    fontWeight: "600",
    fontSize: 13,
  },

  manualPanel: {
    backgroundColor: "#0F172A",
    padding: 18,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  manualLabel: {
    color: "#94A3B8",
    fontSize: 12,
    marginBottom: 8,
  },

  manualInput: {
    backgroundColor: "#1E293B",
    color: "#fff",
    borderRadius: 12,
    padding: 14,
    minHeight: 70,
    maxHeight: 120,
    textAlignVertical: "top",
    marginBottom: 12,
  },

  manualBtnRow: {
    flexDirection: "row",
    gap: 10,
  },

  manualBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },

  manualOpenBtn: {
    backgroundColor: "#22D3EE",
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 12,
    marginBottom: 8,
  },

  manualOpenBtnSmall: {
    backgroundColor: "#22D3EE",
  },

  manualOpenText: {
    color: "#0F172A",
    fontWeight: "700",
    textAlign: "center",
  },

  manualCancelBtn: {
    backgroundColor: "#334155",
  },

  manualCancelText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});