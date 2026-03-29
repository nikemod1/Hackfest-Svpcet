# Build APSAS SOS Mobile App (APK)

## Prerequisites
- Node.js (v16+)
- Java Development Kit (JDK 11+)
- Android SDK
- Android Studio (optional but recommended)

## Step 1: Install Expo CLI & Dependencies

```bash
npm install -g expo-cli
npm install
```

## Step 2: Install Additional Packages for Mobile

```bash
npm install expo-location expo-keep-awake expo-secure-store
npx expo install
```

## Step 3: Build APK for Android

### Option A: Using Expo Cloud Build (Recommended - No Local Setup)

```bash
# Log in to Expo
npx expo login

# Build APK in cloud
npx expo build:android -t apk

# Or full release build
npx expo build:android -t app-bundle
```

Wait for the build to complete. You'll get a download link to your APK.

### Option B: Local Build with Android Studio

```bash
# Create the native build files
npx expo prebuild --clean

# Build using Gradle
cd android
./gradlew assembleRelease

# APK will be in: app/build/outputs/apk/release/app-release.apk
```

## Step 4: Install on Android Device

```bash
# Via USB or emulator
adb install -r app-release.apk

# Or via Expo
npx expo install:android
```

## Features

- **Triple Power Button SOS**: Press power button 3 times rapidly to trigger emergency alert
- **One-Tap SOS**: Tap the large red SOS button
- **GPS Location**: Automatic location detection and sharing with emergency contacts
- **Emergency Contacts**: Manage and add emergency contacts
- **Background Monitoring**: Listens for SOS triggers even when app is in background
- **SMS Backend Integration**: Uses your existing sms-server for message delivery

## Configuration

### 1. Update Emergency Contacts
- Open the app
- Tap "+ Add Contact"
- Format: `Mom +919876543210`

### 2. Configure SMS Server
Ensure `sms-server.js` is running with valid credentials:

```bash
# First, add keys to .env
FAST2SMS_API_KEY=your_api_key
# OR
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_FROM_NUMBER=+1xxx

# Start the SMS server
npm run sms-server
```

### 3. Network Configuration
The app expects SMS backend at: `http://localhost:3001/api/send-sos-bulk`

For production, update the IP/domain in `SosApp.js`:
```javascript
const SOS_BACKEND_URL = 'http://192.168.x.x:3001/api/send-sos-bulk';
// or
const SOS_BACKEND_URL = 'https://your-domain.com/api/send-sos-bulk';
```

## Permissions Required

The app requests:
- **Location (Fine)**: GPS location for emergency alerts
- **Location (Coarse)**: Network-based location fallback
- **Internet**: To send SMS via backend

## Testing

### On Emulator
```bash
# Start Metro bundler
npx expo start

# Press 'a' to open Android emulator
# Use volume buttons as power button substitute
```

### On Real Device
```bash
# Connect via USB with debugging enabled
npx expo start
# Press 'a' to install on device
```

## Troubleshooting

### "Cannot find sms-server"
Ensure backend is running on port 3001:
```bash
npm run sms-server
```

### "Location permission denied"
- Open Settings > Permissions > Location
- Enable "Always Allow" or "Allow only while using the app"

### "SOS not sending"
1. Check SMS server health: `curl http://localhost:3001/health`
2. Verify emergency contacts are added
3. Check .env has valid SMS provider credentials

### Power Button Not Working
- Power button interception is restricted on Android for security
- Use the red SOS button as a workaround
- For devices with accessibility needs, consider using volume keys or custom accessibility features

## Release Build

For production release on Play Store:

```bash
# Create a signing key (first time only)
keytool -genkey -v -keystore apsas-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias apsas

# Build signed APK
npx expo build:android -t apk --release-channel prod
```

## Support

For issues, check:
- Expo documentation: https://docs.expo.dev
- Android developer docs: https://developer.android.com
- Your SMS provider's documentation
