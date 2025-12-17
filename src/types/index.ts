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

// Login types
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
