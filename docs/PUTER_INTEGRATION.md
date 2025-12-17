# Puter.js Integration Guide

This document details the integration of Puter.js free AI models into the OpenChat mobile application.

## Overview

Puter.js provides free access to various AI models including:

- **GPT-4o** and **GPT-4o Mini** (OpenAI)
- **Claude 3.5 Sonnet** and **Claude 3.5 Haiku** (Anthropic)
- **Gemini 2.0 Flash** (Google)
- **DeepSeek Chat** and **DeepSeek Reasoner** (DeepSeek)

These models are available through Puter's driver-based API system.

## Authentication Flow

### Why WebView Authentication?

Puter uses a popup-based OAuth flow that requires a web browser context. In React Native, we simulate this using a WebView component.

### Authentication Sequence

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Mobile    │     │   WebView   │     │   Puter     │
│     App     │     │             │     │   Server    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │  Open WebView     │                   │
       │──────────────────▶│                   │
       │                   │                   │
       │                   │  Load sign-in URL │
       │                   │──────────────────▶│
       │                   │                   │
       │                   │  Render login form│
       │                   │◀──────────────────│
       │                   │                   │
       │                   │  User enters      │
       │                   │  credentials      │
       │                   │──────────────────▶│
       │                   │                   │
       │                   │  Validate &       │
       │                   │  create token     │
       │                   │◀──────────────────│
       │                   │                   │
       │                   │  postMessage      │
       │                   │  with token       │
       │   onMessage       │◀─────────────────┐│
       │◀──────────────────│                   │
       │                   │                   │
       │  Store token      │                   │
       │  securely         │                   │
       │                   │                   │
       │  Validate token   │                   │
       │─────────────────────────────────────▶│
       │                   │                   │
       │  User info        │                   │
       │◀─────────────────────────────────────│
       │                   │                   │
       │  Close WebView    │                   │
       │  Navigate to app  │                   │
       │                   │                   │
```

### Implementation

#### 1. Auth URL Construction

```typescript
// src/services/puterAuth.ts
export const PUTER_AUTH_URL = "https://puter.com";

export function getSignInUrl(): string {
  return `${PUTER_AUTH_URL}/action/sign-in?embedded_in_popup=true`;
}
```

The `embedded_in_popup=true` parameter tells Puter to:

- Use a minimal UI suitable for embedding
- Send the token via `postMessage` instead of redirecting

#### 2. WebView Setup

```typescript
// app/(auth)/puter-auth.tsx
import { WebView } from 'react-native-webview';

export default function PuterAuthScreen() {
  const handleMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'puter_auth_success') {
      // Handle token
    }
  };

  return (
    <WebView
      source={{ uri: getSignInUrl() }}
      injectedJavaScript={getWebViewInjectedJS()}
      onMessage={handleMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
    />
  );
}
```

#### 3. JavaScript Injection

We inject JavaScript to capture the authentication token:

```typescript
// src/services/puterAuth.ts
export function getWebViewInjectedJS(): string {
  return `
    (function() {
      // Listen for postMessage from Puter
      window.addEventListener('message', function(event) {
        if (event.origin === 'https://puter.com') {
          try {
            const data = typeof event.data === 'string' 
              ? JSON.parse(event.data) 
              : event.data;
            
            if (data.msg === 'puter.token' && data.token) {
              // Forward to React Native
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

      // Also check URL hash (fallback method)
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
    true; // Required for injectedJavaScript
  `;
}
```

#### 4. Token Validation

After receiving the token, validate it with the `/whoami` endpoint:

```typescript
// src/services/puterAuth.ts
export async function validateToken(token: string): Promise<PuterUser | null> {
  try {
    const response = await fetch("https://api.puter.com/whoami", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      username: data.username,
      uuid: data.uuid,
      email: data.email,
    };
  } catch (error) {
    return null;
  }
}
```

## Chat API Integration

### Puter Driver API

Puter uses a "driver" system for AI models. Each provider has a driver:

| Driver Name         | Models                              |
| ------------------- | ----------------------------------- |
| `openai-completion` | gpt-4o, gpt-4o-mini                 |
| `claude`            | claude-3-5-sonnet, claude-3-5-haiku |
| `google-ai`         | gemini-2.0-flash                    |
| `deepseek`          | deepseek-chat, deepseek-reasoner    |

### API Endpoint

**POST** `https://api.puter.com/drivers/call`

### Request Format

```json
{
  "interface": "puter-chat-completion",
  "driver": "openai-completion",
  "method": "complete",
  "args": {
    "messages": [{ "role": "user", "content": "Hello!" }],
    "stream": false
  }
}
```

### Response Format (Non-streaming)

```json
{
  "success": true,
  "result": {
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help you today?"
    }
  }
}
```

### Streaming Response

When `stream: true`, the response is Server-Sent Events:

```
data: {"choices":[{"delta":{"content":"Hello"}}]}

data: {"choices":[{"delta":{"content":"!"}}]}

data: {"choices":[{"delta":{"content":" How"}}]}

data: [DONE]
```

