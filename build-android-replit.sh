#!/bin/bash

# Build Android APK using Capacitor in Replit
set -e

echo "Building web assets for Android..."

# Build the web application
npm run build

echo "Syncing assets to Android project..."

# Copy web assets to Android
npx cap sync android

echo "Web assets have been synced to the Android project."
echo ""
echo "To complete the Android build, you need to:"
echo "1. Download this project to your local machine"
echo "2. Open Android Studio"
echo "3. Open the 'android' folder as an Android project"
echo "4. Build > Generate Signed Bundle / APK"
echo ""
echo "The Android project is now ready with all web assets included."