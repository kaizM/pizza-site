#!/bin/bash

# Employee Android App Builder - Clean, Professional Build
echo "Building Employee Android App..."

# Configure for employee app
cat > capacitor.config.ts << 'EOF'
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lemurexpress11.employee',
  appName: 'Lemur Express 11 Employee',
  webDir: 'dist/public',
  server: {
    url: 'http://localhost:5000',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true
  }
};

export default config;
EOF

# Build and configure
npm run build
npx cap add android
npx cap sync android

# Configure Android app
mkdir -p android/app/src/main/res/values
echo '<resources><string name="app_name">Lemur Express 11 Employee</string></resources>' > android/app/src/main/res/values/strings.xml

echo "Employee Android app ready. Open 'android' folder in Android Studio to build AAB for Google Play Store."