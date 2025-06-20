# Mobile App Build Instructions

## Quick Start Guide

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- For iOS: macOS with Xcode 14+
- For Android: Android Studio with SDK 33+

### Build Commands

**iOS Build:**
```bash
cd mobile-build/app-store-deployment/build-commands
./ios-build.sh
```

**Android Build:**
```bash
cd mobile-build/app-store-deployment/build-commands
./android-build.sh
```

## App Store Submission Process

### Apple App Store
1. Run iOS build script
2. Open project in Xcode
3. Archive for distribution
4. Upload to App Store Connect
5. Complete app information using provided descriptions
6. Submit for review

### Google Play Store
1. Run Android build script
2. Create release keystore (see keystore-info.txt)
3. Upload AAB file to Play Console
4. Complete store listing with provided content
5. Submit for review

## Testing Credentials
- Username: admin
- Password: 1234

## Support Information
- App Name: Lemur Express 11 Employee
- Bundle ID: com.lemurexpress11.employee
- Version: 1.0.0
- Category: Business
- Target Audience: Restaurant employees

## Files Included
- Complete app descriptions for both stores
- Privacy policy (HTML format)
- Build scripts for iOS and Android
- Keystore generation instructions
- App Store submission guidelines