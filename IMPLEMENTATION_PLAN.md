# OpenChat Mobile - Implementation Plan

This document provides a comprehensive, step-by-step implementation guide for building the OpenChat mobile app. It is designed to be AI-readable and actionable.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Phase 1: Project Setup](#phase-1-project-setup)
3. [Phase 2: Core Infrastructure](#phase-2-core-infrastructure)
4. [Phase 3: Authentication](#phase-3-authentication)
5. [Phase 4: Chat Implementation](#phase-4-chat-implementation)
6. [Phase 5: UI Polish](#phase-5-ui-polish)
7. [Phase 6: Testing & Deployment](#phase-6-testing--deployment)

---

## Project Overview

### Goal

Build a React Native mobile app that:

1. Provides free AI chat via Puter.js (default, no login required)
2. Optionally connects to Open-WebUI backends for full features
3. Syncs conversations when logged into Open-WebUI

### Key Design Decisions

| Decision              | Choice                     | Rationale                     |
| --------------------- | -------------------------- | ----------------------------- |
| Puter is DEFAULT      | Users can chat immediately | Lower barrier to entry        |
| No default server     | Users configure their own  | Privacy, self-hosting support |
| Expo managed workflow | Simpler development        | Faster iteration, OTA updates |

---

## Phase 1: Project Setup

### 1.1 Initialize Expo Project

```bash
cd /home/tilk/github/openchat-mobile
npx create-expo-app@latest . --template expo-template-blank-typescript
```

### 1.2 Install Dependencies

```bash
# Navigation
npx expo install expo-router expo-linking expo-constants expo-status-bar

# State & Data
npm install zustand @tanstack/react-query axios

# UI
npm install nativewind tailwindcss
npx expo install react-native-reanimated react-native-gesture-handler react-native-safe-area-context react-native-screens

# Storage & Auth
npx expo install expo-secure-store expo-web-browser

# WebView (for Puter auth)
npx expo install react-native-webview

# Streaming
npm install react-native-sse

# Lists
npm install @shopify/flash-list

# Icons
npx expo install @expo/vector-icons
```

### 1.3 Configure NativeWind

Create `tailwind.config.js`:

```javascript
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

Create `global.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Update `babel.config.js`:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["nativewind/babel"],
  };
};
```

### 1.4 Configure Expo Router

Update `app.json`:

```json
{
  "expo": {
    "name": "OpenChat",
    "slug": "openchat-mobile",
    "scheme": "openchat",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "plugins": ["expo-router", "expo-secure-store"],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

### 1.5 Create Directory Structure

```
mkdir -p src/{api,components,hooks,stores,services,types,constants}
mkdir -p src/components/{chat,common,auth}
mkdir -p app/{(auth),(tabs),chat}
```

---

## Phase 2: Core Infrastructure

### 2.1 TypeScript Types

Create `src/types/index.ts`:

```typescript
// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  profile_image_url?: string;
}

// Auth types
export interface AuthState {
  // Puter auth
  puterToken: string | null;
  puterUser: PuterUser | null;
  isPuterAuthenticated: boolean;

  // Open-WebUI auth
  openWebUIToken: string | null;
  openWebUIUser: User | null;
  isOpenWebUIAuthenticated: boolean;

  // Server config
  serverUrl: string | null;
}

export interface PuterUser {
  username: string;
  uuid: string;
  email?: string;
}

// Model types
export interface Model {
  id: string;
  name: string;
  owned_by?: string;
  description?: string;
  capabilities?: string[];
}

// Chat types
export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  model?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  created_at: Date;
  updated_at: Date;
}

// API Response types
export interface ChatCompletionResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamChunk {
  id: string;
  choices: {
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason: string | null;
  }[];
}
```

### 2.2 Constants

Create `src/constants/index.ts`:

```typescript
export const PUTER_API_BASE = "https://api.puter.com";
export const PUTER_AUTH_URL = "https://puter.com";

export const STORAGE_KEYS = {
  PUTER_TOKEN: "puter_token",
  OPEN_WEBUI_TOKEN: "open_webui_token",
  SERVER_URL: "server_url",
  THEME: "theme",
  CONVERSATIONS: "conversations",
} as const;

export const DEFAULT_MODELS = {
  PUTER: [
    { id: "gpt-4o", name: "GPT-4o", owned_by: "openai" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", owned_by: "openai" },
    {
      id: "claude-3-5-sonnet",
      name: "Claude 3.5 Sonnet",
      owned_by: "anthropic",
    },
    { id: "claude-3-5-haiku", name: "Claude 3.5 Haiku", owned_by: "anthropic" },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", owned_by: "google" },
    { id: "deepseek-chat", name: "DeepSeek Chat", owned_by: "deepseek" },
    {
      id: "deepseek-reasoner",
      name: "DeepSeek Reasoner",
      owned_by: "deepseek",
    },
  ],
} as const;

export const THEME = {
  light: {
    background: "#ffffff",
    surface: "#f5f5f5",
    primary: "#3b82f6",
    text: "#1f2937",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
    userBubble: "#3b82f6",
    assistantBubble: "#f3f4f6",
  },
  dark: {
    background: "#111827",
    surface: "#1f2937",
    primary: "#3b82f6",
    text: "#f9fafb",
    textSecondary: "#9ca3af",
    border: "#374151",
    userBubble: "#3b82f6",
    assistantBubble: "#374151",
  },
} as const;
```

### 2.3 Secure Storage Service

Create `src/services/storage.ts`:

```typescript
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "../constants";

export const storage = {
  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
    }
  },

  async delete(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error deleting ${key}:`, error);
    }
  },

  // Typed helpers
  async getPuterToken(): Promise<string | null> {
    return this.get(STORAGE_KEYS.PUTER_TOKEN);
  },

  async setPuterToken(token: string): Promise<void> {
    return this.set(STORAGE_KEYS.PUTER_TOKEN, token);
  },

  async getOpenWebUIToken(): Promise<string | null> {
    return this.get(STORAGE_KEYS.OPEN_WEBUI_TOKEN);
  },

  async setOpenWebUIToken(token: string): Promise<void> {
    return this.set(STORAGE_KEYS.OPEN_WEBUI_TOKEN, token);
  },

  async getServerUrl(): Promise<string | null> {
    return this.get(STORAGE_KEYS.SERVER_URL);
  },

  async setServerUrl(url: string): Promise<void> {
    return this.set(STORAGE_KEYS.SERVER_URL, url);
  },
};
```

### 2.4 Zustand Stores

Create `src/stores/authStore.ts`:

```typescript
import { create } from "zustand";
import { storage } from "../services/storage";
import type { AuthState, User, PuterUser } from "../types";

interface AuthStore extends AuthState {
  // Puter actions
  setPuterAuth: (token: string, user: PuterUser) => Promise<void>;
  clearPuterAuth: () => Promise<void>;

  // Open-WebUI actions
  setOpenWebUIAuth: (token: string, user: User) => Promise<void>;
  clearOpenWebUIAuth: () => Promise<void>;

  // Server config
  setServerUrl: (url: string) => Promise<void>;

  // Initialize from storage
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  puterToken: null,
  puterUser: null,
  isPuterAuthenticated: false,

  openWebUIToken: null,
  openWebUIUser: null,
  isOpenWebUIAuthenticated: false,

  serverUrl: null,

  // Puter actions
  setPuterAuth: async (token, user) => {
    await storage.setPuterToken(token);
    set({
      puterToken: token,
      puterUser: user,
      isPuterAuthenticated: true,
    });
  },

  clearPuterAuth: async () => {
    await storage.delete("puter_token");
    set({
      puterToken: null,
      puterUser: null,
      isPuterAuthenticated: false,
    });
  },

  // Open-WebUI actions
  setOpenWebUIAuth: async (token, user) => {
    await storage.setOpenWebUIToken(token);
    set({
      openWebUIToken: token,
      openWebUIUser: user,
      isOpenWebUIAuthenticated: true,
    });
  },

  clearOpenWebUIAuth: async () => {
    await storage.delete("open_webui_token");
    set({
      openWebUIToken: null,
      openWebUIUser: null,
      isOpenWebUIAuthenticated: false,
    });
  },

  // Server config
  setServerUrl: async (url) => {
    await storage.setServerUrl(url);
    set({ serverUrl: url });
  },

  // Hydrate from storage
  hydrate: async () => {
    const [puterToken, openWebUIToken, serverUrl] = await Promise.all([
      storage.getPuterToken(),
      storage.getOpenWebUIToken(),
      storage.getServerUrl(),
    ]);

    set({
      puterToken,
      isPuterAuthenticated: !!puterToken,
      openWebUIToken,
      isOpenWebUIAuthenticated: !!openWebUIToken,
      serverUrl,
    });
  },
}));
```

Create `src/stores/chatStore.ts`:

```typescript
import { create } from "zustand";
import type { Conversation, Message, Model } from "../types";
import { DEFAULT_MODELS } from "../constants";

