# Olvon Mobile App

Virtual clothing fitting app built with React Native (Expo SDK 54). Users scan
their body to create a 3D avatar, browse outfit feeds, try garments virtually,
get AI size recommendations, and purchase from Malaysian/SEA stores.

## Tech Stack

- **Framework:** Expo SDK 54, React Native 0.81, TypeScript
- **Router:** expo-router v6 (file-based, typed routes)
- **State:** Zustand with AsyncStorage persistence
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **i18n:** i18next + react-i18next (EN, MS, ZH, TH, VI, ID)
- **Animations:** react-native-reanimated (UI thread, 60fps)
- **Video Feed:** @shopify/flash-list + expo-video
- **Camera:** expo-camera (12-frame body scan)

## Project Structure

```
mobile-app/
  app/                    # Expo Router file-based routes
    (auth)/               # Auth group: login, signup, onboarding
    (tabs)/               # Tab group: feed, dressing-room, scanner, profile
    garment/[id].tsx      # Garment detail (dynamic route)
    store/[id].tsx        # Store page (dynamic route)
    cart/index.tsx        # Cart modal
    checkout/index.tsx    # Checkout modal
    auth/callback.tsx     # OAuth callback handler
    _layout.tsx           # Root layout (fonts, splash)
    index.tsx             # Auth routing entry point
  components/
    ui/                   # Reusable primitives: Button, Input, Card, etc.
    AvatarViewer.tsx      # 3D avatar placeholder viewer
    CameraScanner.tsx     # 12-frame body scan camera
    FeedItem.tsx          # Full-screen video feed item
    GarmentCard.tsx       # Garment card (horizontal/vertical)
    HeightInput.tsx       # Height input with cm/ft toggle
    SizeRecommendation.tsx
  constants/
    theme.ts              # Editorial design tokens
    sizeCharts.ts         # Malaysian/SEA size charts
  hooks/                  # useAuth, useFeed, useGarments, useSizeRecommendation
  lib/                    # supabase, api, storage, i18n, animations
  locales/                # 6 translation files (en, ms, zh, th, vi, id)
  store/                  # Zustand: userStore, cartStore, avatarStore
  types/                  # TypeScript interfaces
  assets/fonts/           # PlayfairDisplay + DMSans font files
```

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g @expo/cli`
- EAS CLI: `npm install -g eas-cli`
- iOS: Xcode 15+ (Mac only)
- Android: Android Studio with SDK 34+

### Setup

1. Install dependencies:
   ```bash
   cd mobile-app
   npm install --legacy-peer-deps
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase URL, anon key, and API URL.

3. Download fonts: Place real `.ttf` font files in `assets/fonts/`:
   - PlayfairDisplay: Regular, Medium, SemiBold, Bold
   - DMSans: Regular, Medium, SemiBold, Bold

4. Start development:
   ```bash
   npx expo start
   ```

### EAS Build

```bash
# Development build (simulator)
eas build --profile development --platform ios

# Preview (internal distribution)
eas build --profile preview --platform all

# Production
eas build --profile production --platform all
```

### EAS Submit

```bash
# iOS App Store
eas submit --platform ios

# Google Play
eas submit --platform android
```

## Architecture Notes

- **No on-device ML.** The mobile app captures 12 body scan images and uploads
  them to the backend. A GPU worker (4D-Humans / ANNY) processes them and
  returns a `.glb` avatar URL + pre-rendered fitting videos.
- **Cursor-based pagination** on the feed using `(relevance_score, id)`
  composite for deterministic ordering.
- **Client-side size recommendation** as a fast fallback. The authoritative size
  recommendation comes from the `generate-size-recommendation` Edge Function.
- **Editorial/magazine design theme** with serif display typography (Playfair
  Display), clean sans body (DM Sans), sharp corners, and minimal color palette.

## Scripts

| Command           | Description               |
| ----------------- | ------------------------- |
| `npm start`       | Start Expo dev server     |
| `npm run ios`     | Start on iOS simulator    |
| `npm run android` | Start on Android emulator |
| `npm run web`     | Start web version         |
