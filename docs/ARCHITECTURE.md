# OpenChat Mobile - Architecture

This document describes the system architecture, data flow, and design decisions for the OpenChat mobile application.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      OpenChat Mobile App                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Screens   │  │   Stores    │  │       Services          │  │
│  │  (Expo      │◄─┤  (Zustand)  │◄─┤  (API Clients)          │  │
│  │   Router)   │  │             │  │                         │  │
│  └─────────────┘  └─────────────┘  └───────────┬─────────────┘  │
│                                                 │                 │
└─────────────────────────────────────────────────┼─────────────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────┐
                    │                             │                 │
                    ▼                             ▼                 │
          ┌─────────────────┐           ┌─────────────────┐        │
          │   Puter.js API  │           │  Open-WebUI API │        │
          │  (Free AI Chat) │           │  (Self-hosted)  │        │
          │                 │           │                 │        │
          │ api.puter.com   │           │ user-defined    │        │
          └─────────────────┘           └─────────────────┘        │
                    │                             │                 │
                    ▼                             ▼                 │
          ┌─────────────────┐           ┌─────────────────┐        │
          │   AI Models     │           │   AI Models     │        │
          │ • GPT-4         │           │ • OpenAI        │        │
          │ • Claude        │           │ • Anthropic     │        │
          │ • Gemini        │           │ • Local LLMs    │        │
          │ • DeepSeek      │           │ • Any provider  │        │
          └─────────────────┘           └─────────────────┘        │
```

## Core Components

### 1. Navigation Layer (Expo Router)

File-based routing with three main route groups:

```
app/
├── _layout.tsx           # Root layout with providers
├── (auth)/               # Unauthenticated routes
│   ├── _layout.tsx       # Auth layout
│   ├── index.tsx         # Welcome screen
│   ├── login.tsx         # Open-WebUI login
│   ├── register.tsx      # Open-WebUI registration
│   └── puter-auth.tsx    # Puter WebView auth
├── (tabs)/               # Main app tabs
│   ├── _layout.tsx       # Tab bar layout
│   ├── index.tsx         # Conversations list
│   ├── models.tsx        # Model selection
│   └── settings.tsx      # App settings
└── chat/
    └── [id].tsx          # Dynamic chat screen
```

### 2. State Management (Zustand)

Two primary stores manage application state:

#### AuthStore (`src/stores/authStore.ts`)

```typescript
interface AuthState {
  // Puter authentication
  puterToken: string | null;
  puterUser: PuterUser | null;
  isPuterAuthenticated: boolean;

  // Open-WebUI authentication
  openWebUIToken: string | null;
  openWebUIUser: User | null;
  isOpenWebUIAuthenticated: boolean;

  // Server configuration
  serverUrl: string | null;
}
```

#### ChatStore (`src/stores/chatStore.ts`)

```typescript
interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  selectedModel: Model;
  availableModels: Model[];
  isStreaming: boolean;
  streamingContent: string;
}
```

### 3. Service Layer

#### Puter Services

- **puterAuth.ts** - Authentication via WebView popup
- **puterChat.ts** - Chat completions via Puter driver API

#### Open-WebUI Services

- **openWebUIAuth.ts** - JWT-based authentication
- **openWebUIChat.ts** - Chat and conversation management

#### Utility Services

- **storage.ts** - Secure storage wrapper (expo-secure-store)

## Data Flow

### Chat Message Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   User   │───▶│   Chat   │───▶│   Chat   │───▶│   API    │
│  Input   │    │  Screen  │    │  Store   │    │ Service  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │               │               │
                     │               │               ▼
                     │               │         ┌──────────┐
                     │               │         │  Puter/  │
                     │               │         │Open-WebUI│
                     │               │         └──────────┘
                     │               │               │
                     │               │    Stream     │
                     │◀──────────────│◀──────────────┘
                     │               │
                     ▼               ▼
              ┌──────────┐    ┌──────────┐
              │  Update  │    │  Update  │
              │    UI    │    │  State   │
              └──────────┘    └──────────┘
```

### Authentication Flow

#### Puter Authentication

```
┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│  Welcome  │────▶│  WebView  │────▶│  Puter    │────▶│ postMessage│
│  Screen   │     │           │     │  Sign In  │     │  Token    │
└───────────┘     └───────────┘     └───────────┘     └───────────┘
                                                            │
                  ┌───────────┐     ┌───────────┐           │
                  │  Navigate │◀────│  Validate │◀──────────┘
                  │  to App   │     │  & Store  │
                  └───────────┘     └───────────┘
```

#### Open-WebUI Authentication

```
┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│  Login    │────▶│  Enter    │────▶│  POST     │────▶│  Receive  │
│  Screen   │     │  Creds    │     │  /signin  │     │  JWT      │
└───────────┘     └───────────┘     └───────────┘     └───────────┘
                                                            │
                  ┌───────────┐     ┌───────────┐           │
                  │  Navigate │◀────│  Store    │◀──────────┘
                  │  to App   │     │  Token    │
                  └───────────┘     └───────────┘
```

## Component Architecture

### UI Component Hierarchy

