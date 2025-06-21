#!/bin/bash

echo "Building Lemur Express 11 Employee Android App..."

# Find and set Java environment
if [ -z "$JAVA_HOME" ]; then
    JAVA_PATH=$(which java)
    if [ -n "$JAVA_PATH" ]; then
        export JAVA_HOME=$(dirname $(dirname $JAVA_PATH))
        echo "Setting JAVA_HOME to: $JAVA_HOME"
    fi
fi

# Step 1: Build the web application first
echo "Building web application..."
npm run build

# Step 2: Sync with Capacitor
echo "Syncing with Capacitor..."
npx cap sync android

# Step 3: Build Android app
echo "Building Android APK..."
cd android

# Build the Android APK
export GRADLE_OPTS="-Xmx2g -Dorg.gradle.daemon=false"
timeout 300 ./gradlew assembleDebug --no-daemon --stacktrace

if [ $? -eq 0 ]; then
    echo "Android build complete! APK location: android/app/build/outputs/apk/debug/app-debug.apk"
else
    echo "Android build failed or timed out. Check configuration."
    exit 1
fi