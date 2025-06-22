import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { firebaseSync } from "./firebaseSync";
import { loadFirebaseConfig } from "./config-loader.js";

// Push notification service
class NotificationService {
  private deviceTokens = new Set<string>();

  registerToken(token: string) {
    this.deviceTokens.add(token);
    console.log(`Device registered for notifications: ${token.substring(0, 20)}...`);
  }

  async sendToAllDevices(title: string, body: string, data?: any) {
    console.log(`📱 Sending notification to ${this.deviceTokens.size} devices: ${title}`);
    for (const token of this.deviceTokens) {
      console.log(`Would notify device: ${token.substring(0, 15)}...`);
    }
  }
}

const notificationService = new NotificationService();

export async function registerRoutes(app: Express): Promise<Server> {
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const orderLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { message: "Too many order attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api', generalLimiter);

  app.use((req, res, next) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5000',
      'https://lemur-express-pizza.vercel.app'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin as string)) {
      res.setHeader('Access-Control-Allow-Origin', origin as string);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  const server = createServer(app);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      server: "Lemur Express 11" 
    });
  });

  // Register device for push notifications
  app.post("/api/register-device", (req, res) => {
    try {
      const { token } = req.body;
      if (token) {
        notificationService.registerToken(token);
        res.json({ success: true });
      } else {
        res.status(400).json({ error: "Token required" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to register device" });
    }
  });

  // Android connectivity test endpoint
  app.get("/employee/status", (req, res) => {
    res.json({ 
      status: "connected", 
      timestamp: new Date().toISOString(),
      server: "Lemur Express 11 Employee Dashboard" 
    });
  });

  // Mobile employee dashboard route
  app.get("/mobile-employee", (req, res) => {
    const fs = require('fs');
    const path = require('path');
    try {
      const htmlPath = path.join(process.cwd(), 'employee-app-standalone.html');
      const html = fs.readFileSync(htmlPath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'no-cache');
      res.send(html);
    } catch (error) {
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'no-cache');
      res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; background: #667eea; color: white; padding: 20px; }
        .container { max-width: 400px; margin: 0 auto; }
        .card { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .button { background: rgba(255,255,255,0.2); border: none; padding: 12px; border-radius: 5px; color: white; width: 100%; margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h2>Employee Dashboard</h2>
            <p>Mobile dashboard loading...</p>
            <button class="button" onclick="location.reload()">Refresh</button>
        </div>
    </div>
</body>
</html>`);
    }
  });

  // Orders API
  app.get('/api/orders', async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  app.post('/api/orders', orderLimiter, async (req, res) => {
    try {
      const order = await storage.createOrder(req.body);
      await firebaseSync.syncOrderToFirebase(order);
      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  app.patch('/api/orders/:id', async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const updates = req.body;
      const updatedOrder = await storage.updateOrder(orderId, updates);
      
      if (updatedOrder) {
        await firebaseSync.updateOrderStatusInFirebase(orderId, updates);
        res.json(updatedOrder);
      } else {
        res.status(404).json({ error: 'Order not found' });
      }
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  });

  // Pizzas API
  app.get('/api/pizzas', async (req, res) => {
    try {
      const pizzas = await storage.getAllPizzas();
      res.json(pizzas);
    } catch (error) {
      console.error('Error fetching pizzas:', error);
      res.status(500).json({ error: 'Failed to fetch pizzas' });
    }
  });

  return server;
}