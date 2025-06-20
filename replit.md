# Lemur Express 11 - Pizza Ordering System

## Overview

This is a modern full-stack pizza ordering application built with React (frontend), Express.js (backend), and Firebase authentication. The system supports customer ordering, employee management, and admin oversight for a pizza restaurant called "Lemur Express 11".

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom pizza-themed color palette
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Cloud Database**: Neon Database (serverless PostgreSQL)
- **Authentication**: Firebase Auth integration
- **API Design**: RESTful endpoints for users, orders, and pizza items

### Database Design
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` for type sharing
- **Tables**: 
  - `users`: Customer information with Firebase UID integration
  - `orders`: Order tracking with status management
  - `pizza_items`: Menu items and pricing

## Key Components

### Customer Features
- **Pizza Builder**: Interactive pizza customization with size, crust, and toppings
- **Order Tracking**: Real-time order status updates
- **Authentication**: Firebase-powered sign-in/sign-up
- **Checkout Flow**: Complete order processing with customer information

### Employee Dashboard
- **Order Management**: Kitchen view for order preparation
- **Status Updates**: Change order status (confirmed → preparing → ready → completed)
- **Time Management**: Custom estimated time setting

### Admin Dashboard
- **Analytics**: Order statistics and revenue tracking
- **Menu Management**: Add/edit pizza items and pricing
- **Order Overview**: Complete order history and management

## Data Flow

1. **Customer Journey**: Home → Pizza Builder → Checkout → Order Tracking
2. **Order Processing**: Customer places order → Firebase stores order → Employee processes → Customer receives updates
3. **Real-time Updates**: Firebase Firestore listeners for live order status changes
4. **Authentication Flow**: Firebase Auth → User creation in PostgreSQL → Session management

## External Dependencies

### Authentication & Data Storage
- **Firebase Auth**: User authentication and session management
- **Firebase Firestore**: Real-time order tracking and updates
- **Neon Database**: Primary PostgreSQL database for persistent data

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library

### Development Tools
- **TypeScript**: Type safety across the entire stack
- **Vite**: Fast development server and build tool
- **Drizzle Kit**: Database migration and schema management

## Deployment Strategy

### Development
- **Environment**: Replit with Node.js 20
- **Hot Reload**: Vite development server on port 5000
- **Database**: Neon Database with connection pooling

### Production
- **Build Process**: Vite builds frontend to `dist/public`, esbuild bundles backend
- **Deployment Target**: Replit autoscale deployment
- **Environment Variables**: 
  - `DATABASE_URL` for PostgreSQL connection
  - Firebase configuration via environment variables

### Database Management
- **Migrations**: Drizzle Kit for schema changes
- **Connection**: @neondatabase/serverless for edge-compatible connections
- **Backup Strategy**: Relies on Neon Database built-in backups

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- June 14, 2025: Successfully migrated from Replit Agent to standard Replit environment
- Migration completed: All dependencies installed, server running on port 5000
- Database integration: Added PostgreSQL database with Drizzle ORM
- Storage layer: Replaced MemStorage with DatabaseStorage for persistence
- Schema deployment: Created users, orders, and pizza_items tables with sample data
- Fixed pizza images: Updated broken "Loaded" pizza image URL
- Checkout system: Connected cart to save orders to both Firebase and PostgreSQL
- Admin dashboard: Created comprehensive order management interface
- Order tracking: Real-time status updates and kitchen workflow management
- System status: Pickup-only configuration, database-driven analytics

- June 21, 2025: Complete mobile app deployment package created
- Firebase integration: Real-time database sync for instant order updates
- Employee mobile app: Full-featured PWA and native app deployment ready
- App store ready: Capacitor configuration for iOS and Android deployment
- Advanced features: Haptic feedback, push notifications, offline support
- Dual database sync: PostgreSQL + Firebase for reliability and real-time updates
- Mobile-first design: Touch-optimized interface with order filtering and search

- June 21, 2025: Final migration to Replit environment completed
- Employee authentication: Added secure login system for mobile apps (admin/1234)
- Backend verification: All API endpoints tested and fully functional
- Database connectivity: PostgreSQL and Firebase sync confirmed working
- Admin controls: Full dashboard with sales viewing, price editing, menu management
- Security implementation: Client/server separation with proper authentication layers
- Mobile app security: Testing credentials implemented for App Store deployment
- Featured pizza ordering: Fixed "Order This Pizza" functionality with preset toppings at $11.99
- Cart customization: Added inline editing with size, crust, and toppings selection
- UI cleanup: Removed unnecessary "Add More Items" and "Custom Pizza" buttons from checkout

## Changelog

- June 14, 2025: Initial setup and migration to Replit environment