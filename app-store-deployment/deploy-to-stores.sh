#!/bin/bash

# Lemur Express 11 - Single App Store Deployment Script
echo "Building Lemur Express 11 for Google Play Store & App Store..."

# Build web assets (includes all employee dashboard features)
npm run build

# Install mobile dependencies
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# Add mobile platforms
npx cap add android
npx cap add ios

# Sync all assets to mobile platforms
npx cap sync

echo ""
echo "DEPLOYMENT READY"
echo "================"
echo "Google Play Store: Open 'android' folder in Android Studio"
echo "Apple App Store: Open 'ios' folder in Xcode" 
echo ""
echo "INCLUDED FEATURES:"
echo "✓ Customer pizza ordering"
echo "✓ Employee dashboard with order management"
echo "✓ Real-time status updates"
echo "✓ Payment processing"
echo "✓ Time control and substitutions"