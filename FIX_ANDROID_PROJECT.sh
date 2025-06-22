#!/bin/bash

# Complete Android Project Fix Script
# Run this in your downloaded project folder on Mac

set -e

echo "Fixing Android project structure..."
echo ""

# Remove existing broken android folder if it exists
if [ -d "android" ]; then
    echo "Removing existing Android project..."
    rm -rf android
fi

# Regenerate Android project using Capacitor
echo "Regenerating Android project with Capacitor..."
npx cap add android

# Fix the MainActivity.java file
echo "Fixing MainActivity.java..."
mkdir -p android/app/src/main/java/com/lemurexpress11/employee/
cat > android/app/src/main/java/com/lemurexpress11/employee/MainActivity.java << 'EOF'
package com.lemurexpress11.employee;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }
}
EOF

# Update Android app build.gradle.kts with proper dependencies
echo "Updating Android build configuration..."
cat > android/app/build.gradle.kts << 'EOF'
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

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
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    
    // Capacitor dependencies
    implementation("com.capacitorjs:core:7.4.0")
    implementation("com.capacitorjs:android:7.4.0")
    
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}

apply from: 'capacitor.build.gradle'
EOF

# Build web assets and sync
echo "Building web assets..."
npm run build

echo "Syncing assets to Android..."
npx cap sync android

echo "Building Android APK..."
cd android
chmod +x gradlew
./gradlew assembleDebug

echo ""
echo "SUCCESS! Your APK is ready!"
echo "Location: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "To install on Android device:"
echo "1. Transfer APK to your Android device"
echo "2. Enable 'Install from unknown sources' in Settings"
echo "3. Install the APK"