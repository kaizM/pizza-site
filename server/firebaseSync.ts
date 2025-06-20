import { collection, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { storage } from './storage';

class FirebaseSync {
  private ordersCollection = collection(db, 'orders');

  // Sync order to Firebase when created/updated
  async syncOrderToFirebase(order: any) {
    try {
      const firebaseOrder = {
        orderId: order.id,
        customerInfo: order.customerInfo,
        items: order.items,
        total: order.total,
        status: order.status,
        orderType: order.orderType,
        specialInstructions: order.specialInstructions || "",
        estimatedTime: order.estimatedTime || 15,
        paymentId: order.paymentId || "",
        createdAt: order.createdAt ? new Date(order.createdAt) : serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Use orderId as document ID for consistency
      const orderRef = doc(this.ordersCollection, `order_${order.id}`);
      await setDoc(orderRef, firebaseOrder, { merge: true });
      
      console.log(`✓ Synced order ${order.id} to Firebase`);
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
      
      console.log(`✓ Updated order ${orderId} status in Firebase`);
      return true;
    } catch (error) {
      console.error(`✗ Failed to update order ${orderId} in Firebase:`, error);
      return false;
    }
  }

  // Sync all existing orders to Firebase (one-time migration)
  async syncAllOrdersToFirebase() {
    try {
      const orders = await storage.getAllOrders();
      console.log(`📦 Syncing ${orders.length} orders to Firebase...`);

      let synced = 0;
      for (const order of orders) {
        const success = await this.syncOrderToFirebase(order);
        if (success) synced++;
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`✅ Successfully synced ${synced}/${orders.length} orders to Firebase`);
      return { total: orders.length, synced };
    } catch (error) {
      console.error('❌ Failed to sync orders to Firebase:', error);
      return { total: 0, synced: 0 };
    }
  }

  // Initialize Firebase sync - call this on server startup
  async initialize() {
    console.log('🔄 Initializing Firebase sync...');
    
    // Sync existing orders on startup
    await this.syncAllOrdersToFirebase();
    
    console.log('✅ Firebase sync initialized');
  }
}

export const firebaseSync = new FirebaseSync();