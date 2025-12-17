import axios from "axios";
import type {
  Message,
  Conversation,
  ChatCompletionResponse,
  Model,
} from "../types";

export const createOpenWebUIChatService = (baseUrl: string, token: string) => {
  const client = axios.create({
    baseURL: baseUrl,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return {
    /**
     * List all conversations
     */
    async listConversations(): Promise<Conversation[]> {
      const response = await client.get("/api/v1/chats/list");
      return response.data;
    },

    /**
     * Get a single conversation with messages
     */
    async getConversation(chatId: string): Promise<Conversation> {
      const response = await client.get(`/api/v1/chats/${chatId}`);
      return response.data;
    },

    /**
     * Create a new conversation
     */
    async createConversation(title: string): Promise<Conversation> {
      const response = await client.post("/api/v1/chats/new", {
        chat: { title },
      });
      return response.data;
    },

    /**
     * Delete a conversation
     */
    async deleteConversation(chatId: string): Promise<void> {
      await client.delete(`/api/v1/chats/${chatId}`);
    },

    /**
     * Send a chat message (non-streaming)
     */
    async chat(
      model: string,
      messages: Message[],
    ): Promise<ChatCompletionResponse> {
      const response = await client.post("/api/chat/completions", {
        model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: false,
      });
      return response.data;
    },

    /**
     * Get available models
     */
    async getModels(): Promise<Model[]> {
      const response = await client.get("/api/models");
      return response.data.data || response.data;
    },
  };
};
