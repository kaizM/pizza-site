
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
const existingOrders = [
  {
    "id": 8,
    "customerInfo": {
      "firstName": "kk",
      "lastName": "nhh",
      "phone": "8325429818",
      "email": ""
    },
    "items": [
      {
        "id": "pizza-1749966833729",
        "name": "Cheese",
        "size": "Standard",
        "crust": "Original",
        "toppings": [],
        "price": 11.99,
        "quantity": 1,
        "imageUrl": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      }
    ],
    "subtotal": 11.99,
    "tax": 0.99,
    "tip": 0,
    "total": 12.98,
    "orderType": "pickup",
    "specialInstructions": "",
    "paymentStatus": "charged",
    "userId": null,
    "status": "completed",
    "paymentId": "test_pay_1749967273046_3rnokkwpr",
    "estimatedTime": 10,
    "createdAt": "2025-06-15T06:01:13.125Z",
    "updatedAt": "2025-06-15T06:02:23.913Z"
  },
  {
    "id": 7,
    "customerInfo": {
      "firstName": "Hh",
      "lastName": "Gg",
      "phone": "258484848888454545",
      "email": "andnbdjjjs@gmail.com"
    },
    "items": [
      {
        "id": "pizza-1749966197845",
        "name": "Cheese",
        "size": "Standard",
        "crust": "Thin",
        "toppings": [
          "Pepperoni",
          "Italian Sausage",
          "Beef",
          "Bacon",
          "Bell Peppers",
          "Onions",
          "Mushrooms",
          "Black Olives",
          "Banana Peppers",
          "Jalapeños",
          "Extra Bacon",
          "Extra Beef",
          "Extra Italian Sausage",
          "Extra Pepperoni",
          "Extra Bell Peppers",
          "Extra Onions",
          "Extra Mushrooms",
          "Extra Black Olives",
          "Extra Banana Peppers",
          "Extra Jalapeños",
          "Double Cheese"
        ],
        "price": 26.18,
        "quantity": 36,
        "imageUrl": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      }
    ],
    "subtotal": 942.48,
    "tax": 77.75,
    "tip": 10000,
    "total": 11020.23,
    "orderType": "pickup",
    "specialInstructions": "SUBSTITUTION REQUEST: italian_sausage. Suggested: Only chicken. Only crust",
    "paymentStatus": "authorized",
    "userId": null,
    "status": "cancelled",
    "paymentId": "test_pay_1749966322582_64bdqls11",
    "estimatedTime": 20,
    "createdAt": "2025-06-15T05:45:22.894Z",
    "updatedAt": "2025-06-15T05:47:34.533Z",
    "cancellationReason": "special_request",
    "cancelledBy": "employee",
    "cancelledAt": "2025-06-15T05:47:34.468Z"
  },
  {
    "id": 6,
    "customerInfo": {
      "firstName": "kaiz",
      "lastName": "maredia",
      "phone": "8325429818",
      "email": "kaizmaredia98@gmail.com"
    },
    "items": [
      {
        "id": "pizza-1749965643106",
        "name": "Cheese",
        "size": "Standard",
        "crust": "Original",
        "toppings": [
          "Beef",
          "Italian Sausage",
          "Double Cheese"
        ],
        "price": 14.18,
        "quantity": 1,
        "imageUrl": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      }
    ],
    "subtotal": 14.18,
    "tax": 1.17,
    "tip": 2.3,
    "total": 17.65,
    "orderType": "pickup",
    "specialInstructions": "SUBSTITUTION REQUEST: italian_sausage. Suggested: Out.",
    "paymentStatus": "charged",
    "userId": null,
    "status": "completed",
    "paymentId": "test_pay_1749965694913_kx6f91xpf",
    "estimatedTime": 10,
    "createdAt": "2025-06-15T05:34:55.227Z",
    "updatedAt": "2025-06-15T05:41:15.088Z"
  },
  {
    "id": 5,
    "customerInfo": {
      "firstName": "Karim",
      "lastName": "Maredia",
      "phone": "8325421647",
      "email": "grab786@yahoo.com"
    },
    "items": [
      {
        "id": "pizza-1749964871718",
        "name": "Cheese",
        "size": "Standard",
        "crust": "Original",
        "toppings": [],
        "price": 11.99,
        "quantity": 1,
        "imageUrl": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      }
    ],
    "subtotal": 11.99,
    "tax": 0.99,
    "tip": 2,
    "total": 14.98,
    "orderType": "pickup",
    "specialInstructions": "",
    "paymentStatus": "charged",
    "userId": null,
    "status": "completed",
    "paymentId": "test_pay_1749965146477_n1embg17x",
    "estimatedTime": 10,
    "createdAt": "2025-06-15T05:25:46.802Z",
    "updatedAt": "2025-06-15T05:33:22.263Z"
  },
  {
    "id": 4,
    "customerInfo": {
      "firstName": "kaiz",
      "lastName": "maredia",
      "phone": "8325429817",
      "email": "kaizmaredia98@gmail.com"
    },
    "items": [
      {
        "id": "pizza-1749963435847",
        "name": "Cheese",
        "size": "Standard",
        "crust": "Thin",
        "toppings": [
          "Onions"
        ],
        "price": 11.99,
        "quantity": 1,
        "imageUrl": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      }
    ],
    "subtotal": 11.99,
    "tax": 0.99,
    "tip": 1.95,
    "total": 14.93,
    "orderType": "pickup",
    "specialInstructions": "",
    "paymentStatus": "charged",
    "userId": null,
    "status": "completed",
    "paymentId": "test_pay_1749964063528_jp3o7ve90",
    "estimatedTime": 10,
    "createdAt": "2025-06-15T05:07:43.932Z",
    "updatedAt": "2025-06-15T05:41:25.701Z",
    "substitutionReason": "bacon",
    "substitutionSuggestion": "out",
    "substitutionRequestedBy": "employee",
    "substitutionRequestedAt": "2025-06-15T05:08:59.076Z",
    "cancellationReason": "staffing_issue",
    "cancelledBy": "employee",
    "cancelledAt": "2025-06-15T05:09:33.741Z"
  },
  {
    "id": 3,
    "firebaseOrderId": "cart_test_order_003",
    "customerInfo": {
      "firstName": "Sarah",
      "lastName": "Johnson",
      "phone": "555-987-6543",
      "email": "sarah.johnson@email.com"
    },
    "items": [
      {
        "id": "custom-pizza-builder-001",
        "name": "Custom Supreme Pizza",
        "size": "Large",
        "crust": "Hand Tossed",
        "toppings": [
          "Pepperoni",
          "Italian Sausage",
          "Mushrooms",
          "Green Peppers",
          "Onions"
        ],
        "price": 16.99,
        "quantity": 2
      }
    ],
    "subtotal": 33.98,
    "tax": 2.8,
    "tip": 6,
    "total": 42.78,
    "orderType": "pickup",
    "specialInstructions": "Extra crispy crust please",
    "paymentId": "pay_cart_test_123",
    "paymentStatus": "charged",
    "status": "cancelled",
    "createdAt": "2025-06-15T04:46:11.467Z",
    "updatedAt": "2025-06-15T05:33:49.820Z",
    "substitutionReason": "italian_sausage",
    "substitutionSuggestion": "dont have it",
    "substitutionRequestedBy": "employee",
    "substitutionRequestedAt": "2025-06-15T04:58:15.045Z",
    "estimatedTime": 10,
    "cancellationReason": "out_of_ingredients",
    "cancelledBy": "employee",
    "cancelledAt": "2025-06-15T05:33:49.755Z"
  },
  {
    "id": 2,
    "firebaseOrderId": "unified_test_order_001",
    "customerInfo": {
      "firstName": "Maria",
      "lastName": "Rodriguez",
      "phone": "555-123-9876",
      "email": "maria.rodriguez@email.com"
    },
    "items": [
      {
        "id": "pizza-combo-special",
        "name": "Family Combo Special",
        "size": "Large",
        "crust": "Original",
        "toppings": [
          "Pepperoni",
          "Mushrooms",
          "Green Peppers"
        ],
        "price": 19.99,
        "quantity": 1
      }
    ],
    "subtotal": 19.99,
    "tax": 1.65,
    "tip": 4,
    "total": 25.64,
    "orderType": "pickup",
    "specialInstructions": "Cut into 8 slices please",
    "paymentId": "pay_unified_789",
    "paymentStatus": "authorized",
    "status": "completed",
    "createdAt": "2025-06-15T04:40:58.765Z",
    "updatedAt": "2025-06-15T04:41:58.211Z"
  },
  {
    "id": 1,
    "firebaseOrderId": "persistent_order_2025",
    "customerInfo": {
      "firstName": "Alex",
      "lastName": "Chen",
      "phone": "555-444-7890",
      "email": "alex.chen@example.com"
    },
    "items": [
      {
        "id": "pizza-supreme-deluxe",
        "name": "Supreme Deluxe Pizza",
        "size": "Extra Large",
        "crust": "Stuffed Crust",
        "toppings": [
          "Pepperoni",
          "Italian Sausage",
          "Mushrooms",
          "Green Peppers",
          "Onions",
          "Black Olives",
          "Extra Cheese"
        ],
        "price": 22.99,
        "quantity": 1
      },
      {
        "id": "pizza-margherita",
        "name": "Margherita Pizza",
        "size": "Medium",
        "crust": "Thin",
        "toppings": [
          "Fresh Basil",
          "Roma Tomatoes",
          "Fresh Mozzarella"
        ],
        "price": 14.99,
        "quantity": 2
      }
    ],
    "subtotal": 52.97,
    "tax": 4.37,
    "tip": 9.5,
    "total": 66.84,
    "orderType": "pickup",
    "specialInstructions": "Please make sure the stuffed crust is golden brown. Extra marinara sauce on the side.",
    "paymentId": "pay_persistent_456789",
    "paymentStatus": "authorized",
    "status": "completed",
    "createdAt": "2025-06-15T04:37:49.503Z",
    "updatedAt": "2025-06-15T04:42:57.971Z"
  },
  {
    "id": 9,
    "customerInfo": {
      "firstName": "Test",
      "lastName": "Firebase",
      "phone": "555-123-4567",
      "email": "test@firebase.com"
    },
    "items": [
      {
        "id": "test-pizza-1",
        "name": "Cheese Pizza",
        "size": "Large",
        "crust": "Original",
        "toppings": [],
        "price": 12.99,
        "quantity": 1
      }
    ],
    "subtotal": 12.99,
    "tax": 1.04,
    "tip": 2,
    "total": 16.03,
    "orderType": "pickup",
    "specialInstructions": "Firebase test order",
    "status": "confirmed",
    "createdAt": "2025-06-20T01:09:06.129Z",
    "updatedAt": "2025-06-20T01:09:06.129Z"
  },
  {
    "id": 10,
    "customerInfo": {
      "firstName": "Firebase",
      "lastName": "Test",
      "phone": "555-999-8888",
      "email": "firebase@test.com"
    },
    "items": [
      {
        "id": "test-pizza-2",
        "name": "Pepperoni Pizza",
        "size": "Medium",
        "crust": "Thin",
        "toppings": [
          "Pepperoni"
        ],
        "price": 13.99,
        "quantity": 1
      }
    ],
    "subtotal": 13.99,
    "tax": 1.15,
    "tip": 2.5,
    "total": 17.64,
    "orderType": "pickup",
    "specialInstructions": "Firebase sync test",
    "status": "confirmed",
    "createdAt": "2025-06-20T01:09:31.357Z",
    "updatedAt": "2025-06-20T01:09:31.357Z"
  }
];
const existingPizzas = [
  {
    "id": 1,
    "name": "Cheese",
    "description": "Classic cheese pizza with mozzarella",
    "basePrice": "9.99",
    "imageUrl": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    "category": "classic",
    "isActive": true
  },
  {
    "id": 2,
    "name": "Pepperoni",
    "description": "Traditional pepperoni with mozzarella cheese",
    "basePrice": "11.99",
    "imageUrl": "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    "category": "classic",
    "isActive": true
  },
  {
    "id": 3,
    "name": "Lotsa Meat",
    "description": "Loaded with pepperoni, sausage, bacon, and ham",
    "basePrice": "15.99",
    "imageUrl": "https://images.unsplash.com/photo-1594007654729-407eedc4be65?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    "category": "signature",
    "isActive": true
  },
  {
    "id": 4,
    "name": "Veggie Deluxe",
    "description": "Fresh vegetables with bell peppers, mushrooms, onions, and olives",
    "basePrice": "13.99",
    "imageUrl": "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    "category": "veggie",
    "isActive": true
  },
  {
    "id": 5,
    "name": "BBQ Chicken",
    "description": "Grilled chicken with BBQ sauce, red onions, and cilantro",
    "basePrice": "14.99",
    "imageUrl": "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    "category": "specialty",
    "isActive": true
  }
];
const existingUsers = [];

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
