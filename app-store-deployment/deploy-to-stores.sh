#!/bin/bash

# Lemur Express 11 - Google Play Store APK/AAB Builder
echo "Building Lemur Express 11 Android App for Google Play Store..."

# Build web assets first
echo "Building web assets..."
npm run build

# Initialize Capacitor project
echo "Setting up Android app..."
npx cap add android

# Sync web assets to Android project
echo "Syncing assets to Android..."
npx cap sync android

# Configure Android app
echo "Configuring Android app settings..."
mkdir -p android/app/src/main/res/values
cat > android/app/src/main/res/values/strings.xml << 'EOF'
<resources>
    <string name="app_name">Lemur Express 11</string>
    <string name="title_activity_main">Lemur Express 11</string>
</resources>
EOF

# Update Android manifest for proper permissions
echo "Setting Android permissions..."
cat > android/app/src/main/AndroidManifest.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
    <uses-permission android:name="android.permission.VIBRATE"/>
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/AppTheme.NoActionBarLaunch">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

echo ""
echo "ANDROID BUILD READY"
echo "==================="
echo "To create APK/AAB for Google Play Store:"
echo ""
echo "1. Install Android Studio"
echo "2. Open the 'android' folder in Android Studio"
echo "3. Go to Build > Generate Signed Bundle/APK"
echo "4. Choose 'Android App Bundle' (recommended for Play Store)"
echo "5. Create or use existing signing key"
echo "6. Build release version"
echo "7. Upload the .aab file to Google Play Console"
echo ""
echo "FEATURES INCLUDED:"
echo "✓ Customer pizza ordering system"
echo "✓ Employee dashboard with full order management"
echo "✓ Real-time Firebase synchronization"
echo "✓ Order status updates and time control"
echo "✓ Payment processing and substitutions"
echo "✓ Mobile-optimized touch interface"

# Open Android project
if command -v code &> /dev/null; then
    echo ""
    echo "Opening Android project in VS Code..."
    code android/
fi