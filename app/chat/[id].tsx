import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  FlatList,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useChatStore } from "../../src/stores/chatStore";
import { useAuthStore } from "../../src/stores/authStore";
import { createPuterChatService } from "../../src/services/puterChat";
import { MessageBubble } from "../../src/components";
import type { Message } from "../../src/types";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inputText, setInputText] = useState("");
  const listRef = useRef<FlatList<Message>>(null);

  const {
    conversations,
    selectedModel,
    isStreaming,
    addMessage,
    setIsStreaming,
    appendStreamingContent,
    clearStreamingContent,
    updateLastMessage,
    updateConversation,
  } = useChatStore();

  const { puterToken } = useAuthStore();

  const conversation = conversations.find((c) => c.id === id);
  const messages = conversation?.messages || [];

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isStreaming || !id) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    // Add user message
    addMessage(id, userMessage);
    const messageText = inputText.trim();
    setInputText("");

    // Update conversation title if it's the first message
    if (messages.length === 0) {
      const title =
        messageText.slice(0, 50) + (messageText.length > 50 ? "..." : "");
      updateConversation(id, { title });
    }

    // Create placeholder assistant message
    const assistantMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      model: selectedModel.id,
    };
    addMessage(id, assistantMessage);

    // Start streaming
    setIsStreaming(true);
    clearStreamingContent();

    try {
      const chatService = createPuterChatService(puterToken);
      const allMessages = [...messages, userMessage];

      let fullContent = "";
      for await (const chunk of chatService.streamChat(
        selectedModel.id,
        allMessages,
      )) {
        fullContent += chunk;
        appendStreamingContent(chunk);
        updateLastMessage(id, fullContent);
      }
    } catch (error) {
      console.error("Chat error:", error);
      updateLastMessage(id, "Sorry, an error occurred. Please try again.");
    } finally {
      setIsStreaming(false);
      clearStreamingContent();
    }
  }, [
    inputText,
    isStreaming,
    id,
    messages,
    selectedModel,
    puterToken,
    addMessage,
    setIsStreaming,
    appendStreamingContent,
    clearStreamingContent,
    updateLastMessage,
    updateConversation,
  ]);

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
        }}
      />

      <View style={styles.messagesContainer}>
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
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          multiline
          maxLength={4000}
          editable={!isStreaming}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isStreaming) && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isStreaming}
        >
          <Ionicons
            name="send"
            size={20}
            color={!inputText.trim() || isStreaming ? "#9ca3af" : "#ffffff"}
          />
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
  messagesContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
