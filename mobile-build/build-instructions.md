# Mobile App Build Instructions

## Quick Start - PWA Deployment (Ready Now)

Your employee app is already live and installable as a PWA:

1. **Access the app**: Navigate to `/employee` on your website
2. **Install on mobile**: 
   - iOS: Tap Share → Add to Home Screen
   - Android: Tap the install prompt or browser menu → Install app
3. **Features**: Full offline support, push notifications, native app experience

## App Store Deployment Process

### Prerequisites
- Apple Developer Account ($99/year)
- Google Play Console Account ($25 one-time fee)
- Xcode (for iOS) or Android Studio (for Android)

### Step 1: Install Capacitor CLI
```bash
cd mobile-build
npm install -g @capacitor/cli
npm install
```

### Step 2: Build Web Assets
```bash
cd ..
npm run build
cd mobile-build
cap copy
```

### Step 3: Add Native Platforms
```bash
# Add iOS platform
cap add ios

# Add Android platform  
cap add android
```

### Step 4: Configure App Metadata

#### For iOS (ios/App/App/Info.plist):
```xml
<key>CFBundleDisplayName</key>
<string>LE11 Employee</string>
<key>CFBundleIdentifier</key>
<string>com.lemurexpress11.employee</string>
<key>CFBundleVersion</key>
<string>1.0.0</string>
```

#### For Android (android/app/src/main/AndroidManifest.xml):
```xml
<application
    android:label="LE11 Employee"
    android:icon="@mipmap/ic_launcher">
```

### Step 5: Configure App Icons and Splash Screens

Icons needed for iOS:
- 1024x1024 (App Store)
- 180x180 (iPhone)
- 167x167 (iPad)
- 152x152 (iPad)
- 120x120 (iPhone)
- 87x87 (iPhone)
- 80x80 (iPad)
- 76x76 (iPad)
- 60x60 (iPhone)
- 58x58 (iPhone)
- 40x40 (iPhone/iPad)
- 29x29 (iPhone/iPad)
- 20x20 (iPhone/iPad)

Icons needed for Android:
- 512x512 (Play Store)
- 192x192 (xxxhdpi)
- 144x144 (xxhdpi)
- 96x96 (xhdpi)
- 72x72 (hdpi)
- 48x48 (mdpi)

### Step 6: Open in Native IDEs
```bash
# Open iOS project in Xcode
cap open ios

# Open Android project in Android Studio
cap open android
```

### Step 7: Configure Signing

#### iOS:
1. Open project in Xcode
2. Select project → Signing & Capabilities
3. Select your development team
4. Configure Bundle Identifier
5. Enable push notifications capability

#### Android:
1. Generate signing key:
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
```
2. Configure in `android/app/build.gradle`

### Step 8: Build and Deploy

#### iOS App Store:
1. Archive in Xcode (Product → Archive)
2. Upload to App Store Connect
3. Fill out app metadata
4. Submit for review

#### Google Play Store:
1. Build signed APK/AAB in Android Studio
2. Upload to Google Play Console
3. Fill out store listing
4. Submit for review

## App Store Listing Information

### App Name
Lemur Express 11 - Employee

### Description
Professional kitchen management app for pizza restaurant employees. Manage orders, track preparation status, and receive real-time notifications for new orders.

Key Features:
• Real-time order tracking and management
• Order status updates (confirmed → preparing → ready → completed)
• Push notifications for new orders
• Customer information and order details
• Time estimation tools
• Offline functionality
• Touch-optimized interface

Perfect for restaurant staff to efficiently manage pizza orders and maintain smooth kitchen operations.

### Keywords
pizza, restaurant, kitchen, orders, management, employee, food service, POS

### Category
- iOS: Business
- Android: Business

### Age Rating
4+ (No objectionable content)

### Screenshots Required
- 6.7" iPhone (1290x2796)
- 6.5" iPhone (1284x2778) 
- 5.5" iPhone (1242x2208)
- 12.9" iPad (2048x2732)
- Android: 16:9 aspect ratio

## Maintenance and Updates

### Updating the App
1. Make changes to web code
2. Build: `npm run build`
3. Copy assets: `cap copy`
4. Sync: `cap sync`
5. Rebuild and resubmit to stores

### Version Management
- Update version in `package.json`
- Update version in `capacitor.config.ts`
- Update native app versions in Xcode/Android Studio

## Support and Troubleshooting

### Common Issues
1. **Build failures**: Ensure all dependencies are installed
2. **Icon not showing**: Check icon file paths and formats
3. **Push notifications not working**: Verify VAPID keys and permissions
4. **App rejected**: Review store guidelines and fix issues

### Testing
- Test PWA version first
- Use device simulators
- Test on physical devices
- Verify all features work offline