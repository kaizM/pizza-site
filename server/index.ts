import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Security headers and CORS for Android WebView
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Add employee dashboard route BEFORE Vite middleware
app.get("/mobile-employee", (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache');
  const dashboardHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lemur Express 11 Employee</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 2em; font-weight: bold; margin-bottom: 10px; }
        .status { background: #4CAF50; padding: 8px 16px; border-radius: 20px; display: inline-block; }
        .dashboard { background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; backdrop-filter: blur(10px); }
        .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .stat { text-align: center; background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; }
        .stat-number { font-size: 1.8em; font-weight: bold; color: #FFD700; }
        .orders { max-height: 300px; overflow-y: auto; }
        .order { background: rgba(255,255,255,0.1); padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #FFD700; }
        .refresh { background: #ff6b6b; color: white; border: none; padding: 12px 24px; border-radius: 25px; width: 100%; margin-top: 15px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🍕 Lemur Express 11</div>
        <div class="status" id="status">Connected</div>
    </div>
    <div class="dashboard">
        <h2>Employee Dashboard</h2>
        <div class="stats">
            <div class="stat"><div class="stat-number" id="totalOrders">-</div><div>Total Orders</div></div>
            <div class="stat"><div class="stat-number" id="activeOrders">-</div><div>Active Orders</div></div>
        </div>
        <div id="ordersList" class="orders">Loading orders...</div>
        <button class="refresh" onclick="loadData()">Refresh Data</button>
    </div>
    <script>
        async function loadData() {
            try {
                document.getElementById('status').textContent = 'Loading...';
                document.getElementById('status').style.background = '#ff9800';
                
                const response = await fetch('/api/orders');
                const orders = await response.json();
                
                document.getElementById('totalOrders').textContent = orders.length;
                document.getElementById('activeOrders').textContent = orders.filter(o => o.status === 'confirmed').length;
                
                const ordersList = document.getElementById('ordersList');
                if (orders.length === 0) {
                    ordersList.innerHTML = 'No orders found';
                } else {
                    ordersList.innerHTML = orders.slice(0, 8).map(order => {
                        const customerInfo = order.customerInfo || {};
                        return \`<div class="order">
                            <strong>Order #\${order.id}</strong> - \${order.status}
                            <br>\${customerInfo.firstName || 'N/A'} \${customerInfo.lastName || ''}
                            <br>📞 \${customerInfo.phone || 'N/A'}
                            <br><strong>$\${order.total}</strong>
                        </div>\`;
                    }).join('');
                }
                
                document.getElementById('status').textContent = 'Connected';
                document.getElementById('status').style.background = '#4CAF50';
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('status').textContent = 'Error';
                document.getElementById('status').style.background = '#f44336';
                document.getElementById('ordersList').innerHTML = 'Failed to load orders';
            }
        }
        
        window.addEventListener('load', loadData);
        setInterval(loadData, 30000);
    </script>
</body>
</html>`;
  res.send(dashboardHTML);
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
