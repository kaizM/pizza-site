import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import { IStorage } from "./storage";
import { 
  User, InsertUser, 
  Order, InsertOrder, 
  PizzaItem, InsertPizzaItem,
  OrderCancellation, InsertOrderCancellation,
  CustomerNotification, InsertCustomerNotification,
  CustomerProfile, InsertCustomerProfile
} from "@shared/schema";

export class FirebaseStorage implements IStorage {
  private usersCollection = collection(db, "users");
  private ordersCollection = collection(db, "orders");
  private pizzasCollection = collection(db, "pizzas");
  private cancellationsCollection = collection(db, "cancellations");
  private notificationsCollection = collection(db, "notifications");
  private customerProfilesCollection = collection(db, "customerProfiles");

  constructor() {
    this.initializeDefaultPizzas();
  }

  private async initializeDefaultPizzas() {
    try {
      const pizzasSnapshot = await getDocs(this.pizzasCollection);
      if (pizzasSnapshot.empty) {
        const defaultPizzas = [
          {
            name: "Margherita",
            description: "Classic tomato sauce, fresh mozzarella, and basil",
            basePrice: "12.99",
            imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
            category: "classic",
            isActive: true,
          },
          {
            name: "Pepperoni",
            description: "Traditional pepperoni with mozzarella cheese",
            basePrice: "14.99",
            imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
            category: "classic",
            isActive: true,
          },
          {
            name: "Supreme",
            description: "Pepperoni, sausage, mushrooms, bell peppers, and onions",
            basePrice: "18.99",
            imageUrl: "https://images.unsplash.com/photo-1534308983667-ec4c5a701f88?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
            category: "specialty",
            isActive: true,
          },
        ];

        for (const pizza of defaultPizzas) {
          await addDoc(this.pizzasCollection, pizza);
        }
      }
    } catch (error) {
      console.warn("Could not initialize default pizzas:", error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const userDoc = await getDoc(doc(db, "users", id.toString()));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return { 
          id, 
          email: data.email,
          firebaseUid: data.firebaseUid,
          firstName: data.firstName || null,
          lastName: data.lastName || null,
          phone: data.phone || null,
          createdAt: data.createdAt?.toDate() || null
        } as User;
      }
    } catch (error) {
      console.error("Error getting user:", error);
    }
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const q = query(this.usersCollection, where("email", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return { 
          id: parseInt(doc.id), 
          email: data.email,
          firebaseUid: data.firebaseUid,
          firstName: data.firstName || null,
          lastName: data.lastName || null,
          phone: data.phone || null,
          createdAt: data.createdAt?.toDate() || null
        } as User;
      }
    } catch (error) {
      console.error("Error getting user by username:", error);
    }
    return undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    try {
      const q = query(this.usersCollection, where("firebaseUid", "==", firebaseUid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return { 
          id: parseInt(doc.id), 
          email: data.email,
          firebaseUid: data.firebaseUid,
          firstName: data.firstName || null,
          lastName: data.lastName || null,
          phone: data.phone || null,
          createdAt: data.createdAt?.toDate() || null
        } as User;
      }
    } catch (error) {
      console.error("Error getting user by Firebase UID:", error);
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const docRef = await addDoc(this.usersCollection, insertUser);
      const user: User = { 
        id: parseInt(docRef.id), 
        email: insertUser.email,
        firebaseUid: insertUser.firebaseUid,
        firstName: insertUser.firstName || null,
        lastName: insertUser.lastName || null,
        phone: insertUser.phone || null,
        createdAt: new Date()
      };
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      const q = query(this.ordersCollection, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data()
      })) as Order[];
    } catch (error) {
      console.error("Error getting all orders:", error);
      return [];
    }
  }

  async getOrder(id: number): Promise<Order | undefined> {
    try {
      const orderDoc = await getDoc(doc(db, "orders", id.toString()));
      if (orderDoc.exists()) {
        return { id, ...orderDoc.data() } as Order;
      }
    } catch (error) {
      console.error("Error getting order:", error);
    }
    return undefined;
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    try {
      const q = query(this.ordersCollection, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data()
      })) as Order[];
    } catch (error) {
      console.error("Error getting orders by user ID:", error);
      return [];
    }
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    try {
      const orderData = {
        ...insertOrder,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      const docRef = await addDoc(this.ordersCollection, orderData);
      const order: Order = {
        id: parseInt(docRef.id),
        createdAt: new Date(),
        status: insertOrder.status || "confirmed",
        firebaseOrderId: insertOrder.firebaseOrderId,
        uniqueOrderId: insertOrder.uniqueOrderId || null,
        userId: insertOrder.userId || null,
        customerInfo: insertOrder.customerInfo,
        items: insertOrder.items,
        subtotal: insertOrder.subtotal,
        tax: insertOrder.tax,
        tip: insertOrder.tip || "0",
        total: insertOrder.total,
        orderType: insertOrder.orderType || "pickup",
        specialInstructions: insertOrder.specialInstructions || null,
        estimatedTime: insertOrder.estimatedTime || null,
        paymentId: insertOrder.paymentId || null,
        paymentStatus: insertOrder.paymentStatus || "authorized",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return order;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined> {
    try {
      const orderRef = doc(db, "orders", id.toString());
      await updateDoc(orderRef, updates);
      const updatedOrder = await this.getOrder(id);
      return updatedOrder;
    } catch (error) {
      console.error("Error updating order:", error);
      return undefined;
    }
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    try {
      const q = query(this.ordersCollection, where("status", "==", status));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data()
      })) as Order[];
    } catch (error) {
      console.error("Error getting orders by status:", error);
      return [];
    }
  }

  async getAllPizzas(): Promise<PizzaItem[]> {
    try {
      const querySnapshot = await getDocs(this.pizzasCollection);
      return querySnapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data()
      })) as PizzaItem[];
    } catch (error) {
      console.error("Error getting all pizzas:", error);
      return [];
    }
  }

  async getPizza(id: number): Promise<PizzaItem | undefined> {
    try {
      const pizzaDoc = await getDoc(doc(db, "pizzas", id.toString()));
      if (pizzaDoc.exists()) {
        return { id, ...pizzaDoc.data() } as PizzaItem;
      }
    } catch (error) {
      console.error("Error getting pizza:", error);
    }
    return undefined;
  }

  async createPizza(insertPizza: InsertPizzaItem): Promise<PizzaItem> {
    try {
      const docRef = await addDoc(this.pizzasCollection, insertPizza);
      const pizza: PizzaItem = { 
        id: parseInt(docRef.id), 
        name: insertPizza.name,
        description: insertPizza.description || null,
        basePrice: insertPizza.basePrice,
        imageUrl: insertPizza.imageUrl || null,
        category: insertPizza.category || null,
        isActive: insertPizza.isActive ?? null
      };
      return pizza;
    } catch (error) {
      console.error("Error creating pizza:", error);
      throw error;
    }
  }

  async updatePizza(id: number, updates: Partial<PizzaItem>): Promise<PizzaItem | undefined> {
    try {
      const pizzaRef = doc(db, "pizzas", id.toString());
      await updateDoc(pizzaRef, updates);
      const updatedPizza = await this.getPizza(id);
      return updatedPizza;
    } catch (error) {
      console.error("Error updating pizza:", error);
      return undefined;
    }
  }

  async getOrderStats(): Promise<{
    todayOrders: number;
    todayRevenue: number;
    activeOrders: number;
    avgPrepTime: number;
    recentOrders: Order[];
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayTimestamp = Timestamp.fromDate(today);
      const todayQuery = query(
        this.ordersCollection, 
        where("createdAt", ">=", todayTimestamp)
      );
      const todaySnapshot = await getDocs(todayQuery);
      
      const activeQuery = query(
        this.ordersCollection,
        where("status", "in", ["confirmed", "preparing", "ready"])
      );
      const activeSnapshot = await getDocs(activeQuery);
      
      const recentQuery = query(
        this.ordersCollection,
        orderBy("createdAt", "desc")
      );
      const recentSnapshot = await getDocs(recentQuery);
      
      const todayOrders = todaySnapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data()
      })) as Order[];
      
      const todayRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
      const activeOrders = activeSnapshot.size;
      const recentOrders = recentSnapshot.docs.slice(0, 10).map(doc => ({
        id: parseInt(doc.id),
        ...doc.data()
      })) as Order[];
      
      return {
        todayOrders: todayOrders.length,
        todayRevenue,
        activeOrders,
        avgPrepTime: 25, // Default estimate
        recentOrders
      };
    } catch (error) {
      console.error("Error getting order stats:", error);
      return {
        todayOrders: 0,
        todayRevenue: 0,
        activeOrders: 0,
        avgPrepTime: 25,
        recentOrders: []
      };
    }
  }

  // Cancellation methods
  async recordCancellation(cancellation: InsertOrderCancellation): Promise<OrderCancellation> {
    try {
      const docRef = await addDoc(this.cancellationsCollection, {
        ...cancellation,
        createdAt: Timestamp.now()
      });
      
      const newCancellation: OrderCancellation = {
        id: parseInt(docRef.id),
        ...cancellation,
        createdAt: new Date()
      };
      
      return newCancellation;
    } catch (error) {
      console.error("Error recording cancellation:", error);
      throw error;
    }
  }

  async getAllCancellations(): Promise<OrderCancellation[]> {
    try {
      const snapshot = await getDocs(this.cancellationsCollection);
      return snapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as OrderCancellation[];
    } catch (error) {
      console.error("Error getting cancellations:", error);
      return [];
    }
  }

  async getCancellationsByEmployee(employeeName: string): Promise<OrderCancellation[]> {
    try {
      const q = query(this.cancellationsCollection, where("employeeName", "==", employeeName));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as OrderCancellation[];
    } catch (error) {
      console.error("Error getting employee cancellations:", error);
      return [];
    }
  }

  // Notification methods
  async createNotification(notification: InsertCustomerNotification): Promise<CustomerNotification> {
    try {
      const docRef = await addDoc(this.notificationsCollection, {
        ...notification,
        createdAt: Timestamp.now()
      });
      
      const newNotification: CustomerNotification = {
        id: parseInt(docRef.id),
        ...notification,
        createdAt: new Date()
      };
      
      return newNotification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  async getNotificationsByOrder(orderId: number): Promise<CustomerNotification[]> {
    try {
      const q = query(this.notificationsCollection, where("orderId", "==", orderId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as CustomerNotification[];
    } catch (error) {
      console.error("Error getting notifications:", error);
      return [];
    }
  }

  async updateNotificationResponse(notificationId: number, response: string, status: string): Promise<CustomerNotification | undefined> {
    try {
      const docRef = doc(this.notificationsCollection, notificationId.toString());
      await updateDoc(docRef, { response, status });
      
      const updatedDoc = await getDoc(docRef);
      if (updatedDoc.exists()) {
        return {
          id: notificationId,
          ...updatedDoc.data(),
          createdAt: updatedDoc.data().createdAt?.toDate() || new Date()
        } as CustomerNotification;
      }
      return undefined;
    } catch (error) {
      console.error("Error updating notification:", error);
      return undefined;
    }
  }

  // Customer profile methods
  async getCustomerProfile(phone: string): Promise<CustomerProfile | undefined> {
    try {
      const q = query(this.customerProfilesCollection, where("phone", "==", phone));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          id: parseInt(doc.id),
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          lastOrderDate: doc.data().lastOrderDate?.toDate() || null
        } as CustomerProfile;
      }
      return undefined;
    } catch (error) {
      console.error("Error getting customer profile:", error);
      return undefined;
    }
  }

  async createCustomerProfile(insertProfile: InsertCustomerProfile): Promise<CustomerProfile> {
    try {
      const docRef = await addDoc(this.customerProfilesCollection, {
        ...insertProfile,
        createdAt: Timestamp.now(),
        lastOrderDate: insertProfile.lastOrderDate ? Timestamp.fromDate(insertProfile.lastOrderDate) : null
      });
      
      const profile: CustomerProfile = {
        id: parseInt(docRef.id),
        ...insertProfile,
        createdAt: new Date()
      };
      
      return profile;
    } catch (error) {
      console.error("Error creating customer profile:", error);
      throw error;
    }
  }

  async updateCustomerProfile(phone: string, updates: Partial<CustomerProfile>): Promise<CustomerProfile | undefined> {
    try {
      const q = query(this.customerProfilesCollection, where("phone", "==", phone));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        const updateData = { ...updates };
        if (updateData.lastOrderDate) {
          updateData.lastOrderDate = Timestamp.fromDate(updateData.lastOrderDate as any);
        }
        
        await updateDoc(docRef, updateData);
        
        const updatedDoc = await getDoc(docRef);
        if (updatedDoc.exists()) {
          return {
            id: parseInt(updatedDoc.id),
            ...updatedDoc.data(),
            createdAt: updatedDoc.data().createdAt?.toDate() || new Date(),
            lastOrderDate: updatedDoc.data().lastOrderDate?.toDate() || null
          } as CustomerProfile;
        }
      }
      return undefined;
    } catch (error) {
      console.error("Error updating customer profile:", error);
      return undefined;
    }
  }

  async calculateTrustScore(phone: string): Promise<number> {
    try {
      const profile = await this.getCustomerProfile(phone);
      if (!profile) return 50; // Default neutral score
      
      // Simple trust score calculation
      let score = 50;
      score += Math.min(profile.totalOrders * 2, 30); // Max 30 points for order history
      score += Math.min(profile.totalSpent / 100, 20); // Max 20 points for spending
      
      return Math.min(score, 100);
    } catch (error) {
      console.error("Error calculating trust score:", error);
      return 50;
    }
  }

  async checkCashPaymentEligibility(phone: string): Promise<boolean> {
    try {
      const trustScore = await this.calculateTrustScore(phone);
      return trustScore >= 70; // Require high trust score for cash payments
    } catch (error) {
      console.error("Error checking cash payment eligibility:", error);
      return false;
    }
  }
}