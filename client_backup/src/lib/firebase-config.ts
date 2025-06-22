interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId?: string;
  appId: string;
}

export function getFirebaseConfig(): FirebaseConfig {
  // Try environment variables first
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  if (envConfig.apiKey && envConfig.projectId && envConfig.appId) {
    return {
      apiKey: envConfig.apiKey,
      authDomain: `${envConfig.projectId}.firebaseapp.com`,
      projectId: envConfig.projectId,
      storageBucket: `${envConfig.projectId}.firebasestorage.app`,
      appId: envConfig.appId,
    };
  }

  // Try to fetch from server config endpoint
  try {
    // This will be handled by a server endpoint we'll create
    return {
      apiKey: "loading",
      authDomain: "loading.firebaseapp.com",
      projectId: "loading",
      storageBucket: "loading.firebasestorage.app",
      appId: "loading",
    };
  } catch {
    throw new Error("Firebase configuration not available. Please ensure your credentials are set up correctly.");
  }
}