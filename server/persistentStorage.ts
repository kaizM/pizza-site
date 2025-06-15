import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { users, orders, pizzaItems, orderCancellations, customerNotifications, type User, type InsertUser, type Order, type InsertOrder, type PizzaItem, type InsertPizzaItem, type OrderCancellation, type InsertOrderCancellation, type CustomerNotification, type InsertCustomerNotification } from "@shared/schema";
import { IStorage } from "./storage";

interface StorageData {
  users: User[];
  orders: Order[];
  pizzas: PizzaItem[];
  cancellations: OrderCancellation[];
  counters: {
    userId: number;
    orderId: number;
    pizzaId: number;
    cancellationId: number;
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
          counters: { userId: 1, orderId: 1, pizzaId: 1 }
        };
      }
    } catch (error) {
      console.error('Error loading data:', error);
      this.data = {
        users: [],
        orders: [],
        pizzas: [],
        counters: { userId: 1, orderId: 1, pizzaId: 1 }
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
    console.log(`Created order #${order.id} for ${order.customerInfo.firstName} ${order.customerInfo.lastName}`);
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
}