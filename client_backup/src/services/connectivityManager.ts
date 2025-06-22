import { Network } from '@capacitor/network';

export class ConnectivityManager {
  private static instance: ConnectivityManager;
  private isOnline: boolean = true;
  private listeners: Array<(online: boolean) => void> = [];

  static getInstance(): ConnectivityManager {
    if (!ConnectivityManager.instance) {
      ConnectivityManager.instance = new ConnectivityManager();
    }
    return ConnectivityManager.instance;
  }

  async initialize() {
    try {
      // Get initial network status
      const status = await Network.getStatus();
      this.isOnline = status.connected;
      
      // Listen for network changes
      Network.addListener('networkStatusChange', (status) => {
        const wasOnline = this.isOnline;
        this.isOnline = status.connected;
        
        if (wasOnline !== this.isOnline) {
          console.log(`Network status changed: ${this.isOnline ? 'Online' : 'Offline'}`);
          this.notifyListeners(this.isOnline);
        }
      });

      console.log(`Network initialized - Status: ${this.isOnline ? 'Online' : 'Offline'}`);
    } catch (error) {
      console.error('Failed to initialize network monitoring:', error);
      // Fallback to browser API
      this.setupBrowserNetworkMonitoring();
    }
  }

  private setupBrowserNetworkMonitoring() {
    this.isOnline = navigator.onLine;
    
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
    });
  }

  private notifyListeners(online: boolean) {
    this.listeners.forEach(listener => {
      try {
        listener(online);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });
  }

  onNetworkChange(callback: (online: boolean) => void) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getStatus(): boolean {
    return this.isOnline;
  }

  async checkConnectivity(): Promise<boolean> {
    try {
      const status = await Network.getStatus();
      return status.connected;
    } catch {
      return navigator.onLine;
    }
  }

  async getNetworkInfo() {
    try {
      const status = await Network.getStatus();
      return {
        connected: status.connected,
        connectionType: status.connectionType,
        wifi: status.connectionType === 'wifi'
      };
    } catch {
      return {
        connected: navigator.onLine,
        connectionType: 'unknown',
        wifi: false
      };
    }
  }
}

export const connectivityManager = ConnectivityManager.getInstance();