#!/bin/bash

echo "🍕 Building Lemur Express 11 Android App..."

# Check if we have the required tools
if ! command -v npx &> /dev/null; then
    echo "❌ Node.js/npm not found. Please install Node.js first."
    exit 1
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Build the web app for production
echo "🔨 Building web application..."
npm run build

# Sync Capacitor
echo "📱 Syncing Capacitor..."
npx cap sync android

# Update Capacitor config for production
echo "⚙️ Updating configuration..."
# For production deployment, update the server URL in capacitor.config.ts
# to point to your deployed Replit app URL instead of localhost

echo "🎯 Setting up Android permissions and features..."

# Ensure all required Android permissions are set
cat > android/app/src/main/AndroidManifest.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Network and Internet -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    
    <!-- Notifications and Alerts -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    
    <!-- Audio for notification sounds -->
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    
    <!-- Background processing -->
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme.NoActionBarLaunch"
        android:usesCleartextTraffic="true"
        android:networkSecurityConfig="@xml/network_security_config">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name="com.lemurexpress11.employee.MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme.NoActionBarLaunch">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths"></meta-data>
        </provider>

    </application>

</manifest>
EOF

# Create network security config for HTTP connections
mkdir -p android/app/src/main/res/xml
cat > android/app/src/main/res/xml/network_security_config.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">192.168.0.1</domain>
        <domain includeSubdomains="true">192.168.1.1</domain>
        <domain includeSubdomains="true">replit.app</domain>
        <domain includeSubdomains="true">replit.dev</domain>
    </domain-config>
</network-security-config>
EOF

echo "✅ Android app build preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update capacitor.config.ts with your production server URL"
echo "2. Open Android Studio: npx cap open android"
echo "3. Build APK or generate signed bundle for Play Store"
echo "4. Test on a real Android device"
echo ""
echo "🔗 Key features enabled:"
echo "  ✓ Internet connectivity and Wi-Fi access"
echo "  ✓ Push notifications and sound alerts"
echo "  ✓ Background processing for order updates"
echo "  ✓ Vibration and wake-lock for sleeping devices"
echo "  ✓ Network security for HTTP/HTTPS connections"
echo ""
echo "🚀 Ready for deployment to Google Play Store!"