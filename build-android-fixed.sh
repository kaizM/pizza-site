#!/bin/bash

echo "🔧 Building Fixed Android App for Lemur Express Employee Dashboard"

# Update Capacitor config
echo "📝 Updating Capacitor configuration..."
npx cap copy android
npx cap sync android

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean
cd ..

# Build the app
echo "🏗️ Building Android APK..."
cd android
./gradlew assembleDebug --stacktrace --info

if [ $? -eq 0 ]; then
    echo "✅ Android APK built successfully!"
    echo "📱 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "🚀 Installation instructions:"
    echo "1. Transfer the APK file to your Android device"
    echo "2. Enable 'Unknown Sources' in Android settings"
    echo "3. Install the APK"
    echo "4. Open 'Lemur Express 11 Employee' app"
    echo ""
    echo "🔗 App connects to: https://b5466a18-5c2c-4a10-9583-b9c4d86c4b73-00-1mnqf72b2m33c.riker.replit.dev/mobile-employee"
else
    echo "❌ Build failed. Check the error messages above."
fi