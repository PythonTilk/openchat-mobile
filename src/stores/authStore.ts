import { create } from "zustand";
import { storage } from "../services/storage";
import type { User, PuterUser } from "../types";

interface AuthState {
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

  // Loading state
  isHydrated: boolean;
}

interface AuthActions {
  // Puter actions
  setPuterAuth: (token: string, user: PuterUser) => Promise<void>;
  clearPuterAuth: () => Promise<void>;

  // Open-WebUI actions
  setOpenWebUIAuth: (token: string, user: User) => Promise<void>;
  clearOpenWebUIAuth: () => Promise<void>;

  // Server config
  setServerUrl: (url: string) => Promise<void>;
  clearServerUrl: () => Promise<void>;

  // Initialize from storage
  hydrate: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  // Initial state
  puterToken: null,
  puterUser: null,
  isPuterAuthenticated: false,

  openWebUIToken: null,
  openWebUIUser: null,
  isOpenWebUIAuthenticated: false,

  serverUrl: null,
  isHydrated: false,

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
    await storage.deletePuterToken();
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
    await storage.deleteOpenWebUIToken();
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

  clearServerUrl: async () => {
    await storage.deleteServerUrl();
    set({ serverUrl: null });
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
      isHydrated: true,
    });
  },
}));
