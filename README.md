# UPDATE-PIZZA-APP
<<<<<<< HEAD

A modern pizza ordering system built with React, Express, and Firebase. This application provides a complete solution for customers to order pizzas online and employees to manage orders.

## Features

### Customer Features
- Browse pizza menu with customizable options
- Add items to cart with size, crust, and topping selections
- Secure checkout process with payment integration
- Order tracking and status updates
- Customer profile management

### Employee Features
- Order management dashboard
- Real-time order status updates
- Customer notification system
- Sales analytics and reporting
- Order cancellation and substitution handling

### Technical Features
- React frontend with TypeScript
- Express.js backend API
- Firebase integration for real-time data
- Drizzle ORM for database management
- Responsive design with Tailwind CSS
- Order persistence and offline support

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: Firebase Firestore
- **Payment**: Stripe integration
- **UI Components**: Radix UI, shadcn/ui

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (optional - uses persistent storage by default)

### Installation

1. Clone the repository
```bash
git clone https://github.com/kaizM/UPDATE-PIZZA-APP.git
cd UPDATE-PIZZA-APP
```

2. Install dependencies
```bash
npm install
```

3. Configure Firebase (optional)
Update `firebase-config.json` with your Firebase project credentials:
```json
{
  "apiKey": "your-api-key",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project-id",
  "storageBucket": "your-project.firebasestorage.app",
  "appId": "your-app-id"
}
```

4. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Usage

### Customer Interface
- Visit the homepage to browse the pizza menu
- Click on pizzas to customize size, crust, and toppings
- Add items to cart and proceed to checkout
- Enter customer information and complete payment
- Track order status in real-time

### Employee Interface
- Access the employee dashboard at `/employee`
- View and manage incoming orders
- Update order status (confirmed, preparing, ready, completed)
- Handle cancellations and substitutions
- View sales analytics and reports

## API Endpoints

- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status
- `GET /api/pizzas` - Get pizza menu
- `POST /api/orders/:id/cancel` - Cancel order

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities
├── server/              # Express backend
│   ├── routes/          # API routes
│   ├── storage/         # Storage implementations
│   └── config/          # Configuration
├── shared/              # Shared types and schemas
└── data/               # Persistent data storage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
=======
>>>>>>> dea99ca7535f1a077292c071dcf0425f54ccb3c3
