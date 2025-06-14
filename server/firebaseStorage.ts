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
import { User, InsertUser, Order, InsertOrder, PizzaItem, InsertPizzaItem } from "@shared/schema";

export class FirebaseStorage implements IStorage {
  private usersCollection = collection(db, "users");
  private ordersCollection = collection(db, "orders");
  private pizzasCollection = collection(db, "pizzas");

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
        status: insertOrder.status || "confirmed",
        firebaseOrderId: insertOrder.firebaseOrderId,
        userId: insertOrder.userId || null,
        customerInfo: insertOrder.customerInfo,
        items: insertOrder.items,
        subtotal: insertOrder.subtotal,
        tax: insertOrder.tax,
        deliveryFee: insertOrder.deliveryFee || null,
        total: insertOrder.total,
        orderType: insertOrder.orderType,
        specialInstructions: insertOrder.specialInstructions || null,
        estimatedTime: insertOrder.estimatedTime || null,
        createdAt: orderData.createdAt.toDate(),
        updatedAt: orderData.updatedAt.toDate()
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
}