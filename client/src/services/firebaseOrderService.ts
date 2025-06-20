import { 
  collection, 
  doc, 
  onSnapshot, 
  updateDoc, 
  addDoc, 
  query, 
  orderBy, 
  where,
  getDocs,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface FirebaseOrder {
  id?: string;
  orderId: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  items: Array<{
    id: string;
    name: string;
    size: string;
    quantity: number;
    toppings: string[];
    crust?: string;
    price: number;
  }>;
  total: number;
  status: "confirmed" | "preparing" | "ready" | "completed";
  orderType: "pickup" | "delivery";
  specialInstructions?: string;
  estimatedTime?: number;
  paymentId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class FirebaseOrderService {
  private ordersCollection = collection(db, 'orders');

  // Listen to real-time order updates
  subscribeToOrders(callback: (orders: any[]) => void) {
    const q = query(
      this.ordersCollection, 
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        firebaseId: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
      }));
      callback(orders);
    });
  }

  // Listen to orders by status
  subscribeToOrdersByStatus(status: string, callback: (orders: any[]) => void) {
    const q = query(
      this.ordersCollection,
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        firebaseId: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
      }));
      callback(orders);
    });
  }

  // Update order status
  async updateOrderStatus(firebaseId: string, updates: { status?: string; estimatedTime?: number }) {
    try {
      const orderRef = doc(this.ordersCollection, firebaseId);
      await updateDoc(orderRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating order:', error);
      return false;
    }
  }

  // Add new order to Firebase
  async addOrder(order: Omit<FirebaseOrder, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(this.ordersCollection, {
        ...order,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding order:', error);
      return null;
    }
  }

  // Sync existing orders to Firebase (migration helper)
  async syncOrdersToFirebase(orders: any[]) {
    try {
      for (const order of orders) {
        // Check if order already exists
        const q = query(
          this.ordersCollection,
          where('orderId', '==', order.id)
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          // Add order if it doesn't exist
          await this.addOrder({
            orderId: order.id,
            customerInfo: order.customerInfo,
            items: order.items,
            total: order.total,
            status: order.status,
            orderType: order.orderType,
            specialInstructions: order.specialInstructions,
            estimatedTime: order.estimatedTime,
            paymentId: order.paymentId
          });
        }
      }
      return true;
    } catch (error) {
      console.error('Error syncing orders:', error);
      return false;
    }
  }

  // Get orders count by status for dashboard stats
  async getOrderStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [confirmedSnapshot, preparingSnapshot, readySnapshot, completedSnapshot] = await Promise.all([
        getDocs(query(this.ordersCollection, where('status', '==', 'confirmed'))),
        getDocs(query(this.ordersCollection, where('status', '==', 'preparing'))),
        getDocs(query(this.ordersCollection, where('status', '==', 'ready'))),
        getDocs(query(this.ordersCollection, where('status', '==', 'completed')))
      ]);

      return {
        confirmed: confirmedSnapshot.size,
        preparing: preparingSnapshot.size,
        ready: readySnapshot.size,
        completed: completedSnapshot.size
      };
    } catch (error) {
      console.error('Error getting order stats:', error);
      return { confirmed: 0, preparing: 0, ready: 0, completed: 0 };
    }
  }
}

export const firebaseOrderService = new FirebaseOrderService();