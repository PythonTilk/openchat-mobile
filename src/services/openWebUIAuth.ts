import axios from "axios";
import type {
  User,
  LoginRequest,
  LoginResponse,
  SignupRequest,
} from "../types";

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
