import { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useChatStore } from "../../src/stores/chatStore";
import { useAuthStore } from "../../src/stores/authStore";
import { ConversationItem, EmptyState } from "../../src/components";
import type { Conversation } from "../../src/types";

export default function ChatsScreen() {
  const { conversations, createNewConversation, deleteConversation } =
    useChatStore();
  const { isPuterAuthenticated, isOpenWebUIAuthenticated } = useAuthStore();

  const handleNewChat = () => {
    const conversation = createNewConversation();
    router.push(`/chat/${conversation.id}`);
  };

  const handleOpenChat = (conversation: Conversation) => {
    useChatStore.getState().setCurrentConversation(conversation.id);
    router.push(`/chat/${conversation.id}`);
  };

  const renderConversation = useCallback(
    ({ item }: { item: Conversation }) => (
      <ConversationItem
        conversation={item}
        onPress={() => handleOpenChat(item)}
        onDelete={() => deleteConversation(item.id)}
      />
    ),
    [deleteConversation],
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
        <Ionicons name="add" size={24} color="#ffffff" />
        <Text style={styles.newChatText}>New Chat</Text>
      </TouchableOpacity>

      {!isPuterAuthenticated && !isOpenWebUIAuthenticated && (
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={styles.infoText}>
            You're using Puter's free AI models. Sign in to save your chats.
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <EmptyState
        icon="chatbubble-ellipses-outline"
        title="No conversations yet"
        subtitle='Tap "New Chat" to start chatting with AI'
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {conversations.length === 0 ? (
        <>
          {renderHeader()}
          {renderEmpty()}
        </>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  newChatText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#3b82f6",
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
