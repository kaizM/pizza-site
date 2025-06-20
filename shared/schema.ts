import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customerProfiles = pgTable("customer_profiles", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  totalOrders: integer("total_orders").default(0),
  completedOrders: integer("completed_orders").default(0),
  cancelledOrders: integer("cancelled_orders").default(0),
  noShowOrders: integer("no_show_orders").default(0),
  trustScore: integer("trust_score").default(0), // 0-100 scale
  cashPaymentAllowed: boolean("cash_payment_allowed").default(false),
  lastOrderDate: timestamp("last_order_date"),
  notes: text("notes"), // Staff notes about customer
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  firebaseOrderId: text("firebase_order_id").notNull().unique(),
  uniqueOrderId: text("unique_order_id").unique(), // Customer-facing unique ID
  userId: text("user_id"),
  customerInfo: jsonb("customer_info").notNull(),
  items: jsonb("items").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  tip: decimal("tip", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  orderType: text("order_type").notNull().default('pickup'), // pickup only
  status: text("status").notNull().default('confirmed'), // 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'
  specialInstructions: text("special_instructions"),
  estimatedTime: integer("estimated_time"), // in minutes
  paymentId: text("payment_id"),
  paymentStatus: text("payment_status").default("authorized"), // 'authorized', 'charged', 'failed', 'cash_pending'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pizzaItems = pgTable("pizza_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  category: text("category").default('signature'),
  isActive: boolean("is_active").default(true),
});

export const orderCancellations = pgTable("order_cancellations", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  employeeName: text("employee_name").notNull(),
  cancellationReason: text("cancellation_reason").notNull(),
  customReason: text("custom_reason"),
  orderTotal: decimal("order_total", { precision: 10, scale: 2 }).notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  cancelledAt: timestamp("cancelled_at").defaultNow(),
});

export const customerNotifications = pgTable("customer_notifications", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  type: text("type").notNull(), // 'substitution_request', 'order_cancelled', 'order_update'
  message: text("message").notNull(),
  customerEmail: text("customer_email").notNull(),
  requestDetails: jsonb("request_details"), // for substitution requests
  isRead: boolean("is_read").default(false),
  customerResponse: text("customer_response"), // customer's response to substitution
  responseStatus: text("response_status").default("pending"), // 'pending', 'approved', 'rejected'
  status: text("status").default("sent"), // 'sent', 'delivered', 'responded'
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPizzaItemSchema = createInsertSchema(pizzaItems).omit({
  id: true,
});

export const insertOrderCancellationSchema = createInsertSchema(orderCancellations).omit({
  id: true,
  cancelledAt: true,
});

export const insertCustomerNotificationSchema = createInsertSchema(customerNotifications).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
});

export const insertCustomerProfileSchema = createInsertSchema(customerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type PizzaItem = typeof pizzaItems.$inferSelect;
export type InsertPizzaItem = z.infer<typeof insertPizzaItemSchema>;

export type OrderCancellation = typeof orderCancellations.$inferSelect;
export type InsertOrderCancellation = z.infer<typeof insertOrderCancellationSchema>;

export type CustomerNotification = typeof customerNotifications.$inferSelect;
export type InsertCustomerNotification = z.infer<typeof insertCustomerNotificationSchema>;

export type CustomerProfile = typeof customerProfiles.$inferSelect;
export type InsertCustomerProfile = z.infer<typeof insertCustomerProfileSchema>;

// Extended types for UI
export interface CartItem {
  id: string;
  name: string;
  size: string;
  crust: string;
  toppings: string[];
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

export interface OrderData {
  customerInfo: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  orderType: 'pickup'; // pickup only
  specialInstructions?: string;
  paymentStatus?: 'authorized' | 'charged' | 'failed' | 'cash_pending';
}
