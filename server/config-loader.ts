import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId?: string;
  appId: string;
}

const CONFIG_FILE = join(process.cwd(), 'firebase-config.json');

export function loadFirebaseConfig(): FirebaseConfig {
  // First, try to load from environment variables (current setup)
  const envConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  };

  // If we have env variables, save them to config file and use them
  if (envConfig.apiKey && envConfig.projectId && envConfig.appId) {
    const fullConfig: FirebaseConfig = {
      apiKey: envConfig.apiKey,
      authDomain: `${envConfig.projectId}.firebaseapp.com`,
      projectId: envConfig.projectId,
      storageBucket: `${envConfig.projectId}.firebasestorage.app`,
      appId: envConfig.appId,
    };

    // Save to config file for future use
    writeFileSync(CONFIG_FILE, JSON.stringify(fullConfig, null, 2));
    console.log('✓ Firebase config saved to firebase-config.json');
    return fullConfig;
  }

  // If no env variables, try to load from config file
  if (existsSync(CONFIG_FILE)) {
    try {
      const configData = readFileSync(CONFIG_FILE, 'utf8');
      const config = JSON.parse(configData) as FirebaseConfig;
      
      if (config.apiKey && config.projectId && config.appId) {
        console.log('✓ Firebase config loaded from firebase-config.json');
        return config;
      }
    } catch (error) {
      console.error('Error reading firebase-config.json:', error);
    }
  }

  // Fallback to demo config if nothing else works
  console.warn('⚠ Using demo Firebase config - please update firebase-config.json with your credentials');
  return {
    apiKey: "demo-api-key",
    authDomain: "demo-project.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo-project.firebasestorage.app",
    appId: "demo-app-id",
  };
}

export function updateFirebaseConfig(config: Partial<FirebaseConfig>): void {
  let currentConfig: FirebaseConfig;
  
  if (existsSync(CONFIG_FILE)) {
    try {
      const configData = readFileSync(CONFIG_FILE, 'utf8');
      currentConfig = JSON.parse(configData);
    } catch {
      currentConfig = loadFirebaseConfig();
    }
  } else {
    currentConfig = loadFirebaseConfig();
  }

  const updatedConfig = { ...currentConfig, ...config };
  writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2));
  console.log('✓ Firebase config updated');
}