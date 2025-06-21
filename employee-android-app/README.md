# Employee Android App for Lemur Express 11

## What This Creates
- Separate Android app for employees only
- Connects to your existing web server (keeps customer web app unchanged)
- Gets all orders from your current system
- Full employee dashboard functionality

## Quick Build
```bash
chmod +x build-employee-app.sh
./build-employee-app.sh
```

## What Happens
1. Uses your existing employee dashboard code
2. Creates Android app that connects to localhost:5000
3. All customer orders appear in the mobile employee app
4. Ready for Google Play Store upload

## Your Setup After Build
- **Customer side**: Unchanged - stays as web app
- **Employee side**: New Android app with full order management
- **Server**: Same server handles both (no changes needed)

The employee Android app receives all orders from customers using your web app.