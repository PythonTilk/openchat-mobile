import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../src/components";
import { PUTER_MODELS } from "../../src/constants";

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="chatbubbles" size={60} color="#ffffff" />
        </View>
        <Text style={[styles.title, isDark && styles.titleDark]}>OpenChat</Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          Chat with AI models for free
        </Text>
      </View>

      <View style={styles.features}>
        <View style={styles.featureRow}>
          <Ionicons name="flash" size={20} color="#3b82f6" />
          <Text style={[styles.featureText, isDark && styles.featureTextDark]}>
            {PUTER_MODELS.length}+ AI models available
          </Text>
        </View>
        <View style={styles.featureRow}>
          <Ionicons name="sparkles" size={20} color="#10b981" />
          <Text style={[styles.featureText, isDark && styles.featureTextDark]}>
            Free unlimited AI with Puter account
          </Text>
        </View>
        <View style={styles.featureRow}>
          <Ionicons name="sync" size={20} color="#8b5cf6" />
          <Text style={[styles.featureText, isDark && styles.featureTextDark]}>
            Sync with Open-WebUI servers
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Sign in with Puter (Free)"
          onPress={() => router.push("/(auth)/puter-auth")}
          variant="primary"
          icon="sparkles"
        />

        <Button
          title="Connect to Open-WebUI Server"
          onPress={() => router.push("/(auth)/login")}
          variant="secondary"
          icon="server-outline"
        />

        <Button
          title="Skip for now"
          onPress={() => router.push("/(tabs)")}
          variant="text"
        />
      </View>

      <Text style={[styles.footer, isDark && styles.footerDark]}>
        Powered by Puter.js free AI models
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingTop: 80,
    paddingBottom: 40,
  },
  containerDark: {
    backgroundColor: "#111827",
  },
  header: {
    alignItems: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 20,
  },
  titleDark: {
    color: "#f9fafb",
  },
  subtitle: {
    fontSize: 18,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  subtitleDark: {
    color: "#9ca3af",
  },
  features: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: "#4b5563",
  },
  featureTextDark: {
    color: "#d1d5db",
  },
  buttonContainer: {
    gap: 12,
  },
  footer: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 13,
  },
  footerDark: {
    color: "#6b7280",
  },
});
