import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { users, orders, pizzaItems, orderCancellations, customerNotifications, customerProfiles, type User, type InsertUser, type Order, type InsertOrder, type PizzaItem, type InsertPizzaItem, type OrderCancellation, type InsertOrderCancellation, type CustomerNotification, type InsertCustomerNotification, type CustomerProfile, type InsertCustomerProfile } from "@shared/schema";
import { IStorage } from "./storage";

interface StorageData {
  users: User[];
  orders: Order[];
  pizzas: PizzaItem[];
  cancellations: OrderCancellation[];
  notifications: CustomerNotification[];
  customerProfiles: CustomerProfile[];
  counters: {
    userId: number;
    orderId: number;
    pizzaId: number;
    cancellationId: number;
    notificationId: number;
    customerProfileId: number;
  };
}

export class PersistentStorage implements IStorage {
  private dataPath: string;
  private data: StorageData;

  constructor() {
    this.dataPath = join(process.cwd(), 'data');
    if (!existsSync(this.dataPath)) {
      mkdirSync(this.dataPath, { recursive: true });
    }
    this.loadData();
    this.initializeDefaultPizzas();
  }

  private loadData() {
    const filePath = join(this.dataPath, 'storage.json');
    try {
      if (existsSync(filePath)) {
        const fileContent = readFileSync(filePath, 'utf-8');
        this.data = JSON.parse(fileContent);
        console.log(`Loaded ${this.data.orders.length} orders from persistent storage`);
      } else {
        this.data = {
          users: [],
          orders: [],
          pizzas: [],
          cancellations: [],
          notifications: [],
          customerProfiles: [],
          counters: { userId: 1, orderId: 1, pizzaId: 1, cancellationId: 1, notificationId: 1, customerProfileId: 1 }
        };
      }
    } catch (error) {
      console.error('Error loading data:', error);
      this.data = {
        users: [],
        orders: [],
        pizzas: [],
        cancellations: [],
        notifications: [],
        customerProfiles: [],
        counters: { userId: 1, orderId: 1, pizzaId: 1, cancellationId: 1, notificationId: 1, customerProfileId: 1 }
      };
    }
  }

