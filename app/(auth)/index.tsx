import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../src/components";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chatbubbles" size={80} color="#3b82f6" />
        <Text style={styles.title}>OpenChat</Text>
        <Text style={styles.subtitle}>Chat with AI models for free</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Start Chatting (Free)"
          onPress={() => router.push("/(tabs)")}
          variant="primary"
          icon="flash"
        />

        <Button
          title="Sign in with Puter"
          onPress={() => router.push("/(auth)/puter-auth")}
          variant="secondary"
          icon="person-circle-outline"
        />

        <Button
          title="Connect to Open-WebUI Server"
          onPress={() => router.push("/(auth)/login")}
          variant="text"
        />
      </View>

      <Text style={styles.footer}>Powered by Puter.js free AI models</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingTop: 100,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 18,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  buttonContainer: {
    gap: 16,
  },
  footer: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 14,
  },
});
