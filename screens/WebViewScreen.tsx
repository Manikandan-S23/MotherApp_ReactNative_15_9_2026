import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WebView, { WebViewNavigation } from "react-native-webview";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "WebViewScreen">;

export default function WebViewScreen({ route, navigation }: Props) {
  const { url } = route.params;
  const webviewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [currentTitle, setCurrentTitle] = useState<string>("Web Page");

  // ---------------------------------------------------------------------
  // Requirement: pasted / scanned links must always open INSIDE this app,
  // never hand off to the device's external browser. We only ever load
  // http/https requests in the WebView itself; anything else (an attempt
  // to open a new window, a non-web scheme, etc.) is swallowed here.
  // ---------------------------------------------------------------------
  const handleShouldStartLoad = (request: { url: string }): boolean => {
    return /^https?:\/\//i.test(request.url);
  };

  const handleNavigationStateChange = (navState: WebViewNavigation): void => {
    setCanGoBack(navState.canGoBack);
    if (navState.title) setCurrentTitle(navState.title);
  };

  const handleClose = (): void => {
    if (canGoBack) {
      webviewRef.current?.goBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleClose}>
          <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={1}>
          {currentTitle}
        </Text>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.webviewWrap}>
        <WebView
          ref={webviewRef}
          source={{ uri: url }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          allowsBackForwardNavigationGestures
          // Keep every navigation - including links tapped inside the
          // page - inside this WebView instead of the OS browser.
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          onNavigationStateChange={handleNavigationStateChange}
          // Never let the page spawn a separate browser window/tab.
          setSupportMultipleWindows={false}
          javaScriptCanOpenWindowsAutomatically={false}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />
        {loading && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 55,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    backgroundColor: "#0F172A",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 4,
  },
  webviewWrap: { flex: 1 },
  webview: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
