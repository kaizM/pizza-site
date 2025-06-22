import { users, orders, pizzaItems, type User, type InsertUser, type Order, type InsertOrder, type PizzaItem, type InsertPizzaItem } from "@shared/schema";
import { db } from "./db";
import { eq, desc, gte, sql } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultPizzas();
  }

  private async initializeDefaultPizzas() {
    try {
      const existingPizzas = await db.select().from(pizzaItems).limit(1);
      if (existingPizzas.length === 0) {
        await db.insert(pizzaItems).values([
          {
            name: "Cheese",
            description: "Classic cheese pizza with mozzarella",
            basePrice: "9.99",
            imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
            category: "classic"
          },
          {
            name: "Pepperoni",
            description: "Traditional pepperoni with mozzarella cheese",
            basePrice: "11.99",
            imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
            category: "classic"
          },
          {
            name: "Lotsa Meat",
            description: "Loaded with pepperoni, sausage, bacon, and ham",
            basePrice: "15.99",
            imageUrl: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
            category: "signature"
          },
          {
            name: "Veggie Deluxe",
            description: "Fresh vegetables with bell peppers, mushrooms, onions, and olives",
            basePrice: "13.99",
            imageUrl: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
            category: "veggie"
          },
          {
            name: "BBQ Chicken",
            description: "Grilled chicken with BBQ sauce, red onions, and cilantro",
            basePrice: "14.99",
            imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
            category: "specialty"
          }
        ]);
        console.log("Default pizzas initialized in database");
      }
    } catch (error) {
      console.log("Error initializing default pizzas:", error);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Order operations
  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values({
      ...insertOrder,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return order;
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined> {
    const [order] = await db.update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.status, status)).orderBy(desc(orders.createdAt));
  }

  // Pizza operations
  async getAllPizzas(): Promise<PizzaItem[]> {
    return await db.select().from(pizzaItems).where(eq(pizzaItems.isActive, true));
  }

  async getPizza(id: number): Promise<PizzaItem | undefined> {
    const [pizza] = await db.select().from(pizzaItems).where(eq(pizzaItems.id, id));
    return pizza;
  }

  async createPizza(insertPizza: InsertPizzaItem): Promise<PizzaItem> {
    const [pizza] = await db.insert(pizzaItems).values(insertPizza).returning();
    return pizza;
  }

  async updatePizza(id: number, updates: Partial<PizzaItem>): Promise<PizzaItem | undefined> {
    const [pizza] = await db.update(pizzaItems)
      .set(updates)
      .where(eq(pizzaItems.id, id))
      .returning();
    return pizza;
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

    // Get today's orders
    const todayOrders = await db.select().from(orders)
      .where(gte(orders.createdAt, today));

    // Get active orders (not completed)
    const activeOrders = await db.select().from(orders)
      .where(sql`${orders.status} != 'completed'`)
      .orderBy(desc(orders.createdAt));

    // Get recent orders
    const recentOrders = await db.select().from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(10);

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