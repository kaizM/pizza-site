import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Use the configuration from firebase-config.json
const firebaseConfig = {
  apiKey: "AIzaSyABpaitDVPmbY_2exQ54fwJotnlGKHBRrw",
  authDomain: "668057053914.firebaseapp.com",
  projectId: "668057053914",
  storageBucket: "668057053914.firebasestorage.app",
  appId: "pizza-8ef42",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;