import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Conversation } from "../../types";

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
  onDelete: () => void;
}

export function ConversationItem({
  conversation,
  onPress,
  onDelete,
}: ConversationItemProps) {
  const handleDelete = () => {
    Alert.alert(
      "Delete Conversation",
      "Are you sure you want to delete this conversation?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ],
    );
  };

  const messageCount = conversation.messages.length;
  const lastMessage = conversation.messages[conversation.messages.length - 1];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name="chatbubble-outline" size={24} color="#6b7280" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {conversation.title}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.messageCount}>
            {messageCount} {messageCount === 1 ? "message" : "messages"}
          </Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.date}>{formatDate(conversation.updated_at)}</Text>
        </View>
        {lastMessage && (
          <Text style={styles.preview} numberOfLines={1}>
            {lastMessage.role === "user" ? "You: " : ""}
            {lastMessage.content}
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: "short" });
  } else {
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
  },
  messageCount: {
    fontSize: 12,
    color: "#9ca3af",
  },
  dot: {
    fontSize: 12,
    color: "#9ca3af",
    marginHorizontal: 4,
  },
  date: {
    fontSize: 12,
    color: "#9ca3af",
  },
  preview: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});
