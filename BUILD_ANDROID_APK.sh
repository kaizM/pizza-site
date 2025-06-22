#!/bin/bash

# Complete Android APK Build Script for Pizza Ordering App
# Run this on your local Mac after downloading the project

set -e

echo "🍕 Building Pizza Ordering Android APK..."
echo ""

# Step 1: Build web assets
echo "1. Building web application..."
npm install
npm run build

# Step 2: Sync with Capacitor
echo "2. Syncing web assets to Android..."
npx cap sync android

# Step 3: Build Android APK
echo "3. Building Android APK..."
cd android

# Set execute permissions on gradlew
chmod +x gradlew

# Build the APK
./gradlew assembleDebug

echo ""
echo "✅ SUCCESS! Your Pizza Ordering APK has been built!"
echo ""
echo "📱 APK Location: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "To install on your Android device:"
echo "1. Copy the APK file to your Android device"
echo "2. Enable 'Install from unknown sources' in Android Settings"
echo "3. Tap the APK file to install"
echo ""
echo "🎉 Your pizza ordering app is ready for Android!"