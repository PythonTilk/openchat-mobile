import type { Model } from "../types";

export const PUTER_API_BASE = "https://api.puter.com";
export const PUTER_AUTH_URL = "https://puter.com";

export const STORAGE_KEYS = {
  PUTER_TOKEN: "puter_token",
  OPEN_WEBUI_TOKEN: "open_webui_token",
  SERVER_URL: "server_url",
  THEME: "theme",
  CONVERSATIONS: "conversations",
} as const;

export const PUTER_MODELS: Model[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    owned_by: "openai",
    description: "Most capable OpenAI model",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    owned_by: "openai",
    description: "Faster, more affordable GPT-4",
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    owned_by: "anthropic",
    description: "Balanced performance and speed",
  },
  {
    id: "claude-3-5-haiku",
    name: "Claude 3.5 Haiku",
    owned_by: "anthropic",
    description: "Fast and efficient",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    owned_by: "google",
    description: "Google's latest fast model",
  },
  {
    id: "deepseek-chat",
    name: "DeepSeek Chat",
    owned_by: "deepseek",
    description: "General conversation model",
  },
  {
    id: "deepseek-reasoner",
    name: "DeepSeek Reasoner",
    owned_by: "deepseek",
    description: "Enhanced reasoning capabilities",
  },
];

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
