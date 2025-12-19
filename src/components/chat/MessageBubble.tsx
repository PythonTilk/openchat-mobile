import { View, Text, StyleSheet, useColorScheme } from "react-native";
import type { Message } from "../../types";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isUser = message.role === "user";

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser
            ? styles.userBubble
            : [styles.assistantBubble, isDark && styles.assistantBubbleDark],
        ]}
      >
        <Text
          style={[
            styles.text,
            isUser
              ? styles.userText
              : [styles.assistantText, isDark && styles.assistantTextDark],
          ]}
          selectable
        >
          {message.content || (isStreaming ? "" : "...")}
          {isStreaming && <Text style={styles.cursor}>|</Text>}
        </Text>
      </View>
      {message.model && !isUser && (
        <Text style={[styles.modelLabel, isDark && styles.modelLabelDark]}>
          {message.model}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: "85%",
  },
  userContainer: {
    alignSelf: "flex-end",
  },
  assistantContainer: {
    alignSelf: "flex-start",
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: "#3b82f6",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: "#f3f4f6",
    borderBottomLeftRadius: 4,
  },
  assistantBubbleDark: {
    backgroundColor: "#374151",
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "#ffffff",
  },
  assistantText: {
    color: "#1f2937",
  },
  assistantTextDark: {
    color: "#f9fafb",
  },
  cursor: {
    opacity: 0.5,
  },
  modelLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 4,
    marginLeft: 8,
  },
  modelLabelDark: {
    color: "#6b7280",
  },
});
