import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';
import { connectivityManager } from './connectivityManager';

export class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check if we're on a mobile device
      const info = await Device.getInfo();
      if (info.platform === 'web') {
        console.log('Web platform detected - using browser notifications');
        await this.initializeWebNotifications();
        return;
      }

      // Request notification permissions
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Initialize push notifications
      await PushNotifications.requestPermissions();
      await PushNotifications.register();

      // Set up notification listeners
      this.setupNotificationListeners();
      
      this.isInitialized = true;
      console.log('✓ Notification service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  private async initializeWebNotifications() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('✓ Web notifications enabled');
      }
    }
  }

  private setupNotificationListeners() {
    // Handle notification clicks
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('Notification clicked:', notification);
      // Navigate to employee dashboard
      window.location.href = '/employee';
    });

    // Handle push notification registration
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token:', token.value);
      // Send token to server for push notifications
      this.sendTokenToServer(token.value);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
      this.showOrderNotification(notification.title || 'New Order', notification.body || 'You have a new order!');
    });
  }

  async showOrderNotification(title: string, body: string, orderId?: number) {
    try {
      const info = await Device.getInfo();
      
      if (info.platform === 'web') {
        // Web notification
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification(title, {
            body,
            icon: '/icon-192.svg',
            badge: '/icon-192.svg',
            vibrate: [200, 100, 200, 100, 200],
            tag: `order-${orderId}`,
            requireInteraction: true,
            actions: [
              { action: 'view', title: 'View Order' },
              { action: 'dismiss', title: 'Dismiss' }
            ]
          });
          
          notification.onclick = () => {
            window.focus();
            window.location.href = '/employee';
            notification.close();
          };
        }
        return;
      }

      // Mobile notification
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: orderId || Date.now(),
            sound: 'beep.wav',
            attachments: undefined,
            actionTypeId: 'ORDER_ACTION',
            extra: { orderId },
            schedule: { at: new Date(Date.now() + 1000) }, // 1 second delay
          },
        ],
      });

      // Add vibration pattern
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }

    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  async sendTokenToServer(token: string) {
    try {
      await fetch('/api/register-push-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
    } catch (error) {
      console.error('Failed to register push token:', error);
    }
  }

  // Play sound even when app is in background
  playOrderSound() {
    try {
      // Create audio context for better browser support
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create beep sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // High pitch beep
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Repeat beep 3 times
      setTimeout(() => this.playOrderSound(), 600);
      setTimeout(() => this.playOrderSound(), 1200);
      
    } catch (error) {
      console.error('Failed to play sound:', error);
      // Fallback to system beep
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();