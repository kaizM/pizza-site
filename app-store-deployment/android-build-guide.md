# Android Build Guide for Google Play Store

## Quick Start

1. **Run the build script:**
   ```bash
   cd app-store-deployment
   ./deploy-to-stores.sh
   ```

2. **Download and install Android Studio** from https://developer.android.com/studio

3. **Open the project:**
   - Open Android Studio
   - Click "Open an existing project"
   - Navigate to the `android` folder created by the script
   - Wait for Gradle sync to complete

4. **Generate the AAB file:**
   - Go to `Build` → `Generate Signed Bundle / APK`
   - Select `Android App Bundle`
   - Create a new keystore (save this file - you'll need it for updates)
   - Fill in keystore details:
     - Key store path: Choose a secure location
     - Password: Create a strong password
     - Key alias: lemurexpress11
     - Key password: Same as keystore password
   - Click `Next` → `Finish`

5. **Locate your AAB file:**
   - Find the generated `.aab` file in `android/app/release/`
   - This is the file you upload to Google Play Console

## Upload to Google Play Console

1. **Create Google Play Console account** ($25 one-time fee)
2. **Create new app** in the console
3. **Upload the AAB file** in the Release section
4. **Complete store listing** using content from `store-listing.md`
5. **Submit for review**

## What's Included in Your App

- Complete pizza ordering system for customers
- Full employee dashboard with order management
- Real-time Firebase synchronization
- All existing web app features converted to mobile

Your web app is now a proper Android app ready for Google Play Store.