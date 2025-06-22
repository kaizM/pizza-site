#!/bin/bash
echo "Quick Android App Build Script"

# Kill any running gradle processes
pkill -f gradle
pkill -f java

# Update Android configuration
echo "Updating Android configuration..."
npx cap sync android --no-open

# Create a simple APK build script
echo "Building APK with minimal resources..."
cd android
export GRADLE_OPTS="-Xmx1024m -Dfile.encoding=UTF-8"
./gradlew assembleDebug --no-daemon --max-workers=1 --parallel=false --configure-on-demand=false

echo "Android build completed"