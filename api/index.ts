import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { storage } from '../server/storage';

const app = express();
app.use(express.json());
app.set('trust proxy', true);

// CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'Lemur Express Pizza' });
});

// Orders API
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await storage.getAllOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = await storage.createOrder(req.body);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Main page - serve simple HTML
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Lemur Express Pizza</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
            h1 { color: #e74c3c; text-align: center; }
            .feature { background: #ecf0f1; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .btn { background: #e74c3c; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🍕 Lemur Express Pizza</h1>
            <p>Welcome to our pizza ordering system!</p>
            
            <div class="feature">
                <h3>Order Pizza</h3>
                <p>Complete online ordering system with menu selection</p>
            </div>
            
            <div class="feature">
                <h3>Employee Dashboard</h3>
                <p>Manage orders and track kitchen operations</p>
                <a href="/mobile-employee" class="btn">Access Dashboard</a>
            </div>
            
            <div class="feature">
                <h3>API Status</h3>
                <p>System is operational - <a href="/api/health">Health Check</a></p>
                <p>View orders: <a href="/api/orders">All Orders</a></p>
            </div>
            
            <p style="text-align: center; color: #7f8c8d;">
                Deployed on Vercel | Pizza Ordering System v1.0
            </p>
        </div>
    </body>
    </html>
  `);
});

export default app;