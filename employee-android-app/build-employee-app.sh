#!/bin/bash

# Employee Dashboard Android App Builder
echo "Building Employee Dashboard Android App..."

# Create employee-specific Capacitor config
cat > capacitor-employee.config.ts << 'EOF'
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lemurexpress11.employee',
  appName: 'Lemur Express 11 Employee',
  webDir: 'dist/public',
  server: {
    url: 'http://localhost:5000', // Connect to your existing server
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: "#1f2937",
      showSpinner: true,
      spinnerColor: "#ffffff"
    }
  }
};

export default config;
EOF

# Build web assets (this includes your employee dashboard)
echo "Building web assets with employee dashboard..."
npm run build

# Copy Capacitor config for employee app
cp capacitor-employee.config.ts capacitor.config.ts

# Add Android platform
echo "Setting up Android platform for employee app..."
npx cap add android

# Sync assets to Android
echo "Syncing employee dashboard to Android..."
npx cap sync android

# Configure Android app for employee use
echo "Configuring Android app for employees..."
mkdir -p android/app/src/main/res/values

cat > android/app/src/main/res/values/strings.xml << 'EOF'
<resources>
    <string name="app_name">Lemur Express 11 Employee</string>
    <string name="title_activity_main">Employee Dashboard</string>
</resources>
EOF

echo ""
echo "EMPLOYEE ANDROID APP READY"
echo "=========================="
echo "The Android app connects to your existing server at localhost:5000"
echo "Employee dashboard with all order management features is included"
echo ""
echo "To create APK/AAB for Google Play Store:"
echo "1. Open 'android' folder in Android Studio"
echo "2. Build > Generate Signed Bundle/APK"
echo "3. Upload the .aab file to Google Play Store"
echo ""
echo "Features included:"
echo "• Receive all customer orders in real-time"
echo "• Order status management"
echo "• Time estimation and control"
echo "• Payment processing"
echo "• Order modifications and substitutions"