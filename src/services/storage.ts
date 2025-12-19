import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants";
import type { Conversation } from "../types";

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

  async deletePuterToken(): Promise<void> {
    return this.delete(STORAGE_KEYS.PUTER_TOKEN);
  },

  async getOpenWebUIToken(): Promise<string | null> {
    return this.get(STORAGE_KEYS.OPEN_WEBUI_TOKEN);
  },

  async setOpenWebUIToken(token: string): Promise<void> {
    return this.set(STORAGE_KEYS.OPEN_WEBUI_TOKEN, token);
  },

  async deleteOpenWebUIToken(): Promise<void> {
    return this.delete(STORAGE_KEYS.OPEN_WEBUI_TOKEN);
  },

  async getServerUrl(): Promise<string | null> {
    return this.get(STORAGE_KEYS.SERVER_URL);
  },

  async setServerUrl(url: string): Promise<void> {
    return this.set(STORAGE_KEYS.SERVER_URL, url);
  },

  async deleteServerUrl(): Promise<void> {
    return this.delete(STORAGE_KEYS.SERVER_URL);
  },

  // Conversation storage (uses AsyncStorage for larger data)
  async getConversations(): Promise<Conversation[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (!data) return [];
      const conversations = JSON.parse(data);
      // Restore Date objects
      return conversations.map((c: Conversation) => ({
        ...c,
        created_at: new Date(c.created_at),
        updated_at: new Date(c.updated_at),
        messages: c.messages.map((m) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
      }));
    } catch (error) {
      console.error("Error getting conversations:", error);
      return [];
    }
  },

  async setConversations(conversations: Conversation[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CONVERSATIONS,
        JSON.stringify(conversations),
      );
    } catch (error) {
      console.error("Error saving conversations:", error);
    }
  },

  async deleteConversations(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
    } catch (error) {
      console.error("Error deleting conversations:", error);
    }
  },
};
