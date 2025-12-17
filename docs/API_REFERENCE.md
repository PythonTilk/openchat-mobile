# Open-WebUI API Reference

This document provides a comprehensive reference for the Open-WebUI API endpoints used by OpenChat Mobile.

## Base URL

The base URL is configurable by the user. Example: `https://your-openwebui-server.com`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Sign In

**POST** `/api/v1/auths/signin`

Authenticate a user and receive a JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "profile_image_url": "/user.png"
}
```

**Error Response (400):**

```json
{
  "detail": "Invalid credentials"
}
```

---

### Sign Up

**POST** `/api/v1/auths/signup`

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "profile_image_url": "/user.png"
}
```

**Error Response (400):**

```json
{
  "detail": "Email already registered"
}
```

---

### Get Current User

**GET** `/api/v1/auths/`

Get the currently authenticated user's information.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "profile_image_url": "/user.png",
  "created_at": 1699900000,
  "updated_at": 1699900000
}
```

---

### Update Profile

**POST** `/api/v1/auths/update/profile`

Update the current user's profile.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "Jane Doe",
  "profile_image_url": "/custom-avatar.png"
}
```

**Response (200 OK):**

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "Jane Doe",
  "role": "user",
  "profile_image_url": "/custom-avatar.png"
}
```

---

## Models Endpoints

### List Models

**GET** `/api/models`

Get all available models.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "owned_by": "openai",
      "created": 1699900000,
      "object": "model"
    },
    {
      "id": "claude-3-sonnet",
      "name": "Claude 3 Sonnet",
      "owned_by": "anthropic",
      "created": 1699900000,
      "object": "model"
    }
  ]
}
```

---

### Get Model Info

**GET** `/api/models/{model_id}`

Get detailed information about a specific model.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "id": "gpt-4",
  "name": "GPT-4",
  "owned_by": "openai",
  "created": 1699900000,
  "object": "model",
  "capabilities": ["chat", "function_calling"],
  "context_length": 8192
}
```

---

## Chat Endpoints

### Chat Completions

**POST** `/api/chat/completions`

Send a message and get a response from the AI model.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Response (200 OK) - Non-streaming:**

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1699900000,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm doing well, thank you for asking. How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 18,
    "total_tokens": 43
  }
}
```

**Response (200 OK) - Streaming (SSE):**

When `stream: true`, the response is sent as Server-Sent Events:

```
data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1699900000,"model":"gpt-4","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1699900000,"model":"gpt-4","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1699900000,"model":"gpt-4","choices":[{"index":0,"delta":{"content":"!"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1699900000,"model":"gpt-4","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

---

## Conversations (Chats) Endpoints

### List Conversations

**GET** `/api/v1/chats/list`

Get a list of all conversations for the current user.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `skip` (optional): Number of items to skip (default: 0)
- `limit` (optional): Maximum number of items to return (default: 50)

**Response (200 OK):**

```json
[
  {
    "id": "chat-uuid-1",
    "title": "Python help",
    "created_at": 1699900000,
    "updated_at": 1699910000
  },
  {
    "id": "chat-uuid-2",
    "title": "Recipe ideas",
    "created_at": 1699800000,
    "updated_at": 1699800000
  }
]
```

---

### Get Conversation

**GET** `/api/v1/chats/{chat_id}`

Get a single conversation with all its messages.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "id": "chat-uuid-1",
  "title": "Python help",
  "chat": {
    "messages": [
      {
        "id": "msg-uuid-1",
        "role": "user",
        "content": "How do I read a file in Python?",
        "timestamp": 1699900000
      },
      {
        "id": "msg-uuid-2",
        "role": "assistant",
        "content": "You can use the `open()` function...",
        "timestamp": 1699900010,
        "model": "gpt-4"
      }
    ],
    "models": ["gpt-4"],
    "options": {}
  },
  "created_at": 1699900000,
  "updated_at": 1699910000
}
```

---

### Create Conversation

**POST** `/api/v1/chats/new`

Create a new conversation.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "chat": {
    "title": "New Conversation",
    "messages": [],
    "models": ["gpt-4"]
  }
}
```

**Response (200 OK):**

```json
{
  "id": "chat-uuid-new",
  "title": "New Conversation",
  "chat": {
    "messages": [],
    "models": ["gpt-4"],
    "options": {}
  },
  "created_at": 1699920000,
  "updated_at": 1699920000
}
```

---

### Update Conversation

**POST** `/api/v1/chats/{chat_id}`

Update an existing conversation (e.g., add messages, change title).

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "chat": {
    "title": "Updated Title",
    "messages": [
      {
        "id": "msg-uuid-1",
        "role": "user",
        "content": "Hello"
      },
      {
        "id": "msg-uuid-2",
        "role": "assistant",
        "content": "Hi there!"
      }
    ]
  }
}
```

**Response (200 OK):**

```json
{
  "id": "chat-uuid-1",
  "title": "Updated Title",
  "chat": {
    "messages": [...],
    "models": ["gpt-4"],
    "options": {}
  },
  "created_at": 1699900000,
  "updated_at": 1699930000
}
```

---

### Delete Conversation

**DELETE** `/api/v1/chats/{chat_id}`

Delete a conversation.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true
}
```

---

### Delete All Conversations

**DELETE** `/api/v1/chats/`

Delete all conversations for the current user.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized

```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden

```json
{
  "detail": "Not authorized to access this resource"
}
```

### 404 Not Found

```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

Open-WebUI may implement rate limiting. When rate limited, you'll receive:

### 429 Too Many Requests

```json
{
  "detail": "Rate limit exceeded. Please try again later."
}
```

**Headers:**

```
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1699900060
```

---

## TypeScript Types

```typescript
// Auth types
interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  token_type: string;
  id: string;
  email: string;
  name: string;
  role: string;
  profile_image_url?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  profile_image_url?: string;
  created_at?: number;
  updated_at?: number;
}

// Model types
interface Model {
  id: string;
  name: string;
  owned_by?: string;
  created?: number;
  object?: string;
  capabilities?: string[];
  context_length?: number;
}

// Chat types
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Conversation types
interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  model?: string;
}

interface Conversation {
  id: string;
  title: string;
  chat: {
    messages: ConversationMessage[];
    models: string[];
    options: Record<string, unknown>;
  };
  created_at: number;
  updated_at: number;
}

interface ConversationListItem {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
}
```
