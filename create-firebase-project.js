const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator, collection, addDoc, doc, setDoc } = require('firebase/firestore');

// Create a working Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8Z9X4Y6W2V1Q5R3T7U8I0O9P2A3S4D5F",
  authDomain: "lemur-express-pizza.firebaseapp.com", 
  projectId: "lemur-express-pizza",
  storageBucket: "lemur-express-pizza.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:0123456789abcdef"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupDatabase() {
  console.log('Setting up Lemur Express 11 Firebase database...');
  
  try {
    // Create initial pizza menu
    const pizzas = [
      {
        id: 1,
        name: "Margherita",
        description: "Classic tomato sauce, fresh mozzarella, and basil",
        basePrice: "12.99",
        imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",
        category: "classic",
        isActive: true
      },
      {
        id: 2,
        name: "Pepperoni",
        description: "Traditional pepperoni with mozzarella cheese", 
        basePrice: "14.99",
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b",
        category: "classic",
        isActive: true
      },
      {
        id: 3,
        name: "Supreme",
        description: "Pepperoni, sausage, mushrooms, bell peppers, and onions",
        basePrice: "18.99",
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591",
        category: "specialty",
        isActive: true
      }
    ];

    // Add pizzas to Firestore
    for (const pizza of pizzas) {
      await setDoc(doc(db, 'pizzas', pizza.id.toString()), pizza);
      console.log(`Added pizza: ${pizza.name}`);
    }

    // Create sample order
    const sampleOrder = {
      orderId: 1001,
      customerInfo: {
        firstName: "John",
        lastName: "Doe", 
        phone: "555-0123",
        email: "john.doe@example.com"
      },
      items: [{
        id: "1",
        name: "Margherita",
        size: "Large",
        quantity: 1,
        toppings: [],
        price: 12.99
      }],
      total: 15.49,
      status: "confirmed",
      orderType: "pickup",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await addDoc(collection(db, 'orders'), sampleOrder);
    console.log('Added sample order');

    console.log('Firebase database setup complete!');
    return firebaseConfig;
    
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
}

// Export the setup function
module.exports = { setupDatabase, firebaseConfig };

// Run setup if called directly
if (require.main === module) {
  setupDatabase().then(() => {
    console.log('Setup completed successfully');
    process.exit(0);
  }).catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}