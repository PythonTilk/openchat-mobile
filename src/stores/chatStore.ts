import { create } from "zustand";
import type { Conversation, Message, Model } from "../types";
import { PUTER_MODELS } from "../constants";

interface ChatState {
  // State
  conversations: Conversation[];
  currentConversationId: string | null;
  selectedModel: Model;
  availableModels: Model[];
  isStreaming: boolean;
  streamingContent: string;
}

interface ChatActions {
  // Conversation actions
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  setCurrentConversation: (id: string | null) => void;

  // Message actions
  addMessage: (conversationId: string, message: Message) => void;
  updateLastMessage: (conversationId: string, content: string) => void;

  // Model actions
  setSelectedModel: (model: Model) => void;
  setAvailableModels: (models: Model[]) => void;

  // Streaming
  setIsStreaming: (streaming: boolean) => void;
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (chunk: string) => void;
  clearStreamingContent: () => void;

  // Helpers
  createNewConversation: (title?: string) => Conversation;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  conversations: [],
  currentConversationId: null,
  selectedModel: PUTER_MODELS[0],
  availableModels: [...PUTER_MODELS],
  isStreaming: false,
  streamingContent: "",

  // Conversation actions
  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    })),

  deleteConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      currentConversationId:
        state.currentConversationId === id ? null : state.currentConversationId,
    })),

  setCurrentConversation: (id) => set({ currentConversationId: id }),

  // Message actions
  addMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message], updated_at: new Date() }
          : c,
      ),
    })),

  updateLastMessage: (conversationId, content) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: c.messages.map((m, i) =>
                i === c.messages.length - 1 ? { ...m, content } : m,
              ),
            }
          : c,
      ),
    })),

  // Model actions
  setSelectedModel: (model) => set({ selectedModel: model }),
  setAvailableModels: (models) => set({ availableModels: models }),

  // Streaming
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  setStreamingContent: (content) => set({ streamingContent: content }),
  appendStreamingContent: (chunk) =>
    set((state) => ({
      streamingContent: state.streamingContent + chunk,
    })),
  clearStreamingContent: () => set({ streamingContent: "" }),

  // Helpers
  createNewConversation: (title) => {
    const { selectedModel } = get();
    const conversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: title || "New Chat",
      messages: [],
      model: selectedModel.id,
      created_at: new Date(),
      updated_at: new Date(),
    };
    get().addConversation(conversation);
    get().setCurrentConversation(conversation.id);
    return conversation;
  },
}));
