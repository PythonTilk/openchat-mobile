import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useChatStore } from "../../src/stores/chatStore";
import type { Model } from "../../src/types";

export default function ModelsScreen() {
  const { availableModels, selectedModel, setSelectedModel } = useChatStore();

  const renderModel = ({ item }: { item: Model }) => {
    const isSelected = selectedModel.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.modelItem, isSelected && styles.modelItemSelected]}
        onPress={() => setSelectedModel(item)}
      >
        <View style={styles.modelInfo}>
          <Text style={styles.modelName}>{item.name}</Text>
          <Text style={styles.modelOwner}>{item.owned_by}</Text>
          {item.description && (
            <Text style={styles.modelDescription}>{item.description}</Text>
          )}
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.currentLabel}>Current Model</Text>
        <View style={styles.currentModel}>
          <Ionicons name="cube" size={20} color="#3b82f6" />
          <Text style={styles.currentModelName}>{selectedModel.name}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Available Models</Text>

      <FlatList
        data={availableModels}
        renderItem={renderModel}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  currentLabel: {
    fontSize: 12,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  currentModel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  currentModelName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  modelItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  modelItemSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  modelOwner: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  modelDescription: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
});
