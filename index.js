const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Sample pizza orders data
const orders = [
  { id: 1, customer: "John Doe", pizza: "Pepperoni", status: "preparing", total: "$15.99" },
  { id: 2, customer: "Jane Smith", pizza: "Margherita", status: "ready", total: "$12.99" },
  { id: 3, customer: "Bob Johnson", pizza: "Supreme", status: "confirmed", total: "$18.99" },
  { id: 4, customer: "Alice Brown", pizza: "Hawaiian", status: "completed", total: "$16.99" },
  { id: 5, customer: "Mike Wilson", pizza: "Meat Lovers", status: "preparing", total: "$19.99" }
];

// Routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>🍕 Lemur Express Pizza</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh; }
            .container { max-width: 800px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px); }
            h1 { text-align: center; font-size: 2.5em; margin-bottom: 30px; }
            .feature { background: rgba(255,255,255,0.15); padding: 20px; margin: 15px 0; border-radius: 10px; border-left: 4px solid #FFD700; }
            .btn { background: #e74c3c; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; text-decoration: none; display: inline-block; margin: 5px; transition: all 0.3s; }
            .btn:hover { background: #c0392b; transform: translateY(-2px); }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
            .stat { background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; text-align: center; }
            .stat-number { font-size: 2em; font-weight: bold; color: #FFD700; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🍕 Lemur Express Pizza</h1>
            <p style="text-align: center; font-size: 1.2em;">Welcome to our pizza ordering system - Now live on Vercel!</p>
            
            <div class="stats">
                <div class="stat">
                    <div class="stat-number">${orders.length}</div>
                    <div>Total Orders</div>
                </div>
                <div class="stat">
                    <div class="stat-number">${orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status)).length}</div>
                    <div>Active Orders</div>
                </div>
                <div class="stat">
                    <div class="stat-number">$${orders.reduce((sum, o) => sum + parseFloat(o.total.replace('$', '')), 0).toFixed(2)}</div>
                    <div>Revenue</div>
                </div>
            </div>
            
            <div class="feature">
                <h3>🍕 Order Pizza</h3>
                <p>Complete online ordering system with menu selection and payment processing</p>
                <a href="/order" class="btn">Start Order</a>
            </div>
            
            <div class="feature">
                <h3>👨‍🍳 Employee Dashboard</h3>
                <p>Manage orders, track kitchen operations, and monitor real-time statistics</p>
                <a href="/dashboard" class="btn">Access Dashboard</a>
            </div>
            
            <div class="feature">
                <h3>📊 API Endpoints</h3>
                <p>RESTful API for order management and system integration</p>
                <a href="/api/orders" class="btn">View Orders API</a>
                <a href="/api/health" class="btn">Health Check</a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; opacity: 0.8;">
                <p>🚀 Deployed on Vercel | Pizza Ordering System v1.0</p>
                <p>✅ All systems operational | ⚡ Real-time order processing</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    server: 'Lemur Express Pizza', 
    timestamp: new Date().toISOString(),
    orders: orders.length
  });
});

app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.get('/dashboard', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Employee Dashboard - Lemur Express Pizza</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh; }
            .header { text-align: center; margin-bottom: 25px; background: rgba(255,255,255,0.15); padding: 20px; border-radius: 15px; }
            .dashboard { background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; }
            .orders { display: grid; gap: 15px; }
            .order { background: rgba(255,255,255,0.15); padding: 15px; border-radius: 10px; border-left: 4px solid #FFD700; }
            .order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
            .status { padding: 4px 12px; border-radius: 15px; font-size: 0.8em; font-weight: 600; }
            .status-confirmed { background: #4CAF50; }
            .status-preparing { background: #FF9800; }
            .status-ready { background: #2196F3; }
            .status-completed { background: #9C27B0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🍕 Employee Dashboard</h1>
            <p>Real-time order management system</p>
        </div>
        <div class="dashboard">
            <h3>Current Orders</h3>
            <div class="orders">
                ${orders.map(order => `
                    <div class="order">
                        <div class="order-header">
                            <strong>Order #${order.id}</strong>
                            <span class="status status-${order.status}">${order.status.toUpperCase()}</span>
                        </div>
                        <p><strong>Customer:</strong> ${order.customer}</p>
                        <p><strong>Pizza:</strong> ${order.pizza}</p>
                        <p><strong>Total:</strong> ${order.total}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    </body>
    </html>
  `);
});

app.get('/order', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Order Pizza - Lemur Express</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh; }
            .container { max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; }
            h1 { text-align: center; margin-bottom: 30px; }
            .pizza { background: rgba(255,255,255,0.15); padding: 20px; margin: 15px 0; border-radius: 10px; }
            .btn { background: #e74c3c; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; width: 100%; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🍕 Order Your Pizza</h1>
            <div class="pizza">
                <h3>Pepperoni Pizza</h3>
                <p>Classic pepperoni with mozzarella cheese</p>
                <p><strong>$15.99</strong></p>
                <button class="btn" onclick="alert('Order placed! (Demo)')">Order Now</button>
            </div>
            <div class="pizza">
                <h3>Margherita Pizza</h3>
                <p>Fresh tomatoes, mozzarella, and basil</p>
                <p><strong>$12.99</strong></p>
                <button class="btn" onclick="alert('Order placed! (Demo)')">Order Now</button>
            </div>
            <div class="pizza">
                <h3>Supreme Pizza</h3>
                <p>Loaded with all your favorite toppings</p>
                <p><strong>$18.99</strong></p>
                <button class="btn" onclick="alert('Order placed! (Demo)')">Order Now</button>
            </div>
        </div>
    </body>
    </html>
  `);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Pizza ordering system running on port ${port}`);
});

module.exports = app;