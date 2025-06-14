import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for pizza ordering system
  
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Users endpoints
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Orders endpoints (for backup/sync with local storage)
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      // Input validation
      if (!req.body.customerInfo || !req.body.items || !req.body.total) {
        return res.status(400).json({ message: "Missing required order fields" });
      }
      
      // Sanitize customer info
      const sanitizedOrder = {
        ...req.body,
        customerInfo: {
          firstName: req.body.customerInfo.firstName?.toString().trim().slice(0, 50) || '',
          lastName: req.body.customerInfo.lastName?.toString().trim().slice(0, 50) || '',
          phone: req.body.customerInfo.phone?.toString().replace(/[^\d\-\(\)\+\s]/g, '').slice(0, 20) || '',
          email: req.body.customerInfo.email?.toString().trim().slice(0, 100) || ''
        },
        specialInstructions: req.body.specialInstructions?.toString().trim().slice(0, 500) || ''
      };
      
      const order = await storage.createOrder(sanitizedOrder);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.updateOrder(orderId, req.body);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Pizza items endpoints
  app.get("/api/pizzas", async (req, res) => {
    try {
      const pizzas = await storage.getAllPizzas();
      res.json(pizzas);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pizzas" });
    }
  });

  app.post("/api/pizzas", async (req, res) => {
    try {
      const pizza = await storage.createPizza(req.body);
      res.status(201).json(pizza);
    } catch (error) {
      res.status(500).json({ message: "Failed to create pizza" });
    }
  });

  // Stats endpoint for admin dashboard
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getOrderStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
