import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lemurexpress11.pizza',
  appName: 'Lemur Express 11',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    url: 'http://localhost:5000', // Development server
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ff6b35",
      showSpinner: false
    },
    StatusBar: {
      style: 'light',
      backgroundColor: "#ff6b35"
    }
  }
};

export default config;