```
App
├── RootLayout
│   ├── AuthProvider (hydrates stored auth)
│   └── QueryClientProvider (TanStack Query)
│
├── (auth) Routes
│   ├── WelcomeScreen
│   │   ├── Logo
│   │   ├── PrimaryButton ("Start Chatting")
│   │   ├── SecondaryButton ("Sign in with Puter")
│   │   └── TextButton ("Connect to Open-WebUI")
│   │
│   ├── PuterAuthScreen
│   │   └── WebView (Puter sign-in)
│   │
│   └── LoginScreen
│       ├── ServerUrlInput
│       ├── EmailInput
│       ├── PasswordInput
│       └── SubmitButton
│
├── (tabs) Routes
│   ├── ConversationsTab
│   │   ├── Header (with "New Chat" button)
│   │   ├── ConversationList (FlashList)
│   │   │   └── ConversationItem (swipeable)
│   │   └── EmptyState
│   │
│   ├── ModelsTab
│   │   ├── ModelList (FlashList)
│   │   │   └── ModelItem (with selection indicator)
│   │   └── CurrentModelBadge
│   │
│   └── SettingsTab
│       ├── AccountSection
│       │   ├── PuterAccountInfo
│       │   └── OpenWebUIAccountInfo
│       ├── ServerSection
│       │   └── ServerUrlInput
│       ├── AppearanceSection
│       │   └── ThemeToggle
│       └── AboutSection
│
└── Chat Route
    └── ChatScreen
        ├── Header (model indicator, back button)
        ├── MessageList (FlashList)
        │   └── MessageBubble
        │       ├── Avatar
        │       ├── Content (with streaming cursor)
        │       └── Timestamp
        └── InputArea
            ├── TextInput (multiline)
            └── SendButton
```

## Streaming Implementation

### SSE (Server-Sent Events) Handling

```typescript
// Simplified streaming flow
async function* streamChat(model: string, messages: Message[]) {
  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ model, messages, stream: true }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = JSON.parse(line.slice(6));
        if (data.choices[0].delta.content) {
          yield data.choices[0].delta.content;
        }
      }
    }
  }
}
```

### UI Update During Streaming

```typescript
// In ChatScreen component
const sendMessage = async () => {
  // 1. Add user message
  addMessage(conversationId, userMessage);

  // 2. Add empty assistant message
  addMessage(conversationId, { role: "assistant", content: "" });

  // 3. Stream and update
  setIsStreaming(true);
  let fullContent = "";

  for await (const chunk of streamChat(model, messages)) {
    fullContent += chunk;
    updateLastMessage(conversationId, fullContent);
  }

  setIsStreaming(false);
};
```

## Storage Architecture

### Secure Storage (expo-secure-store)

Encrypted storage for sensitive data:

- `puter_token` - Puter authentication token
- `open_webui_token` - Open-WebUI JWT
- `server_url` - Configured server URL

### Local Storage (AsyncStorage)

Non-sensitive data:

- `theme` - User's theme preference
- `conversations` - Cached conversation list (for offline access)

## Error Handling Strategy

### Network Errors

```typescript
try {
  const response = await chatService.chat(model, messages);
} catch (error) {
  if (error.response?.status === 401) {
    // Token expired - prompt re-authentication
    clearAuth();
    router.replace("/(auth)");
  } else if (error.response?.status === 429) {
    // Rate limited - show retry message
    showToast("Rate limited. Please wait...");
  } else if (!navigator.onLine) {
    // Offline - queue message for later
    queueOfflineMessage(message);
  } else {
    // Generic error
    showToast("Something went wrong. Please try again.");
  }
}
```

### Streaming Errors

```typescript
try {
  for await (const chunk of streamChat(model, messages)) {
    appendContent(chunk);
  }
} catch (error) {
  // Update message with error state
  updateLastMessage(conversationId, "Error: Failed to complete response.");
} finally {
  setIsStreaming(false);
}
```

## Performance Optimizations

### 1. FlashList for Long Lists

Using `@shopify/flash-list` instead of FlatList for better performance with large message lists.

### 2. Message Virtualization

Only rendering visible messages plus a small buffer.

### 3. Memoization

```typescript
const MessageBubble = React.memo(({ message, isStreaming }) => {
  // Component implementation
});
```

### 4. Debounced Input

```typescript
const [inputText, setInputText] = useState("");
const debouncedInput = useDebounce(inputText, 300);
```

### 5. Image Caching

Using `expo-image` for optimized image loading and caching.

## Security Considerations

### Token Storage

- All tokens stored using `expo-secure-store` (encrypted)
- Tokens never logged or exposed in error messages

### Network Security

- All API calls over HTTPS
- Certificate pinning for Puter API (optional)

### Input Validation

- User input sanitized before display
- Maximum message length enforced

### Deep Linking

- URL scheme `openchat://` registered
- All deep links validated before navigation

## Testing Strategy

### Unit Tests

- Store logic (Zustand)
- Service functions
- Utility functions

### Integration Tests

- API client integration
- Authentication flows

### E2E Tests (Detox)

- Complete user flows
- Offline behavior
- Error scenarios

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        App Distribution                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   Expo      │    │   Apple     │    │      Google         │  │
│  │   Updates   │    │   App       │    │      Play           │  │
│  │   (OTA)     │    │   Store     │    │      Store          │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
│         │                  │                     │               │
│         │                  │                     │               │
│         ▼                  ▼                     ▼               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    OpenChat Mobile App                       ││
│  │                                                              ││
│  │  • JavaScript Bundle (OTA updatable)                        ││
│  │  • Native Code (App Store updates only)                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Future Architecture Considerations

### V2 Features

- **Voice Input**: expo-av for recording, Whisper API for transcription
- **Voice Output**: expo-speech or external TTS API
- **Image Generation**: New service for image generation APIs
- **File Upload**: expo-document-picker + multipart upload
- **Push Notifications**: expo-notifications + backend webhook

### Scalability

- Message pagination for long conversations
- Conversation archiving
- Multi-account support
