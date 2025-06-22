# Lemur Express Pizza System - Complete Project Documentation

## PROJECT OVERVIEW
- **Name**: Lemur Express Pizza Ordering System
- **Type**: Full-stack web application with Android mobile app
- **Server**: Express.js + TypeScript running on Replit
- **Frontend**: React + Vite + TypeScript
- **Database**: Firebase + Local JSON storage backup
- **Mobile**: Capacitor-based Android app

## CURRENT REPLIT CONFIGURATION
- **Server URL**: https://15e8b74e-5e82-4bd4-8115-c38ee1ec49de-00-jywt9f6oi31b.kirk.replit.dev
- **Port**: 5000
- **Environment**: Node.js 20
- **Package Manager**: npm

## PROJECT STRUCTURE
```
/
├── server/           # Backend Express server
├── client/           # React frontend
├── android/          # Android app files
├── data/            # Local JSON storage
├── firebase-config.json  # Firebase configuration
└── capacitor.config.ts   # Mobile app config
```

## COMPLETED FEATURES

### ✅ Core Web Application
- Homepage with order statistics
- Pizza ordering system with customization
- Shopping cart functionality  
- Checkout with payment processing (Stripe integration)
- Order tracking system
- Customer response system
- Admin management portal
- Employee dashboard for order management

### ✅ Backend API
- Express.js server with TypeScript
- RESTful API endpoints for orders, users
- Firebase integration for real-time data
- Local JSON storage as backup
- Rate limiting and security headers
- CORS configuration for mobile app

### ✅ Database Systems
- Firebase Firestore for real-time data
- Local JSON storage (data/storage.json) for backup
- Order management with unique IDs
- User management system

### ✅ Mobile App (Android)
- Capacitor configuration for native Android
- Employee dashboard mobile interface
- Push notifications setup
- Network connectivity handling
- Offline capability

## CURRENT ISSUES BEING RESOLVED

### 🔧 Android App Connection Issue
**Problem**: Android app shows white screen with "Lemur Express" title
**Root Cause**: App configured to connect to localhost instead of Replit server
**Solution in Progress**:
1. Updated capacitor.config.ts to point to Replit URL
2. Updated Android assets configuration
3. Added proper routing for /employee endpoint
4. Currently rebuilding Android app with correct server URL

### 🔧 Server Configuration
**Current Server URL**: https://15e8b74e-5e82-4bd4-8115-c38ee1ec49de-00-jywt9f6oi31b.kirk.replit.dev
**Mobile App Endpoint**: /employee
**Status**: Server running successfully, mobile app connection being fixed

## API KEYS AND CONFIGURATION

### Firebase Configuration (firebase-config.json)
- Contains Firebase project configuration
- Used for real-time order synchronization
- Config loaded and working properly

### Environment Variables Needed
- STRIPE_SECRET_KEY (for payment processing)
- Firebase configuration (already configured via firebase-config.json)

### Important Routes
- `/` - Homepage
- `/employee` - Employee dashboard (mobile app target)
- `/mobile-employee` - Redirects to /employee
- `/api/orders` - Order management API
- `/api/health` - Health check endpoint

## TECHNICAL SPECIFICATIONS

### Server Configuration
- **Framework**: Express.js with TypeScript
- **Security**: Rate limiting, CORS headers, XSS protection
- **Static Files**: Vite-built React app served from client/dist
- **Database**: Dual system (Firebase + local JSON)

### Mobile App Configuration
- **Package ID**: com.lemurexpress11.employee
- **App Name**: Lemur Express 11 Employee
- **Target Platform**: Android
- **Framework**: Capacitor 7.x
- **Features**: Push notifications, local notifications, network detection

## NEXT STEPS TO COMPLETE

### 1. Fix Android App Connection (IN PROGRESS)
- Update Capacitor configuration to point to correct server
- Rebuild Android APK with new configuration
- Test connection between mobile app and server

### 2. Final Testing
- Verify all web application features work
- Test mobile app functionality
- Confirm order flow from mobile to web dashboard

### 3. Deployment Preparation
- Ensure all configurations are production-ready
- Verify security settings
- Test performance under load

## MIGRATION PROGRESS TRACKER

[x] 1. Install the required packages
[x] 2. Restart the workflow to see if the project is working
[ ] 3. Fix Android app connection to Replit server
[ ] 4. Verify mobile app functionality
[ ] 5. Complete final testing
[ ] 6. Mark migration as completed

## IMPORTANT NOTES FOR FUTURE REFERENCE

1. **Server URL Changes**: If Replit URL changes, update both capacitor.config.ts and android/app/src/main/assets/capacitor.config.json

2. **Firebase Configuration**: Firebase config is loaded from firebase-config.json and is working properly

3. **Order Data**: System has 13 existing orders loaded from persistent storage

4. **Mobile App Routes**: 
   - Main employee dashboard: /employee
   - Alternative route: /mobile-employee (redirects to /employee)

5. **Build Process**: 
   - Web app: `npm run build`
   - Android sync: `npx cap sync android`
   - Android build: `cd android && ./gradlew assembleDebug`

## CURRENT STATUS
- ✅ Web application: Fully functional
- ✅ Server: Running without errors
- ✅ Database: Firebase and local storage working
- 🔧 Android app: Connection issue being resolved
- 📱 Mobile interface: Ready, needs connection fix

Last Updated: January 22, 2025