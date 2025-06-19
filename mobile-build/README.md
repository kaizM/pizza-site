# Lemur Express 11 Employee Mobile App

This is the mobile app version of the Lemur Express 11 employee kitchen management system, built for both iOS and Android app stores.

## Features

### Core Functionality
- Real-time order management and tracking
- Order status updates (confirmed → preparing → ready → completed)
- Customer information display
- Order item details with customizations
- Time estimation for order preparation
- Push notifications for new orders
- Offline capability with service worker caching

### Mobile-Specific Features
- Progressive Web App (PWA) with install prompt
- Native-like interface optimized for mobile screens
- Touch-friendly controls and gestures
- Haptic feedback for important actions
- Background notifications
- App icon and splash screen
- Full-screen standalone mode

### Technical Features
- Auto-refresh every 5 seconds for real-time updates
- Persistent storage for offline functionality
- Service worker for background sync
- Responsive design for all screen sizes
- Fast loading with optimized assets

## Installation Methods

### Method 1: PWA Installation (Immediate)
1. Open the app in a mobile browser
2. Navigate to `/employee` route
3. Tap the "Install" button when prompted
4. Add to home screen

### Method 2: App Store Deployment (Production)
1. Build the web app: `npm run build`
2. Copy files to mobile-build: `cap copy`
3. Add platforms: `cap add ios && cap add android`
4. Open in Xcode/Android Studio: `cap open ios` or `cap open android`
5. Configure app signing and metadata
6. Submit to App Store/Play Store

## App Store Requirements

### iOS App Store
- Bundle ID: `com.lemurexpress11.employee`
- Minimum iOS version: 13.0
- App category: Business
- Privacy policy required
- App Store Connect account required

### Android Play Store
- Package name: `com.lemurexpress11.employee`
- Minimum Android API: 22 (Android 5.1)
- Target API: Latest
- Google Play Console account required
- App signing by Google Play

## Configuration

### App Icons
- 192x192px SVG icon provided
- Adaptive icons for Android
- iOS icon variants generated automatically

### Splash Screen
- Orange theme (#f97316) matching brand
- Lemur Express 11 branding
- 2-second display duration

### Push Notifications
- New order alerts
- Order status updates
- Configurable notification preferences
- Background notification handling

## Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Mobile development
cd mobile-build
npm install
cap add ios
cap add android
cap sync

# Open in native IDEs
cap open ios
cap open android
```

## Environment Variables

For production deployment, configure:
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Set to 'production'
- `VAPID_PUBLIC_KEY`: For push notifications
- `VAPID_PRIVATE_KEY`: For push notifications

## API Endpoints Used

- `GET /api/orders` - Fetch all orders
- `PATCH /api/orders/:id` - Update order status
- Auto-refresh every 5 seconds for real-time updates

## Security Features

- HTTPS required for PWA installation
- Secure API communication
- No sensitive data stored locally
- Session-based authentication

## Performance Optimizations

- Service worker caching
- Lazy loading of components
- Optimized bundle size
- Image optimization
- Database query optimization

## Support

For technical support or deployment assistance, contact the development team.