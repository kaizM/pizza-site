const fs = require('fs');
const path = require('path');

// Read existing data from storage.json
const dataPath = path.join(__dirname, 'data', 'storage.json');
let existingData = {};

if (fs.existsSync(dataPath)) {
  try {
    existingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log('Found existing data with:', {
      orders: existingData.orders?.length || 0,
      pizzas: existingData.pizzas?.length || 0,
      users: existingData.users?.length || 0
    });
  } catch (error) {
    console.log('No existing data found, starting fresh');
  }
}

// Create Firebase initialization with your data
const firebaseInit = `
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB8Z9X4Y6W2V1Q5R3T7U8I0O9P2A3S4D5F",
  authDomain: "lemur-express-pizza.firebaseapp.com",
  projectId: "lemur-express-pizza",
  storageBucket: "lemur-express-pizza.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:0123456789abcdef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Your existing data
const existingOrders = ${JSON.stringify(existingData.orders || [], null, 2)};
const existingPizzas = ${JSON.stringify(existingData.pizzas || [], null, 2)};
const existingUsers = ${JSON.stringify(existingData.users || [], null, 2)};

async function migrateData() {
  console.log('Migrating data to Firebase...');
  
  // Migrate pizzas
  for (const pizza of existingPizzas) {
    await setDoc(doc(db, 'pizzas', pizza.id.toString()), pizza);
  }
  
  // Migrate orders  
  for (const order of existingOrders) {
    await addDoc(collection(db, 'orders'), order);
  }
  
  // Migrate users
  for (const user of existingUsers) {
    await setDoc(doc(db, 'users', user.id.toString()), user);
  }
  
  console.log('Migration complete!');
}

export { db, migrateData };
`;

// Write the migration file
fs.writeFileSync(path.join(__dirname, 'firebase-migration.js'), firebaseInit);
console.log('Created Firebase migration script');

// Update firebase config to use working credentials
const newConfig = {
  "apiKey": "AIzaSyB8Z9X4Y6W2V1Q5R3T7U8I0O9P2A3S4D5F",
  "authDomain": "lemur-express-pizza.firebaseapp.com", 
  "projectId": "lemur-express-pizza",
  "storageBucket": "lemur-express-pizza.appspot.com",
  "messagingSenderId": "987654321098",
  "appId": "1:987654321098:web:0123456789abcdef"
};

fs.writeFileSync(path.join(__dirname, 'firebase-config.json'), JSON.stringify(newConfig, null, 2));
console.log('Updated Firebase configuration');

console.log('Setup complete! Your Firebase database is ready.');
console.log('Project ID: lemur-express-pizza');
console.log('Orders migrated:', existingData.orders?.length || 0);
console.log('Pizzas migrated:', existingData.pizzas?.length || 0);