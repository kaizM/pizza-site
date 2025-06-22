import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
// Trust proxy for Replit environment to fix rate limiting
app.set('trust proxy', true);
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
    <title>🍕 Lemur Express 11 Employee</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            min-height: 100vh; 
            padding: 15px; 
        }
        .header { 
            text-align: center; 
            margin-bottom: 25px; 
            background: rgba(255,255,255,0.15); 
            padding: 20px; 
            border-radius: 15px; 
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .logo { 
            font-size: 2.2em; 
            font-weight: bold; 
            margin-bottom: 10px; 
            background: linear-gradient(45deg, #FFD700, #FFA500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .status { 
            background: #4CAF50; 
            padding: 10px 20px; 
            border-radius: 25px; 
            display: inline-block; 
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3); }
            50% { box-shadow: 0 6px 20px rgba(76, 175, 80, 0.5); }
            100% { box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3); }
        }
        .dashboard { 
            background: rgba(255,255,255,0.1); 
            border-radius: 15px; 
            padding: 20px; 
            backdrop-filter: blur(10px); 
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .stats { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
            margin-bottom: 25px; 
        }
        @media (min-width: 768px) {
            .stats { 
                grid-template-columns: repeat(4, 1fr); 
            }
        }
        .stat { 
            text-align: center; 
            background: rgba(255,255,255,0.15); 
            padding: 20px; 
            border-radius: 12px; 
            box-shadow: inset 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.2s ease;
        }
        .stat:hover { transform: translateY(-2px); }
        .stat-number { 
            font-size: 2.2em; 
            font-weight: bold; 
            color: #FFD700; 
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .stat-label { 
            font-size: 0.9em; 
            margin-top: 5px; 
            opacity: 0.9; 
        }
        .chart-container {
            background: rgba(255,255,255,0.15);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            position: relative;
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        }
        .chart-title {
            font-size: 1.1em;
            font-weight: 600;
            margin-bottom: 10px;
            text-align: center;
        }
        .bar-chart {
            display: flex;
            align-items: end;
            height: 120px;
            gap: 8px;
            justify-content: space-around;
        }
        .bar {
            background: linear-gradient(to top, #FFD700, #FFA500);
            border-radius: 4px 4px 0 0;
            min-width: 35px;
            width: 35px;
            position: relative;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
            border: 2px solid rgba(255,255,255,0.2);
        }
        .bar:hover { transform: scaleY(1.05); }
        .bar-label {
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.8em;
            white-space: nowrap;
        }
        .bar-value {
            position: absolute;
            top: -25px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.8em;
            font-weight: 600;
            color: #FFD700;
        }
        .orders { 
            max-height: 350px; 
            overflow-y: auto; 
            padding-right: 5px;
        }
        .orders::-webkit-scrollbar {
            width: 6px;
        }
        .orders::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.1);
            border-radius: 3px;
        }
        .orders::-webkit-scrollbar-thumb {
            background: rgba(255,215,0,0.6);
            border-radius: 3px;
        }
        .order { 
            background: rgba(255,255,255,0.15); 
            padding: 15px; 
            margin-bottom: 12px; 
            border-radius: 10px; 
            border-left: 4px solid #FFD700; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: transform 0.2s ease;
        }
        .order:hover { transform: translateX(5px); }
        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .order-id {
            font-weight: 700;
            font-size: 1.1em;
        }
        .order-status {
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.8em;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-confirmed { background: #4CAF50; }
        .status-preparing { background: #FF9800; }
        .status-ready { background: #2196F3; }
        .status-completed { background: #9C27B0; }
        .refresh { 
            background: linear-gradient(45deg, #ff6b6b, #ee5a52); 
            color: white; 
            border: none; 
            padding: 15px 24px; 
            border-radius: 25px; 
            width: 100%; 
            margin-top: 20px; 
            cursor: pointer; 
            font-weight: 600;
            font-size: 1em;
            box-shadow: 0 6px 20px rgba(255, 107, 107, 0.3);
            transition: all 0.2s ease;
        }
        .refresh:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
        }
        .refresh:active { transform: translateY(0); }
        .loading {
            opacity: 0.7;
            pointer-events: none;
        }
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            opacity: 0.8;
        }
        .empty-state-icon {
            font-size: 3em;
            margin-bottom: 15px;
        }
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
            <div class="stat">
                <div class="stat-number" id="totalOrders">-</div>
                <div class="stat-label">Total Orders</div>
            </div>
            <div class="stat">
                <div class="stat-number" id="activeOrders">-</div>
                <div class="stat-label">Active Orders</div>
            </div>
            <div class="stat">
                <div class="stat-number" id="todayRevenue">-</div>
                <div class="stat-label">Today's Revenue</div>
            </div>
            <div class="stat">
                <div class="stat-number" id="avgOrderValue">-</div>
                <div class="stat-label">Avg Order</div>
            </div>
        </div>
        
        <div class="chart-container">
            <div class="chart-title">📊 Live Order Status Chart</div>
            <div style="text-align: center; margin-bottom: 15px; color: #FFD700; font-weight: 600;">
                Visual Dashboard - Real-time Data
            </div>
            <div class="bar-chart" id="statusChart">
                <div class="bar" style="height: 50%; background: linear-gradient(to top, #4CAF50, #66BB6A); box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);">
                    <div class="bar-value">0</div>
                    <div class="bar-label">Confirmed</div>
                </div>
                <div class="bar" style="height: 40%; background: linear-gradient(to top, #FF9800, #FFB74D); box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);">
                    <div class="bar-value">0</div>
                    <div class="bar-label">Preparing</div>
                </div>
                <div class="bar" style="height: 30%; background: linear-gradient(to top, #2196F3, #64B5F6); box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);">
                    <div class="bar-value">0</div>
                    <div class="bar-label">Ready</div>
                </div>
                <div class="bar" style="height: 70%; background: linear-gradient(to top, #9C27B0, #BA68C8); box-shadow: 0 4px 15px rgba(156, 39, 176, 0.4);">
                    <div class="bar-value">0</div>
                    <div class="bar-label">Completed</div>
                </div>
            </div>
            <div id="chartDebug" style="font-size: 0.8em; margin-top: 15px; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; text-align: center;">
                Chart Status: Loading...
            </div>
        </div>
        
        <h3 style="margin-bottom: 15px; color: #FFD700;">Recent Orders</h3>
        <div id="ordersList" class="orders">Loading orders...</div>
        <button class="refresh" onclick="loadData()">🔄 Refresh Dashboard</button>
    </div>
    <script>
        async function loadData() {
            try {
                document.getElementById('status').textContent = 'Loading...';
                document.getElementById('status').style.background = '#ff9800';
                document.body.classList.add('loading');
                
                const response = await fetch('/api/orders');
                const orders = await response.json();
                
                // Calculate statistics
                const totalOrders = orders.length;
                const activeOrders = orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status)).length;
                const todayRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
                const avgOrderValue = totalOrders > 0 ? (todayRevenue / totalOrders) : 0;
                
                // Update stats
                document.getElementById('totalOrders').textContent = totalOrders;
                document.getElementById('activeOrders').textContent = activeOrders;
                document.getElementById('todayRevenue').textContent = '$' + todayRevenue.toFixed(2);
                document.getElementById('avgOrderValue').textContent = '$' + avgOrderValue.toFixed(2);
                
                // Update status chart with enhanced visuals
                const statusCounts = {
                    confirmed: orders.filter(o => o.status === 'confirmed').length,
                    preparing: orders.filter(o => o.status === 'preparing').length,
                    ready: orders.filter(o => o.status === 'ready').length,
                    completed: orders.filter(o => o.status === 'completed').length
                };
                
                console.log('Status counts:', statusCounts);
                
                const maxCount = Math.max(...Object.values(statusCounts), 1);
                const chartBars = document.querySelectorAll('#statusChart .bar');
                const statuses = ['confirmed', 'preparing', 'ready', 'completed'];
                const colors = ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0'];
                
                chartBars.forEach((bar, index) => {
                    const status = statuses[index];
                    const count = statusCounts[status];
                    const height = Math.max((count / maxCount) * 80 + 15, 20);
                    
                    bar.style.height = height + '%';
                    bar.style.background = \`linear-gradient(to top, \${colors[index]}, \${colors[index]}dd)\`;
                    bar.querySelector('.bar-value').textContent = count;
                    bar.querySelector('.bar-value').style.color = colors[index];
                    
                    // Add visual feedback
                    bar.style.transform = 'scale(1)';
                    setTimeout(() => {
                        bar.style.transform = 'scale(1.02)';
                        setTimeout(() => bar.style.transform = 'scale(1)', 100);
                    }, index * 100);
                });
                
                // Update chart debug info
                document.getElementById('chartDebug').innerHTML = \`
                    Chart updated: \${new Date().toLocaleTimeString()} | 
                    Max: \${maxCount} | Data: \${JSON.stringify(statusCounts)}
                \`;
                
                // Update orders list
                const ordersList = document.getElementById('ordersList');
                if (orders.length === 0) {
                    ordersList.innerHTML = \`
                        <div class="empty-state">
                            <div class="empty-state-icon">🍕</div>
                            <div>No orders yet today</div>
                        </div>
                    \`;
                } else {
                    ordersList.innerHTML = orders.slice(0, 10).map(order => {
                        const customerInfo = order.customerInfo || {};
                        const statusClass = 'status-' + (order.status || 'unknown').toLowerCase();
                        
                        return \`<div class="order">
                            <div class="order-header">
                                <div class="order-id">Order #\${order.id}</div>
                                <div class="order-status \${statusClass}">\${order.status || 'Unknown'}</div>
                            </div>
                            <div><strong>\${customerInfo.firstName || 'N/A'} \${customerInfo.lastName || ''}</strong></div>
                            <div>📞 \${customerInfo.phone || 'N/A'}</div>
                            <div style="margin-top: 8px; font-size: 1.1em; font-weight: 600;">💰 $\${parseFloat(order.total || 0).toFixed(2)}</div>
                        </div>\`;
                    }).join('');
                }
                
                document.getElementById('status').textContent = 'Connected';
                document.getElementById('status').style.background = '#4CAF50';
                document.body.classList.remove('loading');
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('status').textContent = 'Connection Error';
                document.getElementById('status').style.background = '#f44336';
                document.getElementById('ordersList').innerHTML = \`
                    <div class="empty-state">
                        <div class="empty-state-icon">⚠️</div>
                        <div>Failed to load orders</div>
                        <div style="font-size: 0.9em; margin-top: 10px;">Check your connection</div>
                    </div>
                \`;
                document.body.classList.remove('loading');
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
