#!/bin/bash

# Android Build Script for Lemur Express 11 Employee App
# Run this script to build Android app for Google Play Store submission

echo "🍕 Building Lemur Express 11 Employee App for Android..."

# Navigate to project root
cd "$(dirname "$0")/../../../"

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building web assets..."
npm run build

echo "🤖 Adding Android platform..."
cd mobile-build
npx cap add android

echo "🔄 Syncing project with Capacitor..."
npx cap sync android

echo "📋 Copying Android assets..."
npx cap copy android

echo "🔧 Building APK/AAB..."
cd android
./gradlew assembleRelease
./gradlew bundleRelease

echo "✅ Android build complete!"
echo ""
echo "Build artifacts:"
echo "- APK: android/app/build/outputs/apk/release/app-release.apk"
echo "- AAB: android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "Next steps:"
echo "1. Upload AAB file to Google Play Console"
echo "2. Complete store listing with provided descriptions"
echo "3. Submit for review"
echo ""
echo "App Information:"
echo "- Package Name: com.lemurexpress11.employee"
echo "- App Name: Lemur Express 11 Employee"
echo "- Version: 1.0.0"