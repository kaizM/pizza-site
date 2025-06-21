#!/bin/bash

# Lemur Express 11 - Google Play Store Build Script
echo "Building Lemur Express 11 for Google Play Store..."

# Build the web assets
echo "Building web assets..."
npm run build

# Add Android platform if not present
echo "Setting up Android platform..."
npx cap add android

# Copy web assets to native project
echo "Syncing web assets..."
npx cap sync android

# Open Android Studio for final build and signing
echo "Opening Android Studio..."
echo ""
echo "NEXT STEPS IN ANDROID STUDIO:"
echo "1. Open the 'android' folder in Android Studio"
echo "2. Go to Build > Generate Signed Bundle/APK"
echo "3. Choose 'Android App Bundle'"
echo "4. Create or select your signing key"
echo "5. Build the release AAB file"
echo "6. Upload the .aab file to Google Play Console"

npx cap open android