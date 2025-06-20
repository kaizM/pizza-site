# Lemur Express 11 Employee App - App Store Deployment Guide

## App Information
- **App Name**: Lemur Express 11 Employee
- **Bundle ID**: com.lemurexpress11.employee
- **Version**: 1.0.0
- **Target**: Employee dashboard for order management
- **Platforms**: iOS (App Store) and Android (Google Play Store)

## Pre-Deployment Checklist

### Apple App Store Requirements
1. **Apple Developer Account** - $99/year subscription required
2. **App Store Connect Access** - Developer account with app management permissions
3. **Xcode** - Latest version (macOS required for iOS builds)
4. **iOS Certificate & Provisioning Profile** - Distribution certificate needed

### Google Play Store Requirements
1. **Google Play Console Account** - $25 one-time registration fee
2. **Google Developer Account** - Verified with phone and payment method
3. **Android Keystore** - For app signing (included in this package)
4. **App Bundle** - AAB format for Google Play

## Deployment Files Included

### iOS App Store Files
- `ios-build/` - Complete iOS project
- `App-Info.plist` - iOS app configuration
- `ios-icons/` - All required icon sizes
- `ios-screenshots/` - App Store screenshots
- `privacy-policy.html` - Required privacy policy
- `app-store-description.txt` - App Store listing content

### Android Google Play Files
- `android-build/` - Complete Android project
- `android-icons/` - All required icon sizes
- `android-screenshots/` - Google Play screenshots
- `release.keystore` - Signing key for production
- `google-play-description.txt` - Google Play listing content
- `feature-graphic.png` - Required Google Play graphics

## Step-by-Step Deployment Instructions

### iOS App Store Deployment

1. **Setup Developer Account**
   - Create Apple Developer account at developer.apple.com
   - Pay $99 annual fee
   - Verify identity and payment method

2. **Configure App in App Store Connect**
   - Login to appstoreconnect.apple.com
   - Create new app with Bundle ID: com.lemurexpress11.employee
   - Upload app icons and screenshots from `ios-screenshots/`
   - Fill in app description using `app-store-description.txt`

3. **Build and Upload**
   - Open `ios-build/` project in Xcode
   - Select "Any iOS Device" as target
   - Product → Archive
   - Upload to App Store through Xcode Organizer

4. **App Review Submission**
   - Complete app information in App Store Connect
   - Submit for review (typically 24-48 hours)

### Android Google Play Deployment

1. **Setup Google Play Console**
   - Create account at play.google.com/console
   - Pay $25 registration fee
   - Verify identity

2. **Create App in Console**
   - Create new app
   - Upload APK/AAB from `android-build/app-release.aab`
   - Add app icons from `android-icons/`
   - Upload screenshots from `android-screenshots/`

3. **Complete Store Listing**
   - Use content from `google-play-description.txt`
   - Upload feature graphic
   - Set app category: Business
   - Add privacy policy link

4. **Release Management**
   - Create production release
   - Upload signed AAB file
   - Submit for review

## Testing Credentials

For app review and testing purposes:
- **Username**: admin
- **Password**: 1234
- **Note**: These are testing credentials for App Store reviewers

## Support Information

- **Developer**: Lemur Express 11
- **Support Email**: support@lemurexpress11.com
- **Privacy Policy**: Included in deployment package
- **Terms of Service**: Basic business app terms included