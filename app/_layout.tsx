import { Stack } from "expo-router";
import { useEffect } from "react";
import {
  useColorScheme,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../src/stores/authStore";
import { useChatStore } from "../src/stores/chatStore";
import { Providers } from "../src/providers";

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
}

function RootLayoutNav() {
  const { hydrate: hydrateAuth, isHydrated: isAuthHydrated } = useAuthStore();
  const { hydrate: hydrateChat, isHydrated: isChatHydrated } = useChatStore();
  const colorScheme = useColorScheme();

  useEffect(() => {
    hydrateAuth();
    hydrateChat();
  }, [hydrateAuth, hydrateChat]);

  // Wait for both stores to hydrate before rendering
  if (!isAuthHydrated || !isChatHydrated) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#111827" : "#ffffff",
          },
          headerTintColor: colorScheme === "dark" ? "#f9fafb" : "#1f2937",
          contentStyle: {
            backgroundColor: colorScheme === "dark" ? "#111827" : "#ffffff",
          },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="chat/[id]"
          options={{
            headerShown: true,
            presentation: "card",
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <Providers>
      <RootLayoutNav />
    </Providers>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});
