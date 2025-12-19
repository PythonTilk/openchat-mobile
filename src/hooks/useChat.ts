import { useCallback, useState } from "react";
import { useChatStore } from "../stores/chatStore";
import { useAuthStore } from "../stores/authStore";
import { createPuterChatService } from "../services/puterChat";
import { createOpenWebUIChatService } from "../services/openWebUIChat";
import type { Message } from "../types";

export function useChat(conversationId: string) {
  const [error, setError] = useState<string | null>(null);

  const {
    conversations,
    selectedModel,
    isStreaming,
    addMessage,
    setIsStreaming,
    updateLastMessage,
    updateConversation,
    clearStreamingContent,
    appendStreamingContent,
  } = useChatStore();

  const { puterToken, openWebUIToken, serverUrl, isOpenWebUIAuthenticated } =
    useAuthStore();

  const conversation = conversations.find((c) => c.id === conversationId);
  const messages = conversation?.messages || [];

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      setError(null);

      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      // Add user message
      addMessage(conversationId, userMessage);

      // Update conversation title if it's the first message
      if (messages.length === 0) {
        const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
        updateConversation(conversationId, { title });
      }

      // Create placeholder assistant message
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        model: selectedModel.id,
      };
      addMessage(conversationId, assistantMessage);

      // Start streaming
      setIsStreaming(true);
      clearStreamingContent();

      try {
        // Decide which service to use
        const allMessages = [...messages, userMessage];

        if (isOpenWebUIAuthenticated && serverUrl && openWebUIToken) {
          // Use Open-WebUI
          const chatService = createOpenWebUIChatService(
            serverUrl,
            openWebUIToken,
          );
          const response = await chatService.chat(
            selectedModel.id,
            allMessages,
          );
          const assistantContent = response.choices[0]?.message?.content || "";
          updateLastMessage(conversationId, assistantContent);
        } else {
          // Use Puter (default)
          const chatService = createPuterChatService(puterToken);
          let fullContent = "";

          for await (const chunk of chatService.streamChat(
            selectedModel.id,
            allMessages,
          )) {
            fullContent += chunk;
            appendStreamingContent(chunk);
            updateLastMessage(conversationId, fullContent);
          }
        }
      } catch (err) {
        console.error("Chat error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        updateLastMessage(
          conversationId,
          "Sorry, an error occurred. Please try again.",
        );
      } finally {
        setIsStreaming(false);
        clearStreamingContent();
      }
    },
    [
      conversationId,
      messages,
      selectedModel,
      isStreaming,
      puterToken,
      openWebUIToken,
      serverUrl,
      isOpenWebUIAuthenticated,
      addMessage,
      setIsStreaming,
      updateLastMessage,
      updateConversation,
      clearStreamingContent,
      appendStreamingContent,
    ],
  );

  const regenerateLastResponse = useCallback(async () => {
    if (messages.length < 2 || isStreaming) return;

    // Find the last user message
    const lastUserMessageIndex = [...messages]
      .reverse()
      .findIndex((m) => m.role === "user");
    if (lastUserMessageIndex === -1) return;

    const actualIndex = messages.length - 1 - lastUserMessageIndex;
    const lastUserMessage = messages[actualIndex];

    // Remove the last assistant message
    const updatedMessages = messages.slice(0, -1);
    updateConversation(conversationId, { messages: updatedMessages });

    // Resend the last user message
    await sendMessage(lastUserMessage.content);
  }, [messages, isStreaming, conversationId, sendMessage, updateConversation]);

  return {
    conversation,
    messages,
    isStreaming,
    error,
    sendMessage,
    regenerateLastResponse,
  };
}
