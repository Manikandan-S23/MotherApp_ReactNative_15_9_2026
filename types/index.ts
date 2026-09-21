// ---------------------------------------------------------------------------
// Shared app-wide types
// ---------------------------------------------------------------------------

export type DeviceType = "LED" | "FAN" | "UNKNOWN" | string;

export interface Device {
  id: string;
  name: string;
  deviceType: DeviceType;
  status: boolean;
  speed?: number;
  leds?: unknown;
  raw?: unknown;
}

export interface User {
  name: string;
  email: string;
  password: string;
  mobile?: string;
  accountId?: string;
}

// Parameters carried by each stack screen. Kept here so every screen and
// every `navigation.navigate(...)` call is type-checked against the same
// source of truth.
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  DeviceControl: { device: Device };
  WebViewScreen: { url: string };
};

// Parameters carried by each bottom-tab screen.
export type MainTabParamList = {
  Home: undefined;
  Scanner: undefined;
  Profile: undefined;
};
