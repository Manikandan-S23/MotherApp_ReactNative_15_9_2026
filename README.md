# React Native QR Device Control App

Login → Register → Dashboard → QR Scan → **Dynamic device UI** (based on what's inside the QR code).

## What's new in this update

1. **Dashboard redesign** — Home now matches the light "Hello, {name}" layout: greeting + bell icon,
   a blue "Scan & Get Your App Here" banner, and a "My Apps" list with icon, ID, and a live
   Connected/Offline indicator. A new bottom tab bar (Home / Scanner / My Profile) replaces the old
   single dashboard screen, and a matching **Profile** tab was added (avatar, user details, settings list).
2. **Professional Login/Register screens** — new dark header + white card layout, icon-prefixed inputs,
   a show/hide password toggle, and placeholder text is now solid black as requested.
3. **Converted to TypeScript** — every file is now `.ts`/`.tsx` (`App.tsx`, all `screens/`, `components/`,
   `context/AuthContext.tsx`, plus a new `navigation/MainTabs.tsx` and `types/index.ts` with shared
   `Device`, `User`, and navigation param types). `tsconfig.json` and the `typescript`/`@types/react`
   dev dependencies were added; `npm run type-check` runs `tsc --noEmit` with zero errors.
4. **Links always stay inside the app** — pasted/scanned URLs open in the in-app `WebViewScreen`
   (never the phone's external browser). The WebView now also blocks any non-http(s) navigation and
   any attempt by a page to spawn a new browser window/tab (`onShouldStartLoadWithRequest`,
   `setSupportMultipleWindows={false}`, `javaScriptCanOpenWindowsAutomatically={false}`), so every link
   tapped from inside a loaded page stays in the same in-app view too.


## Setup (Expo)

```bash
npx create-expo-app rn-qr-device-app
cd rn-qr-device-app
# replace App.js, and copy in screens/, components/, context/, assets/ from this project
npm install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage
npx expo install expo-barcode-scanner expo-camera
npx expo start
```

Run on your phone using the **Expo Go** app (scan the terminal QR) — camera permission venum, so a real device or emulator with camera is best.

## How the "dynamic UI from QR" part works

The QR code doesn't contain UI — it contains a small JSON payload telling the
app **what kind of device** this is:

```json
{ "type": "device", "deviceType": "LED", "id": "led-001", "name": "Hall Light" }
```

`ScannerScreen.js` scans this, saves it into `myDevices` list (AsyncStorage),
and navigates to `DeviceControlScreen.js`.

`DeviceControlScreen.js` looks at `device.deviceType` and picks the matching
component:

```js
switch (device.deviceType) {
  case "LED":  return <LedControl ... />   // on/off toggle
  case "FAN":  return <FanControl ... />   // on/off + speed slider
  default:     return <UnknownDeviceUI />
}
```

So **one scanner + one screen handles unlimited device types** — to add a
new physical device (e.g. a smart door lock, AC, curtain motor):

1. Print a QR with `{"deviceType":"DOOR_LOCK","id":"lock-01","name":"Front Door"}`
2. Create `components/DoorLockControl.js` with whatever UI you want
3. Add one `case "DOOR_LOCK":` line in `DeviceControlScreen.js`

No changes needed to the scanner, dashboard, login, or navigation.

## Testing without real hardware

Two dummy QR codes are included in `assets/`:

- `dummy_qr_led.png` → opens the **LED on/off toggle** UI
- `dummy_qr_fan.png` → opens the **Fan on/off + speed** UI

Open either PNG on a laptop/second phone screen and point your app's camera
at it — the correct dynamic UI will appear automatically.

## Connecting to real hardware (e.g. ESP32/Arduino/Raspberry Pi)

Inside `DeviceControlScreen.js`, the `toggleLed` / `toggleFan` functions are
where you currently just save state locally. Replace them with a real HTTP
call to your device, e.g.:

```js
const toggleLed = async (val) => {
  setIsOn(val);
  persist({ status: val });
  await fetch(`http://${device.ip}/led?state=${val ? "on" : "off"}`);
};
```

Add `ip` (device's local IP) as another field inside your QR JSON so each
device knows where to send commands.

## Notes

- Login/Register here uses AsyncStorage as a mock local database — swap
  `context/AuthContext.js` functions with real API calls to your backend
  when ready.
- Colors/theme are in each screen's `StyleSheet` — dark theme with cyan
  accent (`#22D3EE`). Change freely.
