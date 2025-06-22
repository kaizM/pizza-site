import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { firebaseSync } from "./firebaseSync";
import { loadFirebaseConfig } from "./config-loader.js";

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
  
  // Employee dashboard route for Android app
  app.get("/employee", (req, res) => {
    const dashboardHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lemur Express 11 Employee Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh; }
        .header { background: rgba(0, 0, 0, 0.2); padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; backdrop-filter: blur(10px); }
        .logo { font-size: 1.5em; font-weight: bold; }
        .status { background: #4CAF50; padding: 5px 12px; border-radius: 20px; font-size: 0.8em; }
        .container { padding: 20px; max-width: 500px; margin: 0 auto; }
        .dashboard-card { background: rgba(255, 255, 255, 0.15); border-radius: 15px; padding: 20px; margin-bottom: 20px; backdrop-filter: blur(10px); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .stat-item { text-align: center; background: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 10px; }
        .stat-number { font-size: 2em; font-weight: bold; color: #FFD700; }
        .stat-label { font-size: 0.9em; opacity: 0.9; }
        .order-list { max-height: 400px; overflow-y: auto; }
        .order-item { background: rgba(255, 255, 255, 0.1); padding: 15px; margin-bottom: 10px; border-radius: 10px; border-left: 4px solid #FFD700; }
        .order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .order-id { font-weight: bold; }
        .order-status { padding: 4px 8px; border-radius: 12px; font-size: 0.8em; }
        .status-confirmed { background: #4CAF50; }
        .status-completed { background: #2196F3; }
        .status-cancelled { background: #f44336; }
        .customer-info { font-size: 0.9em; margin-bottom: 5px; }
        .order-total { font-weight: bold; color: #FFD700; }
        .refresh-btn { background: #ff6b6b; color: white; border: none; padding: 12px 24px; border-radius: 25px; font-size: 1em; cursor: pointer; width: 100%; margin-top: 15px; }
        .loading { text-align: center; padding: 40px; opacity: 0.7; }
        .error { background: rgba(244, 67, 54, 0.2); border: 1px solid #f44336; color: #ffebee; padding: 15px; border-radius: 10px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🍕 Lemur Express 11</div>
        <div class="status" id="connectionStatus">Connected</div>
    </div>
    <div class="container">
        <div class="dashboard-card">
            <h2>Employee Dashboard</h2>
            <div class="stats-grid">
                <div class="stat-item"><div class="stat-number" id="totalOrders">-</div><div class="stat-label">Total Orders</div></div>
                <div class="stat-item"><div class="stat-number" id="activeOrders">-</div><div class="stat-label">Active Orders</div></div>
                <div class="stat-item"><div class="stat-number" id="todayRevenue">-</div><div class="stat-label">Today Revenue</div></div>
                <div class="stat-item"><div class="stat-number" id="availablePizzas">-</div><div class="stat-label">Pizza Types</div></div>
            </div>
        </div>
        <div class="dashboard-card">
            <h3>Recent Orders</h3>
            <div id="ordersList" class="order-list"><div class="loading">Loading orders from Firebase...</div></div>
            <button class="refresh-btn" onclick="loadData()">Refresh Data</button>
        </div>
    </div>
    <script>
        async function loadData() {
            try {
                document.getElementById('connectionStatus').textContent = 'Loading...';
                document.getElementById('connectionStatus').style.background = '#ff9800';
                const ordersResponse = await fetch('/api/orders');
                const orders = await ordersResponse.json();
                const pizzasResponse = await fetch('/api/pizzas');
                const pizzas = await pizzasResponse.json();
                document.getElementById('totalOrders').textContent = orders.length;
                document.getElementById('activeOrders').textContent = orders.filter(o => o.status === 'confirmed').length;
                document.getElementById('availablePizzas').textContent = pizzas.length;
                const today = new Date().toDateString();
                const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
                const revenue = todayOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
                document.getElementById('todayRevenue').textContent = '$' + revenue.toFixed(2);
                displayOrders(orders.slice(0, 10));
                document.getElementById('connectionStatus').textContent = 'Connected';
                document.getElementById('connectionStatus').style.background = '#4CAF50';
            } catch (error) {
                console.error('Error loading data:', error);
                document.getElementById('connectionStatus').textContent = 'Error';
                document.getElementById('connectionStatus').style.background = '#f44336';
                document.getElementById('ordersList').innerHTML = '<div class="error">Failed to connect to Firebase database.</div>';
            }
        }
        function displayOrders(orders) {
            const ordersList = document.getElementById('ordersList');
            if (orders.length === 0) {
                ordersList.innerHTML = '<div class="loading">No orders found</div>';
                return;
            }
            ordersList.innerHTML = orders.map(order => 
                '<div class="order-item">' +
                '<div class="order-header">' +
                '<span class="order-id">Order #' + order.id + '</span>' +
                '<span class="order-status status-' + order.status + '">' + order.status + '</span>' +
                '</div>' +
                '<div class="customer-info">' + order.customerInfo.firstName + ' ' + order.customerInfo.lastName + '</div>' +
                '<div class="customer-info">📞 ' + order.customerInfo.phone + '</div>' +
                '<div class="order-total">Total: $' + order.total + '</div>' +
                '</div>'
            ).join('');
        }
        window.addEventListener('load', loadData);
        setInterval(loadData, 30000);
    </script>
</body>
</html>`;
    res.send(dashboardHTML);
  });
  
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Firebase config endpoint
  app.get("/api/firebase-config", (req, res) => {
    try {
      const config = loadFirebaseConfig();
      // Only send safe config data to client
      res.json({
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        appId: config.appId
      });
    } catch (error) {
      res.status(500).json({ message: "Firebase configuration not available" });
    }
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
      const idParam = req.params.id;
      let order;

      // Check if it's a unique order ID (starts with "LE") or numeric ID
      if (idParam.startsWith('LE')) {
        // Search by unique order ID
        const orders = await storage.getAllOrders();
        order = orders.find(o => o.uniqueOrderId === idParam);
      } else {
        // Search by numeric ID
        const orderId = parseInt(idParam);
        if (isNaN(orderId)) {
          return res.status(400).json({ message: "Invalid order ID" });
        }
        order = await storage.getOrder(orderId);
      }
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Parse customer info and items if they're JSON strings
      const response = {
        ...order,
        customerName: typeof order.customerInfo === 'string' 
          ? JSON.parse(order.customerInfo).firstName + ' ' + JSON.parse(order.customerInfo).lastName
          : order.customerInfo.firstName + ' ' + order.customerInfo.lastName,
        customerPhone: typeof order.customerInfo === 'string'
          ? JSON.parse(order.customerInfo).phone
          : order.customerInfo.phone,
        customerEmail: typeof order.customerInfo === 'string'
          ? JSON.parse(order.customerInfo).email
          : order.customerInfo.email,
      };
      
      res.json(response);
    } catch (error) {
      console.error('Order lookup error:', error);
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

      // Sync order to Firebase for real-time updates
      await firebaseSync.syncOrderToFirebase(order);

      // Create or update customer profile for trust tracking
      if (sanitizedOrder.customerInfo && sanitizedOrder.customerInfo.phone) {
        const { firstName, lastName, phone, email } = sanitizedOrder.customerInfo;
        
        let profile = await storage.getCustomerProfile(phone);
        if (profile) {
          // Update existing profile
          await storage.updateCustomerProfile(phone, {
            totalOrders: (profile.totalOrders || 0) + 1,
            lastOrderDate: new Date(),
            email: email || profile.email
          });
        } else {
          // Create new profile for first-time customer
          await storage.createCustomerProfile({
            phone,
            firstName,
            lastName,
            email: email || null,
            totalOrders: 1,
            completedOrders: 0,
            cancelledOrders: 0,
            noShowOrders: 0,
            trustScore: 50,
            cashPaymentAllowed: false,
            lastOrderDate: new Date(),
            notes: null
          });
        }
      }

      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const previousOrder = await storage.getOrder(orderId);
      const order = await storage.updateOrder(orderId, req.body);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Sync order updates to Firebase for real-time mobile app updates
      await firebaseSync.updateOrderStatusInFirebase(orderId, req.body);

      // Update customer trust score based on order status changes
      if (previousOrder && order.customerInfo && (order.customerInfo as any).phone) {
        const phone = (order.customerInfo as any).phone;
        const oldStatus = previousOrder.status;
        const newStatus = order.status;

        // Track order completion for trust score
        if (oldStatus !== 'completed' && newStatus === 'completed') {
          const profile = await storage.getCustomerProfile(phone);
          if (profile) {
            await storage.updateCustomerProfile(phone, {
              completedOrders: (profile.completedOrders || 0) + 1
            });
            await storage.calculateTrustScore(phone);
          }
        }

        // Track cancellations and no-shows
        if (oldStatus !== 'cancelled' && newStatus === 'cancelled') {
          const profile = await storage.getCustomerProfile(phone);
          if (profile) {
            // Check if this was a no-show (order not picked up in time) vs regular cancellation
            const orderAge = Date.now() - new Date(order.createdAt || '').getTime();
            const isNoShow = orderAge > 30 * 60 * 1000; // 30 minutes

            if (isNoShow) {
              await storage.updateCustomerProfile(phone, {
                noShowOrders: (profile.noShowOrders || 0) + 1
              });
            } else {
              await storage.updateCustomerProfile(phone, {
                cancelledOrders: (profile.cancelledOrders || 0) + 1
              });
            }
            await storage.calculateTrustScore(phone);
          }
        }
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

  // Cancel order with reason
  app.post("/api/orders/:id/cancel", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { reason, cancelledBy } = req.body;
      
      const order = await storage.updateOrder(orderId, {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledBy: cancelledBy || 'employee',
        cancelledAt: new Date().toISOString()
      });
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Record cancellation for analytics
      await storage.recordCancellation({
        orderId,
        reason,
        cancelledBy: cancelledBy || 'employee',
        cancelledAt: new Date()
      });

      await firebaseSync.updateOrderStatusInFirebase(orderId, { status: 'cancelled' });
      
      res.json({ message: "Order cancelled successfully", order });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel order" });
    }
  });

  // Request substitution for order items
  app.post("/api/orders/:id/substitution", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { substitutionReason, substitutionSuggestion, requestedBy } = req.body;
      
      const order = await storage.updateOrder(orderId, {
        substitutionReason,
        substitutionSuggestion,
        substitutionRequestedBy: requestedBy || 'employee',
        substitutionRequestedAt: new Date().toISOString()
      });
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json({ message: "Substitution request recorded", order });
    } catch (error) {
      res.status(500).json({ message: "Failed to record substitution" });
    }
  });

  // Update estimated time for order
  app.post("/api/orders/:id/time", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { estimatedTime } = req.body;
      
      const order = await storage.updateOrder(orderId, {
        estimatedTime: parseInt(estimatedTime),
        updatedAt: new Date().toISOString()
      });
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      await firebaseSync.updateOrderStatusInFirebase(orderId, { estimatedTime: parseInt(estimatedTime) });
      
      res.json({ message: "Estimated time updated", order });
    } catch (error) {
      res.status(500).json({ message: "Failed to update time" });
    }
  });

  // Get cancellation analytics
  app.get("/api/cancellations", async (req, res) => {
    try {
      const cancellations = await storage.getAllCancellations();
      res.json(cancellations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cancellations" });
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

  app.get("/api/notifications/:id", async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notifications = await storage.getNotificationsByOrder(0); // Get all notifications
      const notification = notifications.find(n => n.id === notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found or expired" });
      }
      
      res.json(notification);
    } catch (error) {
      console.error("Error fetching notification:", error);
      res.status(500).json({ message: "Failed to fetch notification" });
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

  // Customer trust system endpoints
  app.post("/api/check-cash-eligibility", async (req, res) => {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      const eligible = await storage.checkCashPaymentEligibility(phone);
      const trustScore = await storage.calculateTrustScore(phone);
      
      res.json({ 
        eligible, 
        trustScore,
        message: eligible 
          ? "Customer eligible for cash payment" 
          : "Customer must use credit card payment"
      });
    } catch (error) {
      console.error("Error checking cash eligibility:", error);
      res.status(500).json({ message: "Failed to check eligibility" });
    }
  });

  app.post("/api/customer-profile", async (req, res) => {
    try {
      const { phone, firstName, lastName, email } = req.body;
      
      if (!phone || !firstName || !lastName) {
        return res.status(400).json({ message: "Phone, first name, and last name are required" });
      }

      // Check if profile already exists
      const existingProfile = await storage.getCustomerProfile(phone);
      if (existingProfile) {
        return res.json(existingProfile);
      }

      // Create new customer profile
      const newProfile = await storage.createCustomerProfile({
        phone,
        firstName,
        lastName,
        email: email || null,
        totalOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        noShowOrders: 0,
        trustScore: 50, // Starting trust score
        cashPaymentAllowed: false,
        lastOrderDate: null,
        notes: null
      });
      
      res.json(newProfile);
    } catch (error) {
      console.error("Error creating customer profile:", error);
      res.status(500).json({ message: "Failed to create customer profile" });
    }
  });

  // Admin endpoint to view customer profiles
  app.get("/api/admin/customer-profiles", async (req, res) => {
    try {
      // This would need authentication in production
      const profiles = await storage.getCustomerProfile(""); // Get all profiles
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching customer profiles:", error);
      res.status(500).json({ message: "Failed to fetch customer profiles" });
    }
  });

  // Block/unblock customer endpoint
  app.post("/api/admin/customer/:phone/block", async (req, res) => {
    try {
      const { phone } = req.params;
      const { blocked, notes } = req.body;
      
      const updatedProfile = await storage.updateCustomerProfile(phone, {
        cashPaymentAllowed: !blocked,
        trustScore: blocked ? 0 : undefined,
        notes: notes || null
      });
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating customer status:", error);
      res.status(500).json({ message: "Failed to update customer status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
