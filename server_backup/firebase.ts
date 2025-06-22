import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { loadFirebaseConfig } from "./config-loader.js";

const firebaseConfig = loadFirebaseConfig();

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;