interface ChatStore {
  // State
  conversations: Conversation[];
  currentConversationId: string | null;
  selectedModel: Model;
  availableModels: Model[];
  isStreaming: boolean;
  streamingContent: string;

  // Actions
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
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  conversations: [],
  currentConversationId: null,
  selectedModel: DEFAULT_MODELS.PUTER[0],
  availableModels: [...DEFAULT_MODELS.PUTER],
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
}));
```

---

## Phase 3: Authentication

### 3.1 Puter Auth Service

Create `src/services/puterAuth.ts`:

```typescript
import { PUTER_API_BASE, PUTER_AUTH_URL } from "../constants";

export interface PuterAuthResult {
  token: string;
  user: {
    username: string;
    uuid: string;
    email?: string;
  };
}

export const puterAuth = {
  /**
   * Get the URL for Puter sign-in popup
   */
  getSignInUrl(): string {
    return `${PUTER_AUTH_URL}/action/sign-in?embedded_in_popup=true`;
  },

  /**
   * Validate a Puter token by calling /whoami
   */
  async validateToken(token: string): Promise<PuterAuthResult["user"] | null> {
    try {
      const response = await fetch(`${PUTER_API_BASE}/whoami`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        username: data.username,
        uuid: data.uuid,
        email: data.email,
      };
    } catch (error) {
      console.error("Failed to validate Puter token:", error);
      return null;
    }
  },

  /**
   * JavaScript to inject into WebView to capture auth token
   */
  getWebViewInjectedJS(): string {
    return `
      (function() {
        // Listen for postMessage from Puter auth
        window.addEventListener('message', function(event) {
          if (event.origin === '${PUTER_AUTH_URL}') {
            try {
              const data = typeof event.data === 'string' 
                ? JSON.parse(event.data) 
                : event.data;
              
              if (data.msg === 'puter.token' && data.token) {
                // Send token to React Native
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'puter_auth_success',
                  token: data.token,
                }));
              }
            } catch (e) {
              console.error('Error parsing auth message:', e);
            }
          }
        });

        // Also check for token in URL hash (fallback)
        if (window.location.hash.includes('token=')) {
          const params = new URLSearchParams(window.location.hash.slice(1));
          const token = params.get('token');
          if (token) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'puter_auth_success',
              token: token,
            }));
          }
        }
      })();
      true;
    `;
  },
};
```

### 3.2 Open-WebUI Auth Service

Create `src/services/openWebUIAuth.ts`:

```typescript
import axios from "axios";
import type { User } from "../types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  token_type: string;
  user: User;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export const createOpenWebUIAuthService = (baseUrl: string) => {
  const client = axios.create({
    baseURL: baseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return {
    /**
     * Sign in to Open-WebUI
     */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
      const response = await client.post("/api/v1/auths/signin", credentials);
      return response.data;
    },

    /**
     * Sign up for Open-WebUI
     */
    async signup(data: SignupRequest): Promise<LoginResponse> {
      const response = await client.post("/api/v1/auths/signup", data);
      return response.data;
    },

    /**
     * Get current user info
     */
    async getCurrentUser(token: string): Promise<User> {
      const response = await client.get("/api/v1/auths/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },

    /**
     * Validate token by getting user info
     */
    async validateToken(token: string): Promise<User | null> {
      try {
        return await this.getCurrentUser(token);
      } catch (error) {
        return null;
      }
    },
  };
};
```

### 3.3 Puter Auth Screen (WebView)

Create `app/(auth)/puter-auth.tsx`:

```typescript
import React, { useCallback, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { puterAuth } from '../../src/services/puterAuth';

export default function PuterAuthScreen() {
  const webViewRef = useRef<WebView>(null);
  const { setPuterAuth } = useAuthStore();

  const handleMessage = useCallback(async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'puter_auth_success' && data.token) {
        // Validate token and get user info
        const user = await puterAuth.validateToken(data.token);

        if (user) {
          await setPuterAuth(data.token, user);
          router.replace('/(tabs)');
        } else {
          console.error('Failed to validate Puter token');
        }
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  }, [setPuterAuth]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: puterAuth.getSignInUrl() }}
        injectedJavaScript={puterAuth.getWebViewInjectedJS()}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
```

---

## Phase 4: Chat Implementation

### 4.1 Puter Chat Service

Create `src/services/puterChat.ts`:

```typescript
import { PUTER_API_BASE } from "../constants";
import type { Message, ChatCompletionResponse } from "../types";

interface PuterChatRequest {
  model: string;
  messages: { role: string; content: string }[];
  stream?: boolean;
}

export const createPuterChatService = (token: string | null) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return {
    /**
     * Send a non-streaming chat request
     */
    async chat(
      model: string,
      messages: Message[],
    ): Promise<ChatCompletionResponse> {
      const response = await fetch(`${PUTER_API_BASE}/drivers/call`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          interface: "puter-chat-completion",
          driver: model.includes("claude")
            ? "claude"
            : model.includes("gpt")
              ? "openai-completion"
              : model.includes("gemini")
                ? "google-ai"
                : model.includes("deepseek")
                  ? "deepseek"
                  : "openai-completion",
          method: "complete",
          args: {
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Puter API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        id: data.id || `puter-${Date.now()}`,
        choices: [
          {
            message: {
              role: "assistant",
              content:
                data.message?.content || data.result?.message?.content || "",
            },
            finish_reason: "stop",
          },
        ],
        model,
      };
    },

    /**
     * Send a streaming chat request
     * Returns an async generator that yields content chunks
     */
    async *streamChat(
      model: string,
      messages: Message[],
    ): AsyncGenerator<string, void, unknown> {
      const response = await fetch(`${PUTER_API_BASE}/drivers/call`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          interface: "puter-chat-completion",
          driver: model.includes("claude")
            ? "claude"
            : model.includes("gpt")
              ? "openai-completion"
              : model.includes("gemini")
                ? "google-ai"
                : model.includes("deepseek")
                  ? "deepseek"
                  : "openai-completion",
          method: "complete",
          args: {
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            stream: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Puter API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") return;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    },
  };
};
```

### 4.2 Open-WebUI Chat Service

Create `src/services/openWebUIChat.ts`:

```typescript
import axios from "axios";
import type { Message, Conversation, ChatCompletionResponse } from "../types";

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
    async getModels(): Promise<{ id: string; name: string }[]> {
      const response = await client.get("/api/models");
      return response.data.data || response.data;
    },
  };
};
```

### 4.3 Chat Screen Component

Create `app/chat/[id].tsx`:

```typescript
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../../src/stores/chatStore';
import { useAuthStore } from '../../src/stores/authStore';
import { createPuterChatService } from '../../src/services/puterChat';
import { MessageBubble } from '../../src/components/chat/MessageBubble';
import type { Message } from '../../src/types';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inputText, setInputText] = useState('');
  const listRef = useRef<FlashList<Message>>(null);

  const {
    conversations,
    selectedModel,
    isStreaming,
    streamingContent,
    addMessage,
    setIsStreaming,
    appendStreamingContent,
    clearStreamingContent,
    updateLastMessage,
  } = useChatStore();

  const { puterToken } = useAuthStore();

  const conversation = conversations.find((c) => c.id === id);
  const messages = conversation?.messages || [];

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isStreaming) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    // Add user message
    addMessage(id!, userMessage);
    setInputText('');

    // Create placeholder assistant message
    const assistantMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      model: selectedModel.id,
    };
    addMessage(id!, assistantMessage);

    // Start streaming
    setIsStreaming(true);
    clearStreamingContent();

    try {
      const chatService = createPuterChatService(puterToken);
      const allMessages = [...messages, userMessage];

      let fullContent = '';
      for await (const chunk of chatService.streamChat(
        selectedModel.id,
        allMessages
      )) {
        fullContent += chunk;
        appendStreamingContent(chunk);
        updateLastMessage(id!, fullContent);
      }
    } catch (error) {
      console.error('Chat error:', error);
      updateLastMessage(id!, 'Sorry, an error occurred. Please try again.');
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
  ]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, streamingContent]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen
        options={{
          title: conversation?.title || 'Chat',
          headerBackTitle: 'Back',
        }}
      />

      <View style={styles.messagesContainer}>
        <FlashList
          ref={listRef}
          data={messages}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isStreaming={
                isStreaming &&
                item.id === messages[messages.length - 1]?.id &&
                item.role === 'assistant'
              }
            />
          )}
          estimatedItemSize={100}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
            color={!inputText.trim() || isStreaming ? '#9ca3af' : '#ffffff'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  messagesContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
});
```

### 4.4 Message Bubble Component

Create `src/components/chat/MessageBubble.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user';

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
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text
          style={[
            styles.text,
            isUser ? styles.userText : styles.assistantText,
          ]}
        >
          {message.content}
          {isStreaming && <Text style={styles.cursor}>|</Text>}
        </Text>
      </View>
      {message.model && !isUser && (
        <Text style={styles.modelLabel}>{message.model}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#f3f4f6',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  assistantText: {
    color: '#1f2937',
  },
  cursor: {
    opacity: 0.5,
  },
  modelLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
    marginLeft: 8,
  },
});
```

---

## Phase 5: UI Polish

### 5.1 Navigation Setup

Create `app/_layout.tsx`:

```typescript
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../src/stores/authStore';

