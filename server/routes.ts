import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Rate limiting
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { message: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const orderLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 order attempts per minute
    message: { message: "Too many order attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api', generalLimiter);
  
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
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", orderLimiter, async (req, res) => {
    try {
      // Input validation
      if (!req.body.customerInfo || !req.body.items || !req.body.total) {
        return res.status(400).json({ message: "Missing required order fields" });
      }
      
      // Sanitize customer info - remove HTML/script tags and dangerous characters
      const sanitizeText = (text: string) => {
        return text
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/[<>'"&]/g, '') // Remove dangerous characters
          .trim();
      };

      const sanitizedOrder = {
        ...req.body,
        customerInfo: {
          firstName: sanitizeText(req.body.customerInfo.firstName?.toString() || '').slice(0, 50),
          lastName: sanitizeText(req.body.customerInfo.lastName?.toString() || '').slice(0, 50),
          phone: req.body.customerInfo.phone?.toString().replace(/[^\d\-\(\)\+\s]/g, '').slice(0, 20) || '',
          email: req.body.customerInfo.email?.toString().trim().slice(0, 100) || ''
        },
        specialInstructions: sanitizeText(req.body.specialInstructions?.toString() || '').slice(0, 500)
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

  // Charge customer payment after supplies confirmed
  app.post("/api/orders/:id/charge", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.paymentStatus === "charged") {
        return res.status(400).json({ message: "Payment already charged" });
      }
      
      // Simulate payment charging process
      const customerInfo = order.customerInfo as any;
      console.log(`=== CHARGING PAYMENT FOR ORDER #${orderId} ===`);
      console.log(`Customer: ${customerInfo.firstName} ${customerInfo.lastName}`);
      console.log(`Amount: $${order.total}`);
      console.log(`Payment ID: ${order.paymentId || 'N/A'}`);
      console.log(`Tip Amount: $${order.tip || 0}`);
      console.log("=== PAYMENT CHARGED SUCCESSFULLY ===");
      
      // Update order payment status to charged
      const updatedOrder = await storage.updateOrder(orderId, {
        paymentStatus: "charged",
        updatedAt: new Date()
      });
      
      if (!updatedOrder) {
        return res.status(500).json({ message: "Failed to update order" });
      }
      
      res.json({ 
        message: "Payment charged successfully", 
        order: updatedOrder 
      });
    } catch (error) {
      console.error("Error charging payment:", error);
      res.status(500).json({ message: "Failed to charge payment" });
    }
  });

  app.post("/api/orders/:id/feedback", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { rating, comment } = req.body;
      
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Valid rating (1-5) is required" });
      }
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      console.log(`=== FEEDBACK RECEIVED FOR ORDER #${orderId} ===`);
      console.log(`Rating: ${rating}/5 stars`);
      console.log(`Comment: ${comment || 'No comment provided'}`);
      console.log(`Customer: ${order.customerInfo.firstName} ${order.customerInfo.lastName}`);
      
      res.json({
        message: "Feedback submitted successfully",
        feedback: { orderId, rating, comment, submittedAt: new Date().toISOString() }
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  // Customer notification endpoints
  app.post("/api/notifications", async (req, res) => {
    try {
      const { orderId, type, message, customerEmail } = req.body;
      
      const notification = await storage.createNotification({
        orderId,
        type,
        message,
        customerEmail,
        status: 'sent'
      });
      
      // In a real application, you would send an actual email here
      console.log(`Email notification sent to ${customerEmail}:`);
      console.log(`Type: ${type}`);
      console.log(`Message: ${message}`);
      console.log(`Tracking URL: ${req.protocol}://${req.get('host')}/customer-response/${notification.id}`);
      
      res.json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.get("/api/notifications/order/:orderId", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const notifications = await storage.getNotificationsByOrder(orderId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/:id/respond", async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const { response, status } = req.body;
      
      const updatedNotification = await storage.updateNotificationResponse(
        notificationId,
        response,
        status
      );
      
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(updatedNotification);
    } catch (error) {
      console.error("Error updating notification response:", error);
      res.status(500).json({ message: "Failed to update notification response" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
