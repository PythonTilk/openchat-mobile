import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  FlatList,
} from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useChat } from "../../src/hooks/useChat";
import { useChatStore } from "../../src/stores/chatStore";
import { MessageBubble, EmptyState } from "../../src/components";
import type { Message } from "../../src/types";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inputText, setInputText] = useState("");
  const listRef = useRef<FlatList<Message>>(null);

  const { selectedModel } = useChatStore();
  const { conversation, messages, isStreaming, error, sendMessage } = useChat(
    id || "",
  );

  // Redirect if conversation doesn't exist
  useEffect(() => {
    if (id && !conversation) {
      // Give it a moment to load
      const timer = setTimeout(() => {
        if (!conversation) {
          router.back();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [id, conversation]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isStreaming) return;
    const text = inputText.trim();
    setInputText("");
    await sendMessage(text);
  }, [inputText, isStreaming, sendMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => (
      <MessageBubble
        message={item}
        isStreaming={
          isStreaming &&
          index === messages.length - 1 &&
          item.role === "assistant"
        }
      />
    ),
    [isStreaming, messages.length],
  );

  const renderEmptyChat = () => (
    <View style={styles.emptyContainer}>
      <EmptyState
        icon="chatbubble-ellipses-outline"
        title="Start a conversation"
        subtitle={`Send a message to start chatting with ${selectedModel.name}`}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen
        options={{
          title: conversation?.title || "Chat",
          headerBackTitle: "Back",
          headerRight: () => (
            <View style={styles.headerRight}>
              <View style={styles.modelBadge}>
                <Ionicons name="cube-outline" size={14} color="#6b7280" />
                <Text style={styles.modelBadgeText}>{selectedModel.name}</Text>
              </View>
            </View>
          ),
        }}
      />

      <View style={styles.messagesContainer}>
        {messages.length === 0 ? (
          renderEmptyChat()
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={4000}
          editable={!isStreaming}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isStreaming) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isStreaming}
        >
          {isStreaming ? (
            <Ionicons name="stop" size={20} color="#ffffff" />
          ) : (
            <Ionicons
              name="send"
              size={20}
              color={!inputText.trim() ? "#9ca3af" : "#ffffff"}
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  modelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  modelBadgeText: {
    fontSize: 12,
    color: "#6b7280",
  },
  messagesContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexGrow: 1,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: "#ef4444",
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    fontSize: 16,
    marginRight: 8,
    color: "#1f2937",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#e5e7eb",
  },
});
