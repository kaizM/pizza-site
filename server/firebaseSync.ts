import { collection, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { storage } from './storage';

class FirebaseSync {
  private ordersCollection = collection(db, 'orders');

  // Sync order to Firebase when created/updated
  async syncOrderToFirebase(order: any) {
    try {
      const orderRef = doc(this.ordersCollection, `order_${order.id}`);
      await setDoc(orderRef, {
        ...order,
        updatedAt: serverTimestamp(),
        syncedAt: serverTimestamp()
      });
      console.log(`✓ Order ${order.id} synced to Firebase`);
      return true;
    } catch (error) {
      console.error(`✗ Failed to sync order ${order.id} to Firebase:`, error);
      return false;
    }
  }

  // Update order status in Firebase
  async updateOrderStatusInFirebase(orderId: number, updates: any) {
    try {
      const orderRef = doc(this.ordersCollection, `order_${orderId}`);
      await updateDoc(orderRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log(`✓ Order ${orderId} status updated in Firebase`);
      return true;
    } catch (error) {
      console.error(`✗ Failed to update order ${orderId} in Firebase:`, error);
      return false;
    }
  }

  // Sync all existing orders to Firebase
  async syncAllOrdersToFirebase() {
    try {
      const orders = await storage.getAllOrders();
      let syncedCount = 0;
      
      for (const order of orders) {
        const success = await this.syncOrderToFirebase(order);
        if (success) syncedCount++;
      }
      
      console.log(`✓ Synced ${syncedCount}/${orders.length} orders to Firebase`);
      return { total: orders.length, synced: syncedCount };
    } catch (error) {
      console.error('❌ Failed to sync orders to Firebase:', error);
      return { total: 0, synced: 0 };
    }
  }

  // Initialize Firebase sync - call this on server startup (disabled for migration)
  async initialize() {
    console.log('🔄 Initializing Firebase sync...');
    
    // Sync existing orders to Firebase
    await this.syncAllOrdersToFirebase();
    
    console.log('✅ Local storage initialized - migration complete');
  }
}

export const firebaseSync = new FirebaseSync();