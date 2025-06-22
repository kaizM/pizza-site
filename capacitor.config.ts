import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lemurexpress11.employee',
  appName: 'Lemur Express 11 Employee',
  webDir: 'dist',
  server: {
    url: 'https://15e8b74e-5e82-4bd4-8115-c38ee1ec49de-00-jywt9f6oi31b.kirk.replit.dev/employee',
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: "#f97316",
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#f97316",
      sound: "beep.wav",
    },

  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;