# Google Play Store Deployment Guide

## Quick Start

```bash
./create-android-app.sh
```

## Step-by-Step Process

### 1. Prepare Your App
Your web app is already built with:
- Capacitor configuration ✓
- Employee dashboard ✓
- Firebase integration ✓

### 2. Generate Android Files
Run the script to create Android app structure:
```bash
./create-android-app.sh
```

### 3. Android Studio Setup
1. Download Android Studio from: https://developer.android.com/studio
2. Install and open Android Studio
3. Open the `android` folder in your project
4. Wait for Gradle sync to complete

### 4. Create Signed App Bundle
1. In Android Studio: **Build > Generate Signed Bundle/APK**
2. Choose **Android App Bundle (.aab)**
3. Create new keystore or use existing one:
   - Keystore path: Choose location
   - Password: Create secure password
   - Key alias: Your app name
   - Validity: 25+ years
4. Build the .aab file

### 5. Google Play Console
1. Go to: https://play.google.com/console
2. Create developer account ($25 one-time fee)
3. Create new app
4. Upload your .aab file
5. Fill in app details:
   - Title: "Lemur Express 11 Employee"
   - Description: "Employee dashboard for pizza order management"
   - Category: Business
   - Screenshots: Take from Android emulator

### 6. App Store Listing
**Title:** Lemur Express 11 Employee Dashboard

**Description:**
Professional order management system for pizza restaurant employees. Manage orders, update status, handle payments, and communicate with customers in real-time.

Features:
- Real-time order tracking
- Payment processing
- Order status updates
- Customer communication
- Time management tools

## Technical Details
- App ID: com.lemurexpress11.employee
- Server: localhost:5000 (change for production)
- Platform: Android (Capacitor-based)
- Authentication: Built-in employee login

## Before Publishing
1. Update server URL from localhost to your production domain
2. Test thoroughly on physical Android device
3. Create privacy policy
4. Add app screenshots and store listing graphics