import { users, orders, pizzaItems, orderCancellations, customerNotifications, customerProfiles, type User, type InsertUser, type Order, type InsertOrder, type PizzaItem, type InsertPizzaItem, type OrderCancellation, type InsertOrderCancellation, type CustomerNotification, type InsertCustomerNotification, type CustomerProfile, type InsertCustomerProfile } from "@shared/schema";

// Enhanced storage interface for pizza ordering system
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Order operations
  getAllOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUserId(userId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined>;
  getOrdersByStatus(status: string): Promise<Order[]>;
  
  // Pizza operations
  getAllPizzas(): Promise<PizzaItem[]>;
  getPizza(id: number): Promise<PizzaItem | undefined>;
  createPizza(pizza: InsertPizzaItem): Promise<PizzaItem>;
  updatePizza(id: number, updates: Partial<PizzaItem>): Promise<PizzaItem | undefined>;
  
  // Stats and analytics
  getOrderStats(): Promise<{
    todayOrders: number;
    todayRevenue: number;
    activeOrders: number;
    avgPrepTime: number;
    recentOrders: Order[];
  }>;

  // Cancellation tracking
  recordCancellation(cancellation: InsertOrderCancellation): Promise<OrderCancellation>;
  getAllCancellations(): Promise<OrderCancellation[]>;
  getCancellationsByEmployee(employeeName: string): Promise<OrderCancellation[]>;

  // Customer notifications
  createNotification(notification: InsertCustomerNotification): Promise<CustomerNotification>;
  getNotificationsByOrder(orderId: number): Promise<CustomerNotification[]>;
  updateNotificationResponse(notificationId: number, response: string, status: string): Promise<CustomerNotification | undefined>;

  // Customer profiles and trust system
  getCustomerProfile(phone: string): Promise<CustomerProfile | undefined>;
  createCustomerProfile(profile: InsertCustomerProfile): Promise<CustomerProfile>;
  updateCustomerProfile(phone: string, updates: Partial<CustomerProfile>): Promise<CustomerProfile | undefined>;
  calculateTrustScore(phone: string): Promise<number>;
  checkCashPaymentEligibility(phone: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private orders: Map<number, Order>;
  private pizzas: Map<number, PizzaItem>;
  private cancellations: Map<number, OrderCancellation>;
  private currentUserId: number;
  private currentOrderId: number;
  private currentPizzaId: number;
  private currentCancellationId: number;

  constructor() {
    this.users = new Map();
    this.orders = new Map();
    this.pizzas = new Map();
    this.currentUserId = 1;
    this.currentOrderId = 1;
    this.currentPizzaId = 1;
    
    // Initialize with some default pizzas
    this.initializeDefaultPizzas();
  }

  private initializeDefaultPizzas() {
    const defaultPizzas: Omit<PizzaItem, 'id'>[] = [
      {
        name: "Lotsa Meat",
        description: "Loaded with pepperoni, sausage, bacon, and ham for the ultimate meat lovers experience",
        basePrice: "16.99",
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "signature",
        isActive: true,
      },
      {
        name: "Veggie Delight",
        description: "Fresh bell peppers, mushrooms, olives, onions, and tomatoes on our signature sauce",
        basePrice: "13.99",
        imageUrl: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "signature",
        isActive: true,
      },
      {
        name: "Loaded",
        description: "The works! Pepperoni, sausage, mushrooms, bell peppers, and onions",
        basePrice: "18.99",
        imageUrl: "https://images.unsplash.com/photo-1534308983667-ec4c5a701f88?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "signature",
        isActive: true,
      },
    ];

    defaultPizzas.forEach(pizza => {
      const id = this.currentPizzaId++;
      this.pizzas.set(id, { ...pizza, id });
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === username,
    );
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      phone: insertUser.phone || null,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Order operations
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = {
      id,
      firebaseOrderId: insertOrder.firebaseOrderId,
      userId: insertOrder.userId || null,
      customerInfo: insertOrder.customerInfo,
      items: insertOrder.items,
      subtotal: insertOrder.subtotal,
      tax: insertOrder.tax,
      tip: insertOrder.tip?.toString() || "0",
      total: insertOrder.total,
      orderType: insertOrder.orderType || 'pickup',
      status: insertOrder.status || 'confirmed',
      specialInstructions: insertOrder.specialInstructions || null,
      estimatedTime: insertOrder.estimatedTime || null,
      paymentId: insertOrder.paymentId || null,
      paymentStatus: insertOrder.paymentStatus || 'authorized',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder: Order = {
      ...order,
      ...updates,
      updatedAt: new Date(),
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.status === status
    );
  }

  // Pizza operations
  async getAllPizzas(): Promise<PizzaItem[]> {
    return Array.from(this.pizzas.values()).filter(pizza => pizza.isActive);
  }

  async getPizza(id: number): Promise<PizzaItem | undefined> {
    return this.pizzas.get(id);
  }

  async createPizza(insertPizza: InsertPizzaItem): Promise<PizzaItem> {
    const id = this.currentPizzaId++;
    const pizza: PizzaItem = { 
      ...insertPizza,
      description: insertPizza.description || null,
      imageUrl: insertPizza.imageUrl || null,
      category: insertPizza.category || null,
      isActive: insertPizza.isActive ?? null,
      id 
    };
    this.pizzas.set(id, pizza);
    return pizza;
  }

  async updatePizza(id: number, updates: Partial<PizzaItem>): Promise<PizzaItem | undefined> {
    const pizza = this.pizzas.get(id);
    if (!pizza) return undefined;

    const updatedPizza: PizzaItem = { ...pizza, ...updates };
    this.pizzas.set(id, updatedPizza);
    return updatedPizza;
  }

  // Stats and analytics
  async getOrderStats(): Promise<{
    todayOrders: number;
    todayRevenue: number;
    activeOrders: number;
    avgPrepTime: number;
    recentOrders: Order[];
  }> {
    const allOrders = Array.from(this.orders.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = allOrders.filter(order => {
      const orderDate = new Date(order.createdAt || 0);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    const todayRevenue = todayOrders.reduce((sum, order) => 
      sum + parseFloat(order.total.toString()), 0
    );

    const activeOrders = allOrders.filter(order => 
      ['confirmed', 'preparing', 'ready'].includes(order.status)
    ).length;

    const recentOrders = allOrders
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 10);

    return {
      todayOrders: todayOrders.length,
      todayRevenue,
      activeOrders,
      avgPrepTime: 23, // Default average prep time
      recentOrders,
    };
  }
}

import { PersistentStorage } from "./persistentStorage";

// Using your existing persistent storage with all data intact
export const storage = new PersistentStorage();
