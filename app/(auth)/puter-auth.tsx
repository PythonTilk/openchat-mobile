import { useCallback, useRef } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { router } from "expo-router";
import { useAuthStore } from "../../src/stores/authStore";
import { puterAuth } from "../../src/services/puterAuth";

export default function PuterAuthScreen() {
  const webViewRef = useRef<WebView>(null);
  const { setPuterAuth } = useAuthStore();

  const handleMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        if (data.type === "puter_auth_success" && data.token) {
          // Validate token and get user info
          const user = await puterAuth.validateToken(data.token);

          if (user) {
            await setPuterAuth(data.token, user);
            router.replace("/(tabs)");
          } else {
            console.error("Failed to validate Puter token");
          }
        }
      } catch (error) {
        console.error("Error handling WebView message:", error);
      }
    },
    [setPuterAuth],
  );

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: puterAuth.getSignInUrl() }}
        injectedJavaScript={puterAuth.getWebViewInjectedJS()}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});
