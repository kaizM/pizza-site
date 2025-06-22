import { Order } from '@shared/schema';

export class OfflineStorageService {
  private static instance: OfflineStorageService;
  private readonly STORAGE_KEYS = {
    ORDERS: 'offline_orders',
    SYNC_QUEUE: 'sync_queue',
    LAST_SYNC: 'last_sync',
    EMPLOYEE_DATA: 'employee_data'
  };

  static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  // Store orders locally for offline access
  async storeOrders(orders: Order[]) {
    try {
      const ordersWithTimestamp = {
        data: orders,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(ordersWithTimestamp));
      console.log(`✓ Stored ${orders.length} orders offline`);
    } catch (error) {
      console.error('Failed to store orders offline:', error);
    }
  }

  // Get orders from local storage
  getStoredOrders(): Order[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.ORDERS);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      
      // Check if data is not too old (24 hours)
      const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
      if (parsed.timestamp < dayAgo) {
        console.log('Stored orders are too old, clearing...');
        this.clearStoredOrders();
        return [];
      }
      
      return parsed.data || [];
    } catch (error) {
      console.error('Failed to get stored orders:', error);
      return [];
    }
  }

  // Clear stored orders
  clearStoredOrders() {
    localStorage.removeItem(this.STORAGE_KEYS.ORDERS);
  }

  // Queue actions for when connection is restored
  queueForSync(action: { type: string; data: any; timestamp: number }) {
    try {
      const queue = this.getSyncQueue();
      queue.push(action);
      localStorage.setItem(this.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
      console.log('✓ Action queued for sync:', action.type);
    } catch (error) {
      console.error('Failed to queue action:', error);
    }
  }

  // Get sync queue
  getSyncQueue(): Array<{ type: string; data: any; timestamp: number }> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.SYNC_QUEUE);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get sync queue:', error);
      return [];
    }
  }

  // Clear sync queue after successful sync
  clearSyncQueue() {
    localStorage.removeItem(this.STORAGE_KEYS.SYNC_QUEUE);
  }

  // Check if we're offline
  isOffline(): boolean {
    return !navigator.onLine;
  }

  // Set up offline/online event listeners
  setupOfflineHandlers(onOnline: () => void, onOffline: () => void) {
    window.addEventListener('online', () => {
      console.log('✓ Connection restored');
      onOnline();
    });

    window.addEventListener('offline', () => {
      console.log('⚠ Connection lost - switching to offline mode');
      onOffline();
    });
  }

  // Store employee preferences/settings
  storeEmployeeData(data: any) {
    try {
      localStorage.setItem(this.STORAGE_KEYS.EMPLOYEE_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to store employee data:', error);
    }
  }

  // Get employee preferences/settings
  getEmployeeData(): any {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.EMPLOYEE_DATA);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get employee data:', error);
      return {};
    }
  }

  // Update last sync timestamp
  updateLastSync() {
    localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, Date.now().toString());
  }

  // Get last sync timestamp
  getLastSync(): number {
    const lastSync = localStorage.getItem(this.STORAGE_KEYS.LAST_SYNC);
    return lastSync ? parseInt(lastSync) : 0;
  }

  // Get storage usage info
  getStorageInfo() {
    const used = new Blob(Object.values(localStorage)).size;
    const quota = 10 * 1024 * 1024; // 10MB typical limit
    
    return {
      used: Math.round(used / 1024), // KB
      quota: Math.round(quota / 1024), // KB
      percentage: Math.round((used / quota) * 100)
    };
  }
}

// Export singleton instance
export const offlineStorage = OfflineStorageService.getInstance();