export default function RootLayout() {
  const { hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="chat/[id]"
        options={{
          headerShown: true,
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
```

Create `app/(tabs)/_layout.tsx`:

```typescript
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="models"
        options={{
          title: 'Models',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### 5.2 Welcome/Home Screen

Create `app/(auth)/index.tsx`:

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chatbubbles" size={80} color="#3b82f6" />
        <Text style={styles.title}>OpenChat</Text>
        <Text style={styles.subtitle}>
          Chat with AI models for free
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Ionicons name="flash" size={24} color="#ffffff" />
          <Text style={styles.primaryButtonText}>
            Start Chatting (Free)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/puter-auth')}
        >
          <Ionicons name="person-circle-outline" size={24} color="#3b82f6" />
          <Text style={styles.secondaryButtonText}>
            Sign in with Puter
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.textButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.textButtonText}>
            Connect to Open-WebUI Server
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Powered by Puter.js free AI models
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 100,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#3b82f6',
    fontSize: 18,
    fontWeight: '600',
  },
  textButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  textButtonText: {
    color: '#6b7280',
    fontSize: 16,
  },
  footer: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
  },
});
```

---

## Phase 6: Testing & Deployment

### 6.1 Testing Checklist

- [ ] Puter auth flow works on iOS
- [ ] Puter auth flow works on Android
- [ ] Chat streaming works correctly
- [ ] Model selection persists
- [ ] Conversations persist locally
- [ ] Open-WebUI login works
- [ ] Conversation sync with Open-WebUI works
- [ ] Dark mode renders correctly
- [ ] Keyboard handling is smooth

### 6.2 Build Commands

```bash
# Development
npx expo start

# iOS build
npx expo build:ios

# Android build
npx expo build:android

# EAS Build (recommended)
npx eas build --platform ios
npx eas build --platform android
```

### 6.3 Environment Variables

Create `.env.example`:

```
# Optional: Default Open-WebUI server URL
EXPO_PUBLIC_DEFAULT_SERVER_URL=

# Optional: Analytics
EXPO_PUBLIC_ANALYTICS_ID=
```

---

## Implementation Order

For AI agents implementing this project, follow this order:

1. **Phase 1** - Project setup (30 min)
2. **Phase 2** - Core infrastructure (1 hour)
3. **Phase 3** - Authentication (1 hour)
4. **Phase 4** - Chat implementation (2 hours)
5. **Phase 5** - UI polish (1 hour)
6. **Phase 6** - Testing & deployment (1 hour)

**Total estimated time: 6-8 hours**

---

## Key Files Summary

| File                                    | Purpose                         |
| --------------------------------------- | ------------------------------- |
| `src/stores/authStore.ts`               | Authentication state management |
| `src/stores/chatStore.ts`               | Chat and conversation state     |
| `src/services/puterAuth.ts`             | Puter authentication logic      |
| `src/services/puterChat.ts`             | Puter chat API client           |
| `src/services/openWebUIAuth.ts`         | Open-WebUI auth client          |
| `src/services/openWebUIChat.ts`         | Open-WebUI chat client          |
| `app/(auth)/puter-auth.tsx`             | Puter WebView auth screen       |
| `app/chat/[id].tsx`                     | Main chat screen                |
| `src/components/chat/MessageBubble.tsx` | Chat message component          |
