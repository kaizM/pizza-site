#!/bin/bash

# iOS Build Script for Lemur Express 11 Employee App
# Run this script to build iOS app for App Store submission

echo "🍕 Building Lemur Express 11 Employee App for iOS..."

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Error: iOS builds require macOS with Xcode installed"
    exit 1
fi

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Error: Xcode is not installed. Please install Xcode from the App Store"
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")/../../../"

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building web assets..."
npm run build

echo "📱 Adding iOS platform..."
cd mobile-build
npx cap add ios

echo "🔄 Syncing project with Capacitor..."
npx cap sync ios

echo "📋 Copying iOS assets..."
npx cap copy ios

echo "🚀 Opening Xcode project..."
npx cap open ios

echo "✅ iOS project is ready!"
echo ""
echo "Next steps in Xcode:"
echo "1. Select 'Any iOS Device' as build target"
echo "2. Go to Product → Archive"
echo "3. Upload to App Store Connect"
echo ""
echo "App Information:"
echo "- Bundle ID: com.lemurexpress11.employee"
echo "- App Name: Lemur Express 11 Employee"
echo "- Version: 1.0.0"