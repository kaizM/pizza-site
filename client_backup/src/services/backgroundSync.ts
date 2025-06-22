import { offlineStorage } from './offlineStorage';
import { connectivityManager } from './connectivityManager';
import { notificationService } from './notifications';

export class BackgroundSyncService {
  private static instance: BackgroundSyncService;
  private syncInterval: NodeJS.Timeout | null = null;
  private isEnabled: boolean = false;

  static getInstance(): BackgroundSyncService {
    if (!BackgroundSyncService.instance) {
      BackgroundSyncService.instance = new BackgroundSyncService();
    }
    return BackgroundSyncService.instance;
  }

  async initialize() {
    try {
      // Set up network connectivity monitoring
      await connectivityManager.initialize();
      
      // Listen for network changes
      connectivityManager.onNetworkChange((online) => {
        if (online) {
          this.syncWhenOnline();
        } else {
          this.handleOfflineMode();
        }
      });

      // Start background sync
      this.startBackgroundSync();
      
      console.log('Background sync service initialized');
    } catch (error) {
      console.error('Failed to initialize background sync:', error);
    }
  }

  startBackgroundSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Sync every 30 seconds when online
    this.syncInterval = setInterval(async () => {
      if (connectivityManager.getStatus()) {
        await this.performSync();
      }
    }, 30000);

    this.isEnabled = true;
    console.log('Background sync started');
  }

  stopBackgroundSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isEnabled = false;
    console.log('Background sync stopped');
  }

  private async performSync() {
    try {
      // Fetch latest orders
      const response = await fetch('/api/orders', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const orders = await response.json();
        await offlineStorage.storeOrders(orders);
        
        // Check for new orders since last sync
        const lastSync = offlineStorage.getLastSync();
        const newOrders = orders.filter((order: any) => 
          new Date(order.createdAt).getTime() > lastSync
        );

        // Notify about new orders
        if (newOrders.length > 0) {
          for (const order of newOrders) {
            await notificationService.showOrderNotification(
              'New Order Received!',
              `Order #${order.id} - ${order.customerName}`,
              order.id
            );
            notificationService.playOrderSound();
          }
        }

        offlineStorage.updateLastSync();
      }

      // Process queued actions
      await this.processSyncQueue();

    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  private async processSyncQueue() {
    const queue = offlineStorage.getSyncQueue();
    if (queue.length === 0) return;

    console.log(`Processing ${queue.length} queued actions`);

    for (const action of queue) {
      try {
        await this.processQueuedAction(action);
      } catch (error) {
        console.error('Failed to process queued action:', error);
        // Keep action in queue for retry
        return;
      }
    }

    // Clear queue after successful processing
    offlineStorage.clearSyncQueue();
    console.log('Sync queue processed successfully');
  }

  private async processQueuedAction(action: any) {
    switch (action.type) {
      case 'UPDATE_ORDER_STATUS':
        await fetch(`/api/orders/${action.data.orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: action.data.status })
        });
        break;

      case 'CANCEL_ORDER':
        await fetch(`/api/orders/${action.data.orderId}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        break;

      case 'SUBSTITUTION_REQUEST':
        await fetch(`/api/orders/${action.data.orderId}/substitution`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        break;

      case 'TIME_DELAY':
        await fetch(`/api/orders/${action.data.orderId}/time`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        break;

      default:
        console.warn('Unknown action type:', action.type);
    }
  }

  private async syncWhenOnline() {
    console.log('Connection restored - syncing data');
    await this.performSync();
  }

  private handleOfflineMode() {
    console.log('Offline mode activated');
    // Load cached data
    const cachedOrders = offlineStorage.getStoredOrders();
    console.log(`Loaded ${cachedOrders.length} orders from cache`);
  }

  // Queue an action for later sync
  queueAction(type: string, data: any) {
    offlineStorage.queueForSync({
      type,
      data,
      timestamp: Date.now()
    });
  }

  isRunning(): boolean {
    return this.isEnabled;
  }

  getLastSyncTime(): Date {
    const timestamp = offlineStorage.getLastSync();
    return new Date(timestamp);
  }
}

export const backgroundSync = BackgroundSyncService.getInstance();