### Implementation

```typescript
// src/services/puterChat.ts
export function createPuterChatService(token: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return {
    async chat(model: string, messages: Message[]) {
      const driver = getDriverForModel(model);

      const response = await fetch("https://api.puter.com/drivers/call", {
        method: "POST",
        headers,
        body: JSON.stringify({
          interface: "puter-chat-completion",
          driver,
          method: "complete",
          args: {
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          },
        }),
      });

      const data = await response.json();
      return {
        id: `puter-${Date.now()}`,
        choices: [
          {
            message: {
              role: "assistant",
              content: data.result?.message?.content || "",
            },
            finish_reason: "stop",
          },
        ],
        model,
      };
    },

    async *streamChat(model: string, messages: Message[]) {
      const driver = getDriverForModel(model);

      const response = await fetch("https://api.puter.com/drivers/call", {
        method: "POST",
        headers,
        body: JSON.stringify({
          interface: "puter-chat-completion",
          driver,
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

      const reader = response.body?.getReader();
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
              if (content) yield content;
            } catch {}
          }
        }
      }
    },
  };
}

function getDriverForModel(model: string): string {
  if (model.includes("claude")) return "claude";
  if (model.includes("gpt")) return "openai-completion";
  if (model.includes("gemini")) return "google-ai";
  if (model.includes("deepseek")) return "deepseek";
  return "openai-completion"; // default
}
```

## Using Puter Without Authentication

Puter allows limited access without authentication. Users can chat without signing in, but:

- No conversation history is saved on Puter's servers
- Rate limits may be more restrictive
- Some features may be unavailable

To support unauthenticated usage:

```typescript
// Create service without token
const chatService = createPuterChatService(null);

// API calls still work
const response = await chatService.chat("gpt-4o", messages);
```

## Token Storage

Tokens are stored securely using `expo-secure-store`:

```typescript
// src/services/storage.ts
import * as SecureStore from "expo-secure-store";

export async function setPuterToken(token: string): Promise<void> {
  await SecureStore.setItemAsync("puter_token", token);
}

export async function getPuterToken(): Promise<string | null> {
  return SecureStore.getItemAsync("puter_token");
}

export async function clearPuterToken(): Promise<void> {
  await SecureStore.deleteItemAsync("puter_token");
}
```

## Token Expiration

Puter tokens have an expiration time. Handle expiration gracefully:

```typescript
async function makeAuthenticatedRequest(token: string) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    // Token expired - clear and prompt re-auth
    await clearPuterToken();
    throw new TokenExpiredError();
  }

  return response.json();
}
```

## Error Handling

### Common Errors

| Error            | Cause                 | Solution                             |
| ---------------- | --------------------- | ------------------------------------ |
| 401 Unauthorized | Invalid/expired token | Clear token, prompt re-auth          |
| 429 Rate Limited | Too many requests     | Show rate limit message, retry later |
| 500 Server Error | Puter API issue       | Retry with exponential backoff       |
| Network Error    | No connection         | Show offline message                 |

### Error Handling Implementation

```typescript
try {
  const response = await chatService.chat(model, messages);
  return response;
} catch (error) {
  if (error.status === 401) {
    // Handle auth error
    await authStore.clearPuterAuth();
    router.push("/(auth)/puter-auth");
    throw new Error("Please sign in again");
  }

  if (error.status === 429) {
    throw new Error("Rate limited. Please wait a moment.");
  }

  if (!navigator.onLine) {
    throw new Error("No internet connection");
  }

  throw new Error("Something went wrong. Please try again.");
}
```

## Available Models

```typescript
// src/constants/index.ts
export const PUTER_MODELS = [
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
```

## Testing Puter Integration

### Manual Testing Checklist

- [ ] WebView loads Puter sign-in page
- [ ] User can enter credentials
- [ ] Token is captured after successful sign-in
- [ ] Token is stored securely
- [ ] Token validation works (whoami endpoint)
- [ ] Chat without auth works (limited mode)
- [ ] Chat with auth works
- [ ] Streaming responses display correctly
- [ ] Token expiration is handled
- [ ] Rate limiting is handled gracefully

### Test Script

```typescript
// Test Puter chat
async function testPuterChat() {
  const chatService = createPuterChatService(null);

  const response = await chatService.chat("gpt-4o-mini", [
    { role: "user", content: 'Say "Hello, test!"' },
  ]);

  console.log("Response:", response.choices[0].message.content);
  // Expected: Contains "Hello, test!"
}
```

## Security Considerations

1. **Token Security**: Always use `expo-secure-store` for token storage
2. **HTTPS Only**: All Puter API calls use HTTPS
3. **Input Sanitization**: Sanitize user input before sending to API
4. **Error Messages**: Don't expose tokens in error messages or logs
5. **WebView Security**: Use `originWhitelist` to restrict WebView navigation

```typescript
<WebView
  source={{ uri: getSignInUrl() }}
  originWhitelist={['https://puter.com', 'https://*.puter.com']}
  // ... other props
/>
```
