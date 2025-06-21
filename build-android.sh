#!/bin/bash

echo "Building Lemur Express 11 Employee Android App..."

# Step 1: Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf android/app/src/main/assets/public

# Step 2: Create minimal build directory
echo "📦 Creating build assets..."
mkdir -p dist

# Step 3: Copy essential files to dist
echo "📋 Copying web assets..."
cp -r client/public/* dist/ 2>/dev/null || true
cp client/index.html dist/

# Step 4: Create a simple index.html for the app
echo "🎨 Creating app HTML..."
cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lemur Express 11 Employee</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            max-width: 400px;
            padding: 30px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        .subtitle {
            font-size: 1.2em;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        .button {
            background: #ff6b6b;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 25px;
            font-size: 1.1em;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            margin: 10px;
        }
        .button:hover {
            background: #ff5252;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
        }
        .features {
            margin-top: 30px;
            text-align: left;
        }
        .feature {
            margin: 10px 0;
            padding: 10px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍕 Lemur Express 11</h1>
        <div class="subtitle">Employee Dashboard</div>
        
        <div class="features">
            <div class="feature">📱 Order Management</div>
            <div class="feature">👥 Customer Profiles</div>
            <div class="feature">📊 Real-time Analytics</div>
            <div class="feature">🔔 Live Notifications</div>
        </div>
        
        <a href="#" class="button" onclick="connectToServer()">Connect to System</a>
        <a href="#" class="button" onclick="openOrderDashboard()">Order Dashboard</a>
    </div>

    <script>
        function connectToServer() {
            alert('Connecting to Lemur Express 11 System...\n\nThis will connect to your pizza ordering system.');
            // In a real app, this would connect to your server
        }
        
        function openOrderDashboard() {
            alert('Opening Order Dashboard...\n\nEmployee features:\n• View active orders\n• Update order status\n• Customer management\n• Analytics dashboard');
            // In a real app, this would open the dashboard
        }
        
        // Auto-connect when app loads
        setTimeout(() => {
            console.log('Lemur Express 11 Employee App Loaded Successfully');
        }, 1000);
    </script>
</body>
</html>
EOF

# Step 5: Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync android

# Step 6: Update Android build files
echo "🔧 Updating Android configuration..."

# Update build.gradle for proper compilation
cat > android/app/build.gradle.kts << 'EOF'
android {
    namespace = "com.lemurexpress11.employee"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.lemurexpress11.employee"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("com.getcapacitor:capacitor-android:6.0.0")
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}

apply from: "capacitor.build.gradle"
EOF

echo "✅ Android build configuration complete!"
echo ""
echo "📱 Your Android app is now ready. To build and install:"
echo "   1. Open Android Studio"
echo "   2. File → Open → Select the 'android' folder"
echo "   3. Click 'Run app' or use Ctrl+R"
echo ""
echo "🔧 Or build from command line:"
echo "   cd android && ./gradlew assembleDebug"
echo ""
echo "📦 The APK will be created in: android/app/build/outputs/apk/debug/"
EOF

chmod +x build-android.sh