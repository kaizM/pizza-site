# Pizza Ordering System - Complete Setup Guide

## 🚀 Quick Start (For New Developers)

This project is a full-stack pizza ordering system with React frontend, Express backend, Firebase integration, and Stripe payments. Everything is pre-configured and ready to run.

### Instant Setup Commands
```bash
# 1. Install dependencies (if needed)
npm install

# 2. Start the application
npm run dev
```

The application will automatically start on port 5000 and be accessible via the Replit webview.

## 📁 Project Structure

```
├── client/                 # React frontend
├── server/                 # Express backend
│   ├── index.ts           # Main server file
│   ├── routes.ts          # API endpoints
│   ├── firebase.ts        # Firebase integration
│   └── db.ts              # Database connection
├── data/storage.json      # Local data storage
├── firebase-config.json   # Firebase configuration
└── package.json           # Dependencies
```

## 🔧 Pre-Configured Features

### ✅ Already Working
- **Express Server**: Running on port 5000 with security headers
- **React Frontend**: Modern UI with Tailwind CSS
- **Firebase Integration**: Real-time order sync
- **Local Storage**: JSON-based data persistence
- **Order Management**: Complete order lifecycle
- **Payment Processing**: Stripe integration ready
- **Employee Dashboard**: Order management interface

### 📊 Current Data
- **10+ Sample Orders**: Real order data with various statuses
- **5 Pizza Types**: Cheese, Pepperoni, Lotsa Meat, Veggie Deluxe, BBQ Chicken
- **Customer Profiles**: Automatic customer tracking
- **Notifications**: Order status updates

## 🔑 Required Secrets (Add via Replit Secrets)

If you need to enable additional features, add these secrets in Replit:

```bash
# For Production Database (Optional)
DATABASE_URL=postgresql://user:password@host:port/database

# For Stripe Payments (When going live)
STRIPE_SECRET_KEY=sk_test_or_live_key
STRIPE_PUBLISHABLE_KEY=pk_test_or_live_key

# Firebase Config (Already configured in firebase-config.json)
# No additional secrets needed for current setup
```

## 🚨 Important: DO NOT ask for these again!

### Current Working Configuration:
- ✅ Firebase: Pre-configured with lemur-express-pizza project
- ✅ Local Storage: Working with 10+ orders in data/storage.json
- ✅ Server: Express running with proper security headers
- ✅ Frontend: React app with modern UI components
- ✅ Dependencies: All packages installed and working

## 🔄 Available Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm start              # Start production server

# Database
npm run db:push        # Push database schema (if using PostgreSQL)

# Type Checking
npm run check          # TypeScript type checking
```

## 🌐 API Endpoints

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Cancel order

### Menu
- `GET /api/pizzas` - Get pizza menu
- `PUT /api/pizzas/:id` - Update pizza availability

### Customer Management
- `GET /api/customers` - Get customer profiles
- `POST /api/customers` - Create customer profile

## 🔒 Security Features

- ✅ Security headers (XSS, CSRF protection)
- ✅ Rate limiting
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ CORS configuration

## 📱 Mobile App Support

The project includes Android build configuration:
- Capacitor setup for mobile deployment
- Android build scripts in `/android` directory
- PWA capabilities for web app installation

### Android Build Commands
```bash
cd android
./gradlew clean         # Clean build cache
./gradlew assembleDebug # Build debug APK
```

### Android Build Configuration
- Capacitor dependencies: 5.7.0 (verified in Maven Central)
- Status Bar & Splash Screen: 5.0.6 (stable versions)
- All repository conflicts resolved
- Build cache cleared and configuration verified

**Build Process**:
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

Dependencies verified to exist in Maven repositories - build issues resolved.

## 🔄 Data Flow

1. **Frontend**: React components handle user interactions
2. **API**: Express routes process requests
3. **Storage**: Data persisted to both local JSON and Firebase
4. **Real-time**: Firebase provides real-time updates
5. **Payments**: Stripe handles payment processing

## 🚀 Deployment Ready

The application is configured for Replit deployment:
- Server binds to 0.0.0.0 (required for Replit)
- Environment variables properly configured
- Build scripts optimized for production

## 🔧 Troubleshooting

### Common Issues:
1. **Port conflicts**: App runs on port 5000 by default
2. **Missing dependencies**: Run `npm install`
3. **Firebase errors**: Config is pre-loaded, no action needed
4. **Build errors**: Run `npm run check` for TypeScript issues

### Log Locations:
- Server logs: Visible in workflow console
- Frontend logs: Browser developer console
- API logs: Included in server output

## 📞 Support

If you encounter issues:
1. Check the workflow console for error messages
2. Verify all dependencies are installed
3. Ensure no port conflicts exist
4. Review this guide for configuration details

**Remember**: This system is fully configured and working. You should not need to provide any additional configuration or secrets unless adding new features.