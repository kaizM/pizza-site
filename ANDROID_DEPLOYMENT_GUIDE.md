# 📱 Lemur Express 11 - Android App Deployment Guide

## Essential Features Setup ✅

### 🌐 Internet Connectivity
- **Wi-Fi Access**: App automatically connects to available Wi-Fi networks
- **Cellular Data**: Works on 3G/4G/5G networks
- **Network Switching**: Seamlessly switches between Wi-Fi and cellular
- **Connection Testing**: Built-in health checks every 30 seconds

### 🔔 Real-Time Order Notifications
- **Instant Alerts**: Receives new orders immediately when placed
- **Sound Alerts**: Plays beep sounds even when app is in background
- **Vibration**: Phone vibrates for new orders (200ms pattern)
- **Visual Notifications**: Pop-up notifications with order details
- **Wake Screen**: Notifications wake the device from sleep mode

### 🔊 Audio System
- **Background Sounds**: Plays notification sounds even when app is minimized
- **Sleep Mode**: Sounds work when phone is locked/sleeping
- **Volume Control**: Respects device volume settings
- **Multiple Alerts**: Sequence of 3 beeps for new orders

### 🔄 Background Processing
- **Order Sync**: Checks for new orders every 3 seconds
- **Auto-Refresh**: Updates order list automatically
- **Offline Mode**: Caches data when connection is lost
- **Battery Optimization**: Requests exemption from battery optimization

## 🏗️ Build Instructions

### 1. Prepare for Build
```bash
# Run the build script
./build-android.sh
```

### 2. Configure Production Server
Update `capacitor.config.ts`:
```typescript
server: {
  url: 'https://your-replit-app.replit.app/employee',
  cleartext: true,
  androidScheme: 'https'
}
```

### 3. Build APK
```bash
# Open Android Studio
npx cap open android

# Or build from command line
cd android
./gradlew assembleDebug
```

## 📋 Android Permissions Included

### Network & Internet
- `INTERNET` - Basic internet access
- `ACCESS_NETWORK_STATE` - Check connection status
- `ACCESS_WIFI_STATE` - Monitor Wi-Fi connections

### Notifications & Alerts
- `POST_NOTIFICATIONS` - Show notifications (Android 13+)
- `VIBRATE` - Vibration for alerts
- `WAKE_LOCK` - Keep device awake for notifications
- `RECEIVE_BOOT_COMPLETED` - Start on device boot

### Background Processing
- `FOREGROUND_SERVICE` - Run in background
- `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` - Prevent battery kill

### Audio
- `MODIFY_AUDIO_SETTINGS` - Control notification sounds

## 🚀 Deployment Options

### Option 1: Google Play Store (Recommended)
1. Create signed app bundle (AAB)
2. Upload to Google Play Console
3. Set up app store listing
4. Submit for review

### Option 2: Direct APK Installation
1. Build debug APK
2. Enable "Unknown sources" on device
3. Install APK directly
4. Grant all required permissions

### Option 3: Internal Distribution
1. Use Google Play Console internal testing
2. Share with specific email addresses
3. Install via Play Store link

## ⚙️ Configuration Checklist

### Before Building:
- [ ] Update server URL in `capacitor.config.ts`
- [ ] Test web app functionality
- [ ] Verify API endpoints are accessible
- [ ] Check Firebase configuration (if using)

### After Building:
- [ ] Test on real Android device
- [ ] Verify internet connectivity
- [ ] Test notification sounds
- [ ] Check background processing
- [ ] Confirm order reception works

### For Production:
- [ ] Generate signed app bundle
- [ ] Set up crash reporting
- [ ] Configure push notifications (Firebase)
- [ ] Test on multiple devices/Android versions
- [ ] Submit to Play Store

## 🔧 Troubleshooting

### No Internet Connection
- Check network permissions in AndroidManifest.xml
- Verify network security config allows your server
- Test with both Wi-Fi and cellular data

### No Sound Notifications
- Check audio permissions
- Verify device volume is up
- Test with app in foreground first
- Check battery optimization settings

### App Stops Receiving Orders
- Disable battery optimization for the app
- Check background app restrictions
- Verify foreground service is running
- Test wake lock functionality

### Connection Issues
- Verify server URL is correct
- Check if HTTPS/HTTP is properly configured
- Test API endpoints manually
- Review network security config

## 📊 Performance Features

### Battery Optimization
- Efficient polling (3-second intervals)
- Smart background processing
- Proper wake lock management
- Battery usage monitoring

### Network Efficiency
- Compressed API responses
- Cached offline data
- Smart retry logic
- Connection quality monitoring

### User Experience
- Instant order notifications
- Smooth UI transitions
- Responsive design
- Clear error messages

## 🎯 Key Features for Restaurant Use

### Order Management
- Real-time order reception
- Status updates (Confirmed → Preparing → Ready)
- Order cancellation with reasons
- Time delay notifications

### Employee Features
- Ingredient substitution requests
- Customer communication
- Order tracking
- Performance analytics

### Reliability
- Works offline with cached data
- Automatic reconnection
- Error recovery
- Data synchronization

---

**Ready for Denmark deployment!** 🇩🇰

This app is configured for production use with all essential features for receiving orders, making notification sounds, and maintaining internet connectivity even when the device is sleeping.