// Order tracking storage for unique IDs and persistence
const ORDER_STORAGE_KEY = 'pizza-order-ids';

export interface OrderTrackingInfo {
  orderId: string;
  orderNumber: number;
  customerName: string;
  timestamp: string;
  status: string;
}

export const orderStorage = {
  // Generate unique order ID
  generateOrderId: (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `LE${timestamp.toString().slice(-6)}${random.toUpperCase()}`;
  },

  // Save order tracking info
  saveOrderInfo: (orderInfo: OrderTrackingInfo): void => {
    try {
      const existing = orderStorage.getOrderHistory();
      const updated = [orderInfo, ...existing.slice(0, 9)]; // Keep last 10 orders
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save order info:', error);
    }
  },

  // Get order history
  getOrderHistory: (): OrderTrackingInfo[] => {
    try {
      const stored = localStorage.getItem(ORDER_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load order history:', error);
    }
    return [];
  },

  // Get specific order info
  getOrderInfo: (orderId: string): OrderTrackingInfo | null => {
    const history = orderStorage.getOrderHistory();
    return history.find(order => order.orderId === orderId) || null;
  },

  // Clear all order history
  clearHistory: (): void => {
    try {
      localStorage.removeItem(ORDER_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear order history:', error);
    }
  }
};