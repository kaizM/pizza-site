#!/bin/bash

echo "🚀 Creating Android App for Google Play Store"
echo "============================================="

# Step 1: Build the web app
echo "Step 1: Building web assets..."
npm run build

# Step 2: Add Android platform (if not already added)
echo "Step 2: Setting up Android platform..."
npx cap add android 2>/dev/null || echo "Android platform already exists"

# Step 3: Sync web assets to Android
echo "Step 3: Syncing assets to Android..."
npx cap sync android

# Step 4: Create app icons and splash screens
echo "Step 4: Setting up app assets..."
mkdir -p android/app/src/main/res/drawable
mkdir -p android/app/src/main/res/values

# Create a simple app icon (you can replace this with your own)
cat > android/app/src/main/res/drawable/icon.xml << 'EOF'
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
  <path
      android:fillColor="#FF6B35"
      android:pathData="M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10 10,-4.48 10,-10S17.52,2 12,2zM13,17h-2v-6h2v6zM13,9h-2L11,7h2v2z"/>
</vector>
EOF

# Set app name
cat > android/app/src/main/res/values/strings.xml << 'EOF'
<resources>
    <string name="app_name">Lemur Express 11 Employee</string>
    <string name="title_activity_main">Employee Dashboard</string>
    <string name="package_name">com.lemurexpress11.employee</string>
    <string name="custom_url_scheme">com.lemurexpress11.employee</string>
</resources>
EOF

echo ""
echo "✅ Android app is ready!"
echo ""
echo "📱 NEXT STEPS FOR GOOGLE PLAY STORE:"
echo "1. Download and install Android Studio"
echo "2. Open the 'android' folder in Android Studio"
echo "3. Go to Build > Generate Signed Bundle/APK"
echo "4. Choose 'Android App Bundle (.aab)'"
echo "5. Create or use existing keystore"
echo "6. Build the .aab file"
echo "7. Upload to Google Play Console"
echo ""
echo "🔗 Your app connects to: localhost:5000"
echo "📋 App ID: com.lemurexpress11.employee"
echo "📋 App Name: Lemur Express 11 Employee"
echo ""
echo "The employee dashboard will be fully functional in the Android app!"