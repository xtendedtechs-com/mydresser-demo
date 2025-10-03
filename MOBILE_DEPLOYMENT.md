# MyDresser Mobile App Deployment Guide

This guide will help you build and deploy MyDresser as a native mobile app for iOS and Android.

## Prerequisites

### For iOS Development:
- macOS computer with Xcode installed
- Apple Developer Account (for deployment to App Store)
- Xcode Command Line Tools

### For Android Development:
- Android Studio installed
- Android SDK
- Java Development Kit (JDK)

### Required for Both:
- Node.js and npm installed
- Git for version control

## Setup Instructions

### 1. Export and Clone the Project

1. Click the "Export to Github" button in Lovable
2. Clone the repository to your local machine:
   ```bash
   git clone <your-repo-url>
   cd mydresser-firts-demo
   ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Add Mobile Platforms

**For Android:**
```bash
npx cap add android
npx cap update android
```

**For iOS:**
```bash
npx cap add ios
npx cap update ios
```

### 4. Build the Web Assets

```bash
npm run build
```

### 5. Sync to Native Platforms

```bash
npx cap sync
```

This command copies the web assets to the native projects and updates native dependencies.

## Running on Emulator/Device

### Android

```bash
npx cap run android
```

This will:
- Build the app
- Launch Android Studio (if not already open)
- Run on connected device or emulator

**Manual Alternative:**
1. Open Android Studio
2. Open the `android` folder from your project
3. Click "Run" (green play button)
4. Select your device/emulator

### iOS

```bash
npx cap run ios
```

This will:
- Build the app
- Launch Xcode (if not already open)
- Run on simulator or connected device

**Manual Alternative:**
1. Open Xcode
2. Open the `ios/App/App.xcworkspace` file
3. Select your target device
4. Click "Run" (play button)

## Development Workflow

### Hot Reload (Development)

The app is configured for hot reload during development:
- Changes to your code will automatically reflect in the app
- The app connects to: `https://98ef3151-1e17-4996-ae6e-ea7cd0cea467.lovableproject.com`
- No need to rebuild native apps for code changes

### Making Changes

1. Make changes in Lovable or your local code editor
2. Changes appear automatically (hot reload enabled)
3. Only run `npx cap sync` when:
   - Adding/removing Capacitor plugins
   - Updating native configurations
   - Changing app icons/splash screens

## Production Build

### Disable Hot Reload for Production

Before building for production, update `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'app.lovable.98ef31511e174996ae6eea7cd0cea467',
  appName: 'mydresser-firts-demo',
  webDir: 'dist',
  // Remove or comment out the server config for production
  // server: {
  //   url: '...',
  //   cleartext: true
  // }
};
```

### Build for Production

```bash
npm run build
npx cap sync
```

### Android Production Build

1. Open Android Studio
2. Build → Generate Signed Bundle/APK
3. Follow the wizard to create a signed APK or App Bundle
4. Upload to Google Play Console

### iOS Production Build

1. Open Xcode
2. Select "Any iOS Device" as target
3. Product → Archive
4. Upload to App Store Connect

## App Configuration

### Change App Name

Edit `capacitor.config.ts`:
```typescript
appName: 'Your App Name'
```

### Change App ID

Edit `capacitor.config.ts`:
```typescript
appId: 'com.yourcompany.yourapp'
```

**Important:** Changing the app ID requires re-adding platforms:
```bash
npx cap remove android
npx cap remove ios
npx cap add android
npx cap add ios
```

### App Icons and Splash Screen

1. Place your app icons in the appropriate directories:
   - Android: `android/app/src/main/res/mipmap-*/`
   - iOS: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

2. Configure splash screen in `capacitor.config.ts`:
```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    backgroundColor: "#000000",
    showSpinner: false
  }
}
```

## Native Features

MyDresser supports native mobile features:

### Camera Access
- Wardrobe item photo capture
- Outfit photo sharing

### Push Notifications
- Order updates
- Daily outfit suggestions
- Social interactions

### Local Storage
- Offline wardrobe access
- Cached outfit recommendations

## Troubleshooting

### Build Errors

**"Command not found: cap"**
```bash
npm install -g @capacitor/cli
```

**Android build fails:**
- Check Android SDK is installed
- Update Android Studio
- Run `npx cap sync android`

**iOS build fails:**
- Update Xcode to latest version
- Run `pod install` in `ios/App` folder
- Clean build folder in Xcode

### Hot Reload Not Working

1. Check your device/emulator is on the same network
2. Verify the URL in `capacitor.config.ts`
3. Check firewall settings
4. Try rebuilding: `npm run build && npx cap sync`

### Permission Issues

Add required permissions to:
- **Android:** `android/app/src/main/AndroidManifest.xml`
- **iOS:** `ios/App/App/Info.plist`

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Lovable Mobile Development Guide](https://lovable.dev/blogs/mobile-development)
- [iOS App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Store Guidelines](https://play.google.com/console/about/guides/releasewithconfidence/)

## Support

For issues and questions:
- Lovable Discord Community
- GitHub Issues (your repo)
- Capacitor Community Forum

---

**Note:** Always test thoroughly on both iOS and Android devices before releasing to production!