  private saveData() {
    const filePath = join(this.dataPath, 'storage.json');
    try {
      writeFileSync(filePath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  private async initializeDefaultPizzas() {
    if (this.data.pizzas.length === 0) {
      const defaultPizzas = [
        {
          id: this.data.counters.pizzaId++,
          name: "Cheese",
          description: "Classic cheese pizza with mozzarella",
          basePrice: "9.99",
          imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          category: "classic",
          isActive: true
        },
        {
          id: this.data.counters.pizzaId++,
          name: "Pepperoni",
          description: "Traditional pepperoni with mozzarella cheese",
          basePrice: "11.99",
          imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          category: "classic",
          isActive: true
        },
        {
          id: this.data.counters.pizzaId++,
          name: "Lotsa Meat",
          description: "Loaded with pepperoni, sausage, bacon, and ham",
          basePrice: "15.99",
          imageUrl: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          category: "signature",
          isActive: true
        },
        {
          id: this.data.counters.pizzaId++,
          name: "Veggie Deluxe",
          description: "Fresh vegetables with bell peppers, mushrooms, onions, and olives",
          basePrice: "13.99",
          imageUrl: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          category: "veggie",
          isActive: true
        },
        {
          id: this.data.counters.pizzaId++,
          name: "BBQ Chicken",
          description: "Grilled chicken with BBQ sauce, red onions, and cilantro",
          basePrice: "14.99",
          imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          category: "specialty",
          isActive: true
        }
      ];
      
      this.data.pizzas = defaultPizzas;
      this.saveData();
      console.log("Default pizzas initialized in persistent storage");
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.data.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.data.users.find(user => user.email === username);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return this.data.users.find(user => user.firebaseUid === firebaseUid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.data.counters.userId++,
      ...insertUser,
      createdAt: new Date()
    };
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  // Order operations
  async getAllOrders(): Promise<Order[]> {
    return [...this.data.orders].sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.data.orders.find(order => order.id === id);
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return this.data.orders.filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const order: Order = {
      id: this.data.counters.orderId++,
      ...insertOrder,
      status: "confirmed",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.orders.push(order);
    this.saveData();
    
    const customerName = typeof order.customerInfo === 'object' 
      ? `${order.customerInfo.firstName} ${order.customerInfo.lastName}`
      : 'Customer';
    console.log(`Created order #${order.id} (${order.uniqueOrderId}) for ${customerName}`);
    return order;
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined> {
    const orderIndex = this.data.orders.findIndex(order => order.id === id);
    if (orderIndex === -1) return undefined;

    this.data.orders[orderIndex] = {
      ...this.data.orders[orderIndex],
      ...updates,
      updatedAt: new Date()
    };
    this.saveData();
    return this.data.orders[orderIndex];
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return this.data.orders.filter(order => order.status === status)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  // Pizza operations
  async getAllPizzas(): Promise<PizzaItem[]> {
    return this.data.pizzas.filter(pizza => pizza.isActive);
  }

  async getPizza(id: number): Promise<PizzaItem | undefined> {
    return this.data.pizzas.find(pizza => pizza.id === id);
  }

  async createPizza(insertPizza: InsertPizzaItem): Promise<PizzaItem> {
    const pizza: PizzaItem = {
      id: this.data.counters.pizzaId++,
      ...insertPizza,
      isActive: true
    };
    this.data.pizzas.push(pizza);
    this.saveData();
    return pizza;
  }

  async updatePizza(id: number, updates: Partial<PizzaItem>): Promise<PizzaItem | undefined> {
    const pizzaIndex = this.data.pizzas.findIndex(pizza => pizza.id === id);
    if (pizzaIndex === -1) return undefined;

    this.data.pizzas[pizzaIndex] = { ...this.data.pizzas[pizzaIndex], ...updates };
    this.saveData();
    return this.data.pizzas[pizzaIndex];
  }

  // Stats and analytics
  async getOrderStats(): Promise<{
    todayOrders: number;
    todayRevenue: number;
    activeOrders: number;
    avgPrepTime: number;
    recentOrders: Order[];
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = this.data.orders.filter(order => 
      new Date(order.createdAt!).getTime() >= today.getTime()
    );

    const activeOrders = this.data.orders.filter(order => 
      order.status !== "completed"
    );

    const recentOrders = this.data.orders
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 10);

    const todayRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const avgPrepTime = todayOrders.length > 0 
      ? todayOrders.reduce((sum, order) => sum + (order.estimatedTime || 15), 0) / todayOrders.length
      : 15;

    return {
      todayOrders: todayOrders.length,
      todayRevenue,
      activeOrders: activeOrders.length,
      avgPrepTime: Math.round(avgPrepTime),
      recentOrders
    };
  }

  // Cancellation tracking methods
  async recordCancellation(cancellation: InsertOrderCancellation): Promise<OrderCancellation> {
    const newCancellation: OrderCancellation = {
      id: this.data.counters.cancellationId++,
      ...cancellation,
      cancelledAt: new Date(),
    };
    
    this.data.cancellations.push(newCancellation);
    this.saveData();
    return newCancellation;
  }

  async getAllCancellations(): Promise<OrderCancellation[]> {
    return [...this.data.cancellations];
  }

  async getCancellationsByEmployee(employeeName: string): Promise<OrderCancellation[]> {
    return this.data.cancellations.filter(c => c.employeeName === employeeName);
  }

  // Customer notification methods
  async createNotification(notification: InsertCustomerNotification): Promise<CustomerNotification> {
    // Ensure notifications array and counter exist
    if (!this.data.notifications) {
      this.data.notifications = [];
    }
    if (!this.data.counters.notificationId) {
      this.data.counters.notificationId = 1;
    }

    const newNotification: CustomerNotification = {
      id: this.data.counters.notificationId++,
      ...notification,
      createdAt: new Date(),
      respondedAt: null,
    };
    
    this.data.notifications.push(newNotification);
    this.saveData();
    return newNotification;
  }

  async getNotificationsByOrder(orderId: number): Promise<CustomerNotification[]> {
    // Ensure notifications array exists
    if (!this.data.notifications) {
      this.data.notifications = [];
    }
    return this.data.notifications.filter(n => n.orderId === orderId);
  }

  async updateNotificationResponse(notificationId: number, response: string, status: string): Promise<CustomerNotification | undefined> {
    // Ensure notifications array exists
    if (!this.data.notifications) {
      this.data.notifications = [];
      return undefined;
    }

    const notification = this.data.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.customerResponse = response;
      notification.status = status;
      notification.responseStatus = status;
      notification.respondedAt = new Date();
      this.saveData();
      return notification;
    }
    return undefined;
  }

  // Customer Profile Management
  async getCustomerProfile(phone: string): Promise<CustomerProfile | undefined> {
    // Ensure customerProfiles array exists
    if (!this.data.customerProfiles) {
      this.data.customerProfiles = [];
    }
    return this.data.customerProfiles.find(profile => profile.phone === phone);
  }

  async createCustomerProfile(insertProfile: InsertCustomerProfile): Promise<CustomerProfile> {
    // Ensure customerProfiles array exists
    if (!this.data.customerProfiles) {
      this.data.customerProfiles = [];
    }

    const profile: CustomerProfile = {
      id: this.data.counters.customerProfileId++,
      ...insertProfile,
      totalOrders: insertProfile.totalOrders || 0,
      completedOrders: insertProfile.completedOrders || 0,
      cancelledOrders: insertProfile.cancelledOrders || 0,
      noShowOrders: insertProfile.noShowOrders || 0,
      trustScore: insertProfile.trustScore || 0,
      cashPaymentAllowed: insertProfile.cashPaymentAllowed || false,
      lastOrderDate: insertProfile.lastOrderDate || null,
      notes: insertProfile.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.data.customerProfiles.push(profile);
    this.saveData();
    return profile;
  }

  async updateCustomerProfile(phone: string, updates: Partial<CustomerProfile>): Promise<CustomerProfile | undefined> {
    // Ensure customerProfiles array exists
    if (!this.data.customerProfiles) {
      this.data.customerProfiles = [];
      return undefined;
    }

    const profileIndex = this.data.customerProfiles.findIndex(profile => profile.phone === phone);
    if (profileIndex === -1) return undefined;

    const updatedProfile: CustomerProfile = {
      ...this.data.customerProfiles[profileIndex],
      ...updates,
      updatedAt: new Date(),
    };

    this.data.customerProfiles[profileIndex] = updatedProfile;
    this.saveData();
    return updatedProfile;
  }

  async calculateTrustScore(phone: string): Promise<number> {
    const profile = await this.getCustomerProfile(phone);
    if (!profile) return 0;

    // Trust score calculation (0-100 scale)
    let score = 50; // Base score

    // Positive factors
    if (profile.completedOrders > 0) {
      const completionRate = profile.completedOrders / profile.totalOrders;
      score += completionRate * 30; // Up to 30 points for high completion rate
    }

    // Loyalty bonus for frequent customers
    if (profile.totalOrders >= 5) score += 10;
    if (profile.totalOrders >= 10) score += 10;

    // Recent activity bonus
    if (profile.lastOrderDate && profile.lastOrderDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
      score += 5; // Recent order within 30 days
    }

    // Negative factors
    if (profile.noShowOrders > 0) {
      const noShowRate = profile.noShowOrders / profile.totalOrders;
      score -= noShowRate * 40; // Heavy penalty for no-shows
    }

    if (profile.cancelledOrders > 0) {
      const cancelRate = profile.cancelledOrders / profile.totalOrders;
      score -= cancelRate * 20; // Moderate penalty for cancellations
    }

    // Ensure score stays within bounds
    score = Math.max(0, Math.min(100, score));

    // Update the profile with calculated score
    await this.updateCustomerProfile(phone, { trustScore: Math.round(score) });

    return Math.round(score);
  }

  async checkCashPaymentEligibility(phone: string): Promise<boolean> {
    const profile = await this.getCustomerProfile(phone);
    if (!profile) return false;

    // Cash payment eligibility criteria
    const trustScore = await this.calculateTrustScore(phone);
    
    // Requirements for cash payment:
    // 1. Trust score >= 70
    // 2. At least 3 completed orders
    // 3. No more than 1 no-show order
    // 4. No-show rate < 20%
    
    const hasMinimumOrders = profile.completedOrders >= 3;
    const hasAcceptableTrustScore = trustScore >= 70;
    const hasLowNoShowRate = profile.totalOrders > 0 ? (profile.noShowOrders / profile.totalOrders) < 0.2 : true;
    const hasMinimalNoShows = profile.noShowOrders <= 1;

    const eligible = hasMinimumOrders && hasAcceptableTrustScore && hasLowNoShowRate && hasMinimalNoShows;

    // Update the profile with eligibility status
    await this.updateCustomerProfile(phone, { cashPaymentAllowed: eligible });

    return eligible;
  }
}