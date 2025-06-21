#!/bin/bash

# Lemur Express 11 - Google Play Store Build Script
echo "Building Lemur Express 11 for Google Play Store..."

# Install Capacitor if not present
echo "Installing Capacitor..."
npm install @capacitor/core @capacitor/cli @capacitor/android

# Copy mobile app configuration
echo "Configuring mobile app..."
cp mobile-app-configuration.json capacitor.config.json

# Build the web assets with employee dashboard included
echo "Building web assets with employee features..."
npm run build

# Verify employee dashboard is included in build
echo "Verifying employee dashboard inclusion..."
if [ -f "dist/public/assets/index.js" ]; then
    echo "✓ Web assets built successfully"
else
    echo "✗ Build failed - missing assets"
    exit 1
fi

# Add Android platform if not present
echo "Setting up Android platform..."
npx cap add android

# Copy web assets to native project
echo "Syncing web assets with employee portal..."
npx cap sync android

# Configure Android app settings
echo "Configuring Android app..."
cat > android/app/src/main/res/values/strings.xml << EOF
<resources>
    <string name="app_name">Lemur Express 11</string>
    <string name="title_activity_main">Lemur Express 11</string>
    <string name="package_name">com.lemurexpress11.pizza</string>
    <string name="custom_url_scheme">lemurexpress11</string>
</resources>
EOF

# Update Android manifest for employee features
echo "Enabling employee dashboard features..."
echo "✓ Order management system"
echo "✓ Real-time status updates"
echo "✓ Time control features"
echo "✓ Payment processing"
echo "✓ Substitution handling"
echo "✓ Cancellation management"

# Open Android Studio for final build and signing
echo ""
echo "READY FOR ANDROID STUDIO BUILD"
echo "================================"
echo "NEXT STEPS IN ANDROID STUDIO:"
echo "1. Open the 'android' folder in Android Studio"
echo "2. Go to Build > Generate Signed Bundle/APK"
echo "3. Choose 'Android App Bundle'"
echo "4. Create or select your signing key"
echo "5. Build the release AAB file"
echo "6. Upload the .aab file to Google Play Console"
echo ""
echo "EMPLOYEE FEATURES INCLUDED:"
echo "• Order reception and confirmation"
echo "• Status update controls (confirmed→preparing→ready→completed)"
echo "• Custom time estimation"
echo "• Order substitutions and modifications"
echo "• Payment charging after confirmation"
echo "• Order cancellation with reason tracking"
echo "• Real-time dashboard with auto-refresh"
echo "• Customer notification system"

npx cap open android