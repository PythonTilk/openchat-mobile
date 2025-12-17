# Development Environment Setup

This guide walks you through setting up your development environment for OpenChat Mobile.

## Prerequisites

### Required Software

| Software | Version       | Purpose                  |
| -------- | ------------- | ------------------------ |
| Node.js  | 18.x or later | JavaScript runtime       |
| npm      | 9.x or later  | Package manager          |
| Git      | 2.x or later  | Version control          |
| Expo CLI | Latest        | React Native development |

### Platform-Specific Requirements

#### For iOS Development (macOS only)

- macOS 12.0 or later
- Xcode 14.0 or later
- iOS Simulator (included with Xcode)
- CocoaPods (`sudo gem install cocoapods`)

#### For Android Development (macOS, Windows, Linux)

- Android Studio (latest stable)
- Android SDK (API level 33 or later)
- Android Emulator or physical device
- Java Development Kit (JDK) 11 or later

## Installation Steps

### 1. Install Node.js

#### macOS (using Homebrew)

```bash
brew install node
```

#### Windows (using Chocolatey)

```bash
choco install nodejs
```

#### Linux (using nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### 2. Install Expo CLI

```bash
npm install -g expo-cli eas-cli
```

### 3. Clone the Repository

```bash
git clone https://github.com/PythonTilk/openchat-mobile.git
cd openchat-mobile
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration (optional):

```
EXPO_PUBLIC_DEFAULT_SERVER_URL=https://your-openwebui-server.com
```

## Running the App

### Start Development Server

```bash
npx expo start
```

This opens Expo DevTools in your browser.

### Running on Simulators/Emulators

#### iOS Simulator (macOS only)

1. Press `i` in the terminal, or
2. Click "Run on iOS simulator" in Expo DevTools

#### Android Emulator

1. Start Android Emulator from Android Studio
2. Press `a` in the terminal, or
3. Click "Run on Android device/emulator" in Expo DevTools

### Running on Physical Devices

#### Using Expo Go App

1. Install "Expo Go" from App Store or Play Store
2. Scan the QR code shown in terminal/Expo DevTools
3. App will load in Expo Go

#### Development Build (recommended for full features)

```bash
# Build for iOS
npx eas build --profile development --platform ios

# Build for Android
npx eas build --profile development --platform android
```

## IDE Setup

### VS Code (Recommended)

#### Install Extensions

- **ES7+ React/Redux/React-Native snippets** - Code snippets
- **Prettier - Code formatter** - Auto formatting
- **ESLint** - Linting
- **TypeScript Importer** - Auto imports
- **Expo Tools** - Expo-specific features

#### Recommended Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### WebStorm / IntelliJ IDEA

1. Open the project folder
2. Enable TypeScript language service
3. Configure Prettier as default formatter
4. Enable ESLint integration

## Project Structure

```
openchat-mobile/
├── app/                    # Expo Router routes (screens)
│   ├── _layout.tsx        # Root layout
│   ├── (auth)/            # Auth screens (unauthenticated)
│   │   ├── _layout.tsx
│   │   ├── index.tsx      # Welcome screen
│   │   ├── login.tsx      # Open-WebUI login
│   │   └── puter-auth.tsx # Puter WebView auth
│   ├── (tabs)/            # Main app screens (authenticated)
│   │   ├── _layout.tsx    # Tab bar layout
│   │   ├── index.tsx      # Conversations list
│   │   ├── models.tsx     # Model selection
│   │   └── settings.tsx   # App settings
│   └── chat/
│       └── [id].tsx       # Chat screen (dynamic route)
├── src/
│   ├── api/               # API client instances
│   ├── components/        # Reusable UI components
│   │   ├── chat/         # Chat-specific components
│   │   ├── common/       # Shared components
│   │   └── auth/         # Auth components
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # Zustand state stores
│   │   ├── authStore.ts
│   │   └── chatStore.ts
│   ├── services/         # Business logic & API services
│   │   ├── puterAuth.ts
│   │   ├── puterChat.ts
│   │   ├── openWebUIAuth.ts
│   │   ├── openWebUIChat.ts
│   │   └── storage.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── constants/        # App constants & config
│       └── index.ts
├── assets/               # Static assets (images, fonts)
├── docs/                 # Documentation
├── app.json             # Expo configuration
├── babel.config.js      # Babel configuration
├── tailwind.config.js   # Tailwind/NativeWind config
├── tsconfig.json        # TypeScript configuration
├── package.json         # Dependencies & scripts
└── .env.example         # Environment template
```

## Common Commands

```bash
# Start development server
npx expo start

# Start with cache cleared
npx expo start --clear

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run TypeScript check
npx tsc --noEmit

# Run linter
npm run lint

# Run tests
npm test

# Build for production (iOS)
npx eas build --platform ios

# Build for production (Android)
npx eas build --platform android

# Submit to App Store
npx eas submit --platform ios

# Submit to Play Store
npx eas submit --platform android
```

## Troubleshooting

### Common Issues

#### "Unable to resolve module" error

```bash
# Clear Metro bundler cache
npx expo start --clear
```

#### iOS build fails with CocoaPods error

```bash
cd ios
pod install --repo-update
cd ..
```

#### Android build fails

```bash
# Clean Android build
cd android
./gradlew clean
cd ..
```

#### WebView not loading on Android

Ensure `android:usesCleartextTraffic="true"` is in `AndroidManifest.xml` (only for development).

#### Expo Go shows "Network response timed out"

1. Ensure device and computer are on same WiFi network
2. Try using tunnel: `npx expo start --tunnel`

### Debug Tools

#### React Native Debugger

```bash
# Install
brew install react-native-debugger

# Start before running app
open "rndebugger://set-debugger-loc?host=localhost&port=8081"
```

#### Flipper (Alternative)

1. Download from https://fbflipper.com/
2. Install and open Flipper
3. It will auto-detect running React Native apps

#### Console Logging

```typescript
// Standard logging
console.log("Debug:", data);

// For objects
console.log("Data:", JSON.stringify(data, null, 2));
```

## Environment Configuration

### Development vs Production

Create multiple environment files:

```
.env.development    # Development settings
.env.staging        # Staging settings
.env.production     # Production settings
```

Load based on build profile in `app.config.js`:

```javascript
export default {
  expo: {
    // ... other config
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
    },
  },
};
```

## Testing Setup

### Unit Testing with Jest

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### E2E Testing with Detox

```bash
# Install Detox CLI
npm install -g detox-cli

# Build test app
detox build --configuration ios.sim.debug

# Run tests
detox test --configuration ios.sim.debug
```

## Next Steps

After setup, proceed with:

1. Read [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) for development guide
2. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
3. Read [API_REFERENCE.md](./API_REFERENCE.md) for API documentation
4. Read [PUTER_INTEGRATION.md](./PUTER_INTEGRATION.md) for Puter details

## Getting Help

- **Expo Documentation**: https://docs.expo.dev
- **React Native Documentation**: https://reactnative.dev/docs
- **NativeWind Documentation**: https://www.nativewind.dev
- **Zustand Documentation**: https://zustand-demo.pmnd.rs
- **Project Issues**: https://github.com/PythonTilk/openchat-mobile/issues
