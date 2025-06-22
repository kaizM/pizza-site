# Android SDK Setup Guide

The error indicates that Android SDK is not configured. Here's how to fix it:

## Option 1: Install Android Studio (Recommended)
1. Download Android Studio from https://developer.android.com/studio
2. Install and open Android Studio
3. Go through the setup wizard - it will automatically install the Android SDK
4. Open your project folder in Android Studio
5. Build the app using Android Studio's build system

## Option 2: Set ANDROID_HOME manually
If you have Android SDK installed elsewhere:

### macOS/Linux:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Windows:
```cmd
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\emulator
set PATH=%PATH%;%ANDROID_HOME%\tools
set PATH=%PATH%;%ANDROID_HOME%\platform-tools
```

## Option 3: Create local.properties file
Create a file called `local.properties` in your android folder:

```
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

Replace YOUR_USERNAME with your actual username.

## Quick Solution
The easiest approach is to use Android Studio since it handles all SDK management automatically.