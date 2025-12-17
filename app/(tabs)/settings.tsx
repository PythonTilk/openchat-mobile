import { View, Text, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../src/components";
import { useAuthStore } from "../../src/stores/authStore";

export default function SettingsScreen() {
  const {
    isPuterAuthenticated,
    puterUser,
    isOpenWebUIAuthenticated,
    openWebUIUser,
    serverUrl,
    clearPuterAuth,
    clearOpenWebUIAuth,
  } = useAuthStore();

  const handlePuterSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out of Puter?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await clearPuterAuth();
        },
      },
    ]);
  };

  const handleOpenWebUISignOut = async () => {
    Alert.alert(
      "Disconnect",
      "Are you sure you want to disconnect from Open-WebUI?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            await clearOpenWebUIAuth();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Puter Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Puter Account</Text>
        <View style={styles.card}>
          {isPuterAuthenticated ? (
            <>
              <View style={styles.accountInfo}>
                <Ionicons name="person-circle" size={40} color="#3b82f6" />
                <View style={styles.accountDetails}>
                  <Text style={styles.username}>{puterUser?.username}</Text>
                  <Text style={styles.email}>
                    {puterUser?.email || "No email"}
                  </Text>
                </View>
              </View>
              <Button
                title="Sign Out"
                onPress={handlePuterSignOut}
                variant="text"
              />
            </>
          ) : (
            <>
              <Text style={styles.notConnected}>Not signed in</Text>
              <Button
                title="Sign in with Puter"
                onPress={() => router.push("/(auth)/puter-auth")}
                variant="secondary"
                icon="log-in-outline"
              />
            </>
          )}
        </View>
      </View>

      {/* Open-WebUI Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Open-WebUI Server</Text>
        <View style={styles.card}>
          {isOpenWebUIAuthenticated ? (
            <>
              <View style={styles.accountInfo}>
                <Ionicons name="server" size={40} color="#10b981" />
                <View style={styles.accountDetails}>
                  <Text style={styles.username}>{openWebUIUser?.name}</Text>
                  <Text style={styles.email}>{serverUrl}</Text>
                </View>
              </View>
              <Button
                title="Disconnect"
                onPress={handleOpenWebUISignOut}
                variant="text"
              />
            </>
          ) : (
            <>
              <Text style={styles.notConnected}>Not connected</Text>
              <Button
                title="Connect to Server"
                onPress={() => router.push("/(auth)/login")}
                variant="secondary"
                icon="link-outline"
              />
            </>
          )}
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Powered by</Text>
            <Text style={styles.aboutValue}>Puter.js</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  accountDetails: {
    marginLeft: 12,
  },
  username: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1f2937",
  },
  email: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  notConnected: {
    fontSize: 15,
    color: "#9ca3af",
    marginBottom: 16,
    textAlign: "center",
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  aboutLabel: {
    fontSize: 15,
    color: "#6b7280",
  },
  aboutValue: {
    fontSize: 15,
    color: "#1f2937",
    fontWeight: "500",
  },
});
