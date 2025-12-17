# OpenChat Mobile

A React Native + Expo mobile app for iOS and Android that provides a beautiful chat interface for AI models, powered by [Open-WebUI](https://github.com/open-webui/open-webui) backends and [Puter.js](https://puter.com) free AI models.

## Features

- **Free AI Access** - Use Puter's free AI models immediately without any account required
- **Open-WebUI Integration** - Connect to any Open-WebUI server for full-featured AI chat
- **Conversation Sync** - Your chat history syncs across devices when logged into Open-WebUI
- **Multiple Models** - Switch between different AI models (GPT-4, Claude, Llama, etc.)
- **Streaming Responses** - Real-time streaming of AI responses
- **Dark/Light Mode** - Beautiful UI with theme support
- **Self-Hosted Support** - Configure your own Open-WebUI server URL

## Screenshots

_Coming soon_

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/PythonTilk/openchat-mobile.git
cd openchat-mobile

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Device

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Physical Device**: Scan the QR code with Expo Go app

## Usage

### Using Puter (Free, No Login Required)

1. Open the app
2. Start chatting immediately with Puter's free AI models
3. Optionally sign in to Puter to save your conversations

### Connecting to Open-WebUI

1. Go to Settings
2. Enter your Open-WebUI server URL (e.g., `https://your-server.com`)
3. Log in with your Open-WebUI credentials
4. Your conversations will sync across devices

## Tech Stack

| Category         | Technology                 |
| ---------------- | -------------------------- |
| Framework        | React Native + Expo SDK 54 |
| Navigation       | Expo Router (file-based)   |
| State Management | Zustand                    |
| API/Caching      | TanStack Query + Axios     |
| Streaming        | react-native-sse           |
| Secure Storage   | expo-secure-store          |
| WebView          | react-native-webview       |
| Styling          | NativeWind (Tailwind CSS)  |
| Lists            | @shopify/flash-list        |

## Project Structure

```
openchat-mobile/
├── app/                    # Expo Router routes
│   ├── (auth)/            # Auth screens (login, register)
│   ├── (tabs)/            # Main app tabs
│   └── chat/              # Chat screens
├── src/
│   ├── api/               # API clients
│   ├── components/        # UI components
│   ├── hooks/             # Custom React hooks
│   ├── stores/            # Zustand stores
│   ├── services/          # Business logic
│   ├── types/             # TypeScript types
│   └── constants/         # Config & theme
├── docs/                  # Documentation
└── assets/               # Images, fonts, etc.
```

## Documentation

- [Implementation Plan](./IMPLEMENTATION_PLAN.md) - Detailed development guide
- [API Reference](./docs/API_REFERENCE.md) - Open-WebUI API documentation
- [Architecture](./docs/ARCHITECTURE.md) - System design and data flow
- [Puter Integration](./docs/PUTER_INTEGRATION.md) - Puter authentication flow
- [Setup Guide](./docs/SETUP.md) - Development environment setup

## Related Projects

This app is part of the Puter.js AI ecosystem:

- **[LiteLLM Puter Provider](https://github.com/PythonTilk/litellm)** - Server-side access to Puter AI models
- **[Open-WebUI Fork](https://github.com/PythonTilk/open-webui)** - Web interface with Puter integration

## Roadmap

### V1 (MVP)

- [x] Text chat with AI models
- [x] Model selection/switching
- [x] Conversation history sync
- [x] Puter sign-in flow
- [x] Dark/Light mode
- [x] Configurable backend URL

### V2 (Planned)

- [ ] Voice input (Speech-to-Text)
- [ ] Voice output (Text-to-Speech)
- [ ] Image generation
- [ ] File/document upload
- [ ] Push notifications
- [ ] Offline message queue

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

- [Open-WebUI](https://github.com/open-webui/open-webui) - The amazing open-source AI chat interface
- [Puter](https://puter.com) - Free AI model access
- [Expo](https://expo.dev) - React Native development platform
