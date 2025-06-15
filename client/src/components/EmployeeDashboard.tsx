import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Clock, 
  ChefHat, 
  CheckCircle, 
  Phone, 
  Eye,
  Timer,
  RefreshCw,
  Bell,
  AlertCircle,
  Pizza,
  Package,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatTime } from "@/lib/utils";

interface Order {
  id: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  items: Array<{
    id: string;
    name: string;
    size: string;
    quantity: number;
    toppings: string[];
    crust?: string;
    price: number;
  }>;
  total: number;
  status: "confirmed" | "preparing" | "ready" | "completed";
  orderType: "pickup" | "delivery";
  specialInstructions?: string;
  estimatedTime?: number;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function EmployeeDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  // Auto-refresh current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("GET", "/api/orders");
      const allOrders = await response.json();
      
      // Filter to only show active orders (not completed)
      const activeOrders = allOrders.filter((order: Order) => 
        order.status !== "completed"
      ).sort((a: Order, b: Order) => {
        // Sort by created date, newest first
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      // Check for new orders
      const previousOrderIds = orders.map(o => o.id);
      const newOrders = activeOrders.filter((order: Order) => 
        !previousOrderIds.includes(order.id)
      );
      
      if (newOrders.length > 0 && orders.length > 0) {
        setNewOrdersCount(prev => prev + newOrders.length);
        // Play notification sound (if supported)
        if ('AudioContext' in window || 'webkitAudioContext' in window) {
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.1;
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
          } catch (e) {
            // Audio not supported, silent fallback
          }
        }
        
        toast({
          title: "New Order Received!",
          description: `${newOrders.length} new order(s) ready for preparation`,
          variant: "default",
        });
      }
      
      setOrders(activeOrders);
      setLastRefresh(new Date());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}`, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      if (response.ok) {
        await fetchOrders(); // Refresh orders
        toast({
          title: "Order Updated",
          description: `Order #${orderId} marked as ${newStatus}`,
          variant: "success",
        });
        
        // Clear new orders count when acknowledging
        if (newStatus === "preparing") {
          setNewOrdersCount(0);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-blue-500 text-white";
      case "preparing": return "bg-yellow-500 text-black";
      case "ready": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <Bell className="h-4 w-4" />;
      case "preparing": return <ChefHat className="h-4 w-4" />;
      case "ready": return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTimeElapsed = (createdAt: string) => {
    const now = currentTime.getTime();
    const orderTime = new Date(createdAt).getTime();
    const elapsed = Math.floor((now - orderTime) / 1000 / 60); // minutes
    return elapsed;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-600 rounded-full">
              <Pizza className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Kitchen Dashboard</h1>
              <p className="text-gray-600">Hunt Brothers Pizza - Employee Portal</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-gray-800">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-600">
                Last refresh: {lastRefresh.toLocaleTimeString()}
              </div>
            </div>
            
            <Button 
              onClick={fetchOrders}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Status Summary */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.status === "confirmed").length}
            </div>
            <div className="text-sm text-blue-600">New Orders</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === "preparing").length}
            </div>
            <div className="text-sm text-yellow-600">Preparing</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === "ready").length}
            </div>
            <div className="text-sm text-green-600">Ready</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {orders.length}
            </div>
            <div className="text-sm text-purple-600">Total Active</div>
          </div>
        </div>
      </div>

      {/* New Orders Alert */}
      {newOrdersCount > 0 && (
        <div className="bg-red-600 text-white rounded-xl p-4 mb-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-6 w-6" />
              <span className="text-lg font-bold">
                {newOrdersCount} NEW ORDER{newOrdersCount > 1 ? 'S' : ''} RECEIVED!
              </span>
            </div>
            <Button 
              onClick={() => setNewOrdersCount(0)}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-red-600"
            >
              Acknowledge
            </Button>
          </div>
        </div>
      )}

      {/* Orders Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Orders</h3>
          <p className="text-gray-500">All orders are completed or no new orders yet.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
          {orders.map((order) => {
            const timeElapsed = getTimeElapsed(order.createdAt);
            const isUrgent = timeElapsed > 10; // Red alert after 10 minutes
            
            return (
              <Card 
                key={order.id} 
                className={`relative transition-all duration-300 hover:shadow-xl ${
                  isUrgent ? 'ring-4 ring-red-500 bg-red-50' : 'hover:scale-105'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">
                      Order #{order.id}
                    </CardTitle>
                    <Badge className={`${getStatusColor(order.status)} px-3 py-1`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      {order.customerInfo.firstName} {order.customerInfo.lastName}
                    </div>
                    <div className={`flex items-center ${isUrgent ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                      <Timer className="h-4 w-4 mr-1" />
                      {timeElapsed}m ago
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">
                              {item.quantity}x {item.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {item.size} • {item.crust || 'Hand Tossed'}
                            </div>
                            {item.toppings && item.toppings.length > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                + {item.toppings.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Special Instructions */}
                  {order.specialInstructions && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-yellow-800">Special Instructions:</div>
                          <div className="text-sm text-yellow-700">{order.specialInstructions}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Customer Info */}
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-1" />
                        {order.customerInfo.phone}
                      </div>
                      <div className="font-bold text-lg">
                        ${order.total.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Order #{order.id} Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Customer Information</h4>
                            <p>{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                            <p>{order.customerInfo.phone}</p>
                            {order.customerInfo.email && <p>{order.customerInfo.email}</p>}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Order Items</h4>
                            {order.items.map((item, index) => (
                              <div key={index} className="border rounded p-3 mb-2">
                                <div className="font-medium">{item.quantity}x {item.name}</div>
                                <div className="text-sm text-gray-600">{item.size} • {item.crust}</div>
                                {item.toppings.length > 0 && (
                                  <div className="text-sm text-gray-500">Toppings: {item.toppings.join(', ')}</div>
                                )}
                                <div className="text-sm font-medium">${item.price.toFixed(2)}</div>
                              </div>
                            ))}
                          </div>
                          <div>
                            <h4 className="font-semibold">Total: ${order.total.toFixed(2)}</h4>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {order.status === "confirmed" && (
                      <Button 
                        onClick={() => updateOrderStatus(order.id, "preparing")}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white flex-1"
                        size="sm"
                      >
                        <ChefHat className="h-4 w-4 mr-1" />
                        Start Cooking
                      </Button>
                    )}

                    {order.status === "preparing" && (
                      <Button 
                        onClick={() => updateOrderStatus(order.id, "ready")}
                        className="bg-green-600 hover:bg-green-700 text-white flex-1"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Ready
                      </Button>
                    )}

                    {order.status === "ready" && (
                      <Button 
                        onClick={() => updateOrderStatus(order.id, "completed")}
                        className="bg-gray-600 hover:bg-gray-700 text-white flex-1"
                        size="sm"
                      >
                        <Package className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}