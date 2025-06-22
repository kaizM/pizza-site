import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Users,
  XCircle,
  MessageSquare,
  RotateCcw
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
  tip?: number;
  status: "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  orderType: "pickup" | "delivery";
  specialInstructions?: string;
  estimatedTime?: number;
  paymentId?: string;
  paymentStatus?: "authorized" | "charged" | "failed";
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
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [substitutionModalOpen, setSubstitutionModalOpen] = useState(false);
  const [selectedOrderForAction, setSelectedOrderForAction] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [substitutionReason, setSubstitutionReason] = useState("");
  const [substitutionSuggestion, setSubstitutionSuggestion] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled" | "history">("all");
  const [orderNotifications, setOrderNotifications] = useState<Record<number, any[]>>({});
  const { toast } = useToast();

  // Auto-refresh current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch notifications for a specific order
  const fetchOrderNotifications = async (orderId: number) => {
    try {
      const response = await apiRequest("GET", `/api/notifications/order/${orderId}`);
      const notifications = await response.json();
      return notifications;
    } catch (error) {
      console.error(`Error fetching notifications for order ${orderId}:`, error);
      return [];
    }
  };

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

      // Fetch notifications for orders with substitution requests
      const notificationsMap: Record<number, any[]> = {};
      for (const order of activeOrders) {
        if (order.specialInstructions?.includes("SUBSTITUTION REQUEST")) {
          const notifications = await fetchOrderNotifications(order.id);
          notificationsMap[order.id] = notifications;
        }
      }
      setOrderNotifications(notificationsMap);
      
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

  // Update order status with time estimation
  const updateOrderStatus = async (orderId: number, newStatus: string, estimatedTime?: number) => {
    try {
      const updateData: any = {
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      
      if (estimatedTime) {
        updateData.estimatedTime = estimatedTime;
      }
      
      const response = await apiRequest("PATCH", `/api/orders/${orderId}`, updateData);
      
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

  // Charge customer payment after confirming supplies
  const chargeCustomer = async (orderId: number) => {
    try {
      const response = await apiRequest("POST", `/api/orders/${orderId}/charge`, {
        updatedAt: new Date().toISOString()
      });
      
      if (response.ok) {
        await fetchOrders();
        toast({
          title: "Payment Charged",
          description: `Customer payment has been successfully charged for order #${orderId}`,
          variant: "success",
        });
      }
    } catch (error) {
      toast({
        title: "Charge Failed",
        description: "Failed to charge customer payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Set estimated time for order
  const setEstimatedTime = async (orderId: number, minutes: number) => {
    try {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}`, {
        estimatedTime: minutes,
        updatedAt: new Date().toISOString()
      });
      
      if (response.ok) {
        await fetchOrders();
        toast({
          title: "Time Estimated",
          description: `Order #${orderId} will be ready in ${minutes} minutes`,
          variant: "success",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set estimated time",
        variant: "destructive",
      });
    }
  };

  // Cancel order with reason
  const cancelOrder = async () => {
    if (!selectedOrderForAction || !cancelReason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a reason for cancellation",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, send customer notification if email is available
      if (selectedOrderForAction.customerInfo.email) {
        const notificationMessage = `Hello ${selectedOrderForAction.customerInfo.firstName},

We regret to inform you that your order #${selectedOrderForAction.id} has been cancelled.

Reason: ${cancelReason}

Your payment will be refunded within 3-5 business days. If you have any questions, please contact us directly.

We apologize for the inconvenience.`;

        await apiRequest("POST", "/api/notifications", {
          orderId: selectedOrderForAction.id,
          type: "order_cancelled",
          message: notificationMessage,
          customerEmail: selectedOrderForAction.customerInfo.email,
          requestDetails: {
            reason: cancelReason,
            cancelledBy: "employee",
            cancelledAt: new Date().toISOString()
          }
        });
      }

      const response = await apiRequest("PATCH", `/api/orders/${selectedOrderForAction.id}`, {
        status: "cancelled",
        cancellationReason: cancelReason,
        cancelledBy: "employee",
        cancelledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      if (response.ok) {
        await fetchOrders();
        toast({
          title: "Order Cancelled",
          description: selectedOrderForAction.customerInfo.email 
            ? `Order #${selectedOrderForAction.id} cancelled. Customer has been notified via email.`
            : `Order #${selectedOrderForAction.id} cancelled. No email notification sent (no email on file).`,
          variant: "success",
        });
        
        // Reset modal state
        setCancelModalOpen(false);
        setCancelReason("");
        setSelectedOrderForAction(null);
      }
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel order. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Request substitution from customer
  const requestSubstitution = async () => {
    if (!selectedOrderForAction || !substitutionReason.trim() || !substitutionSuggestion.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both reason and suggested replacement",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, send customer notification
      if (selectedOrderForAction.customerInfo.email) {
        const notificationMessage = `Hello ${selectedOrderForAction.customerInfo.firstName},

We need to make a substitution for your order #${selectedOrderForAction.id}.

Reason: ${substitutionReason}
Suggested alternative: ${substitutionSuggestion}

Please click the link below to approve or decline this substitution:`;

        await apiRequest("POST", "/api/notifications", {
          orderId: selectedOrderForAction.id,
          type: "substitution_request",
          message: notificationMessage,
          customerEmail: selectedOrderForAction.customerInfo.email,
          requestDetails: {
            reason: substitutionReason,
            suggestion: substitutionSuggestion,
            requestedBy: "employee",
            requestedAt: new Date().toISOString()
          }
        });
      }

      // Keep order status unchanged, but add substitution tracking fields
      const response = await apiRequest("PATCH", `/api/orders/${selectedOrderForAction.id}`, {
        specialInstructions: `SUBSTITUTION REQUEST: ${substitutionReason}. Suggested: ${substitutionSuggestion}. ${selectedOrderForAction.specialInstructions || ''}`.trim(),
        updatedAt: new Date().toISOString()
      });
      
      if (response.ok) {
        await fetchOrders();
        toast({
          title: "Substitution Requested",
          description: selectedOrderForAction.customerInfo.email 
            ? `Customer has been emailed about substitution for Order #${selectedOrderForAction.id}`
            : `Substitution logged for Order #${selectedOrderForAction.id} - No email on file`,
          variant: "success",
        });
        
        // Reset modal state
        setSubstitutionModalOpen(false);
        setSubstitutionReason("");
        setSubstitutionSuggestion("");
        setSelectedOrderForAction(null);
      }
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "Failed to send substitution request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Open cancellation modal
  const openCancelModal = (order: Order) => {
    setSelectedOrderForAction(order);
    setCancelModalOpen(true);
  };

  // Open substitution modal
  const openSubstitutionModal = (order: Order) => {
    setSelectedOrderForAction(order);
    setSubstitutionModalOpen(true);
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
        <div className="grid grid-cols-5 gap-4 mt-6">
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
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {orders.filter(o => o.status === "cancelled").length}
            </div>
            <div className="text-sm text-red-600">Cancelled</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {orders.filter(o => o.status !== "cancelled").length}
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

      {/* Order Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: "all", label: "All Orders", count: orders.length },
            { key: "confirmed", label: "New", count: orders.filter(o => o.status === "confirmed").length },
            { key: "preparing", label: "Preparing", count: orders.filter(o => o.status === "preparing").length },
            { key: "ready", label: "Ready", count: orders.filter(o => o.status === "ready").length },
            { key: "completed", label: "Completed", count: orders.filter(o => o.status === "completed").length },
            { key: "cancelled", label: "Cancelled", count: orders.filter(o => o.status === "cancelled").length },
            { key: "history", label: "Order History", count: orders.filter(o => o.status === "completed" || o.status === "cancelled").length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key ? "bg-red-100 text-red-600" : "bg-gray-200 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
          {(() => {
            let filteredOrders;
            if (activeTab === "all") {
              filteredOrders = orders;
            } else if (activeTab === "history") {
              filteredOrders = orders.filter(o => o.status === "completed" || o.status === "cancelled");
            } else {
              filteredOrders = orders.filter(o => o.status === activeTab);
            }
            return filteredOrders.map((order) => {
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
                            {order.tip && order.tip > 0 && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                                <h4 className="font-semibold text-green-800">Customer Tip: ${order.tip.toFixed(2)}</h4>
                                <p className="text-sm text-green-600">To be distributed among today's staff</p>
                              </div>
                            )}
                            <h4 className="font-semibold">Total: ${order.total.toFixed(2)}</h4>
                            {order.paymentStatus && (
                              <p className="text-sm text-gray-600 mt-1">
                                Payment Status: <span className="capitalize">{order.paymentStatus}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {order.status === "confirmed" && (
                      <div className="space-y-2">
                        {/* Check for substitution request in special instructions */}
                        {order.specialInstructions?.includes("SUBSTITUTION REQUEST") && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-orange-600" />
                              <span className="text-sm text-orange-800 font-medium">
                                Substitution Request
                              </span>
                            </div>
                            
                            {/* Display customer responses */}
                            {orderNotifications[order.id] && orderNotifications[order.id].length > 0 ? (
                              <div className="space-y-2">
                                {orderNotifications[order.id].map((notification: any) => (
                                  <div key={notification.id} className="bg-white rounded border p-2">
                                    <div className="text-xs text-gray-600 mb-1">
                                      {notification.type === 'substitution_request' ? 'Substitution Request' : 'Notification'}
                                    </div>
                                    
                                    {notification.customerResponse ? (
                                      <div className="space-y-1">
                                        <div className="text-sm font-medium text-green-700">
                                          Customer Response: {notification.responseStatus === 'approved' ? '✓ Approved' : '✗ Declined'}
                                        </div>
                                        <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                          "{notification.customerResponse}"
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          Responded: {new Date(notification.respondedAt).toLocaleString()}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-sm text-orange-700">
                                        Waiting for customer response...
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-orange-700">
                                Substitution request sent. You can still manage this order while waiting.
                              </p>
                            )}
                          </div>
                        )}

                        {/* Payment Authorization */}
                        {order.paymentStatus === "authorized" && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-yellow-800 font-medium">
                                Payment on Hold
                              </span>
                              <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                                ${order.total.toFixed(2)} Authorized
                              </Badge>
                            </div>
                            <Button 
                              onClick={() => chargeCustomer(order.id)}
                              className="bg-green-600 hover:bg-green-700 text-white w-full"
                              size="sm"
                            >
                              Confirm Supplies & Charge Customer
                            </Button>
                          </div>
                        )}
                        
                        {/* Time Estimation */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800 font-medium mb-2">Set Estimated Time</p>
                          <div className="grid grid-cols-3 gap-2">
                            <Button 
                              onClick={() => setEstimatedTime(order.id, 10)}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              10 min
                            </Button>
                            <Button 
                              onClick={() => setEstimatedTime(order.id, 15)}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              15 min
                            </Button>
                            <Button 
                              onClick={() => setEstimatedTime(order.id, 20)}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              20 min
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                          {order.status === "confirmed" && (
                            <Button 
                              onClick={() => updateOrderStatus(order.id, "preparing")}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white"
                              size="sm"
                            >
                              <ChefHat className="h-4 w-4 mr-1" />
                              Start Cooking
                            </Button>
                          )}
                          
                          {order.specialInstructions?.includes("SUBSTITUTION REQUEST") && (
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                onClick={() => updateOrderStatus(order.id, "preparing")}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                size="sm"
                              >
                                <ChefHat className="h-4 w-4 mr-1" />
                                Start Anyway
                              </Button>
                              <Button 
                                onClick={() => updateOrderStatus(order.id, "confirmed")}
                                variant="outline"
                                size="sm"
                                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Revert to Confirmed
                              </Button>
                            </div>
                          )}
                          
                          {/* Always Available Actions - Like Uber Eats */}
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                onClick={() => openSubstitutionModal(order)}
                                variant="outline"
                                size="sm"
                                className="border-orange-300 text-orange-700 hover:bg-orange-50"
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                {order.specialInstructions?.includes("SUBSTITUTION REQUEST") ? "Send Another Request" : "Request Substitution"}
                              </Button>
                              <Button 
                                onClick={() => openCancelModal(order)}
                                variant="outline"
                                size="sm"
                                className="border-red-300 text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel Order
                              </Button>
                            </div>
                            
                            {/* Additional Management Options */}
                            {order.specialInstructions?.includes("SUBSTITUTION REQUEST") && (
                              <div className="grid grid-cols-3 gap-1">
                                <Button 
                                  onClick={() => updateOrderStatus(order.id, "confirmed")}
                                  variant="outline"
                                  size="sm"
                                  className="border-blue-300 text-blue-700 hover:bg-blue-50 text-xs"
                                >
                                  Accept Original
                                </Button>
                                <Button 
                                  onClick={() => setEstimatedTime(order.id, 25)}
                                  variant="outline"
                                  size="sm"
                                  className="border-purple-300 text-purple-700 hover:bg-purple-50 text-xs"
                                >
                                  Extend Time
                                </Button>
                                <Button 
                                  onClick={() => openSubstitutionModal(order)}
                                  variant="outline"
                                  size="sm"
                                  className="border-green-300 text-green-700 hover:bg-green-50 text-xs"
                                >
                                  New Request
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
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

                    {/* Order History - Restore Options */}
                    {(order.status === "completed" || order.status === "cancelled") && activeTab === "history" && (
                      <div className="space-y-2">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800 font-medium mb-2">
                            Order Restoration - Go Back One Step
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {order.status === "completed" && (
                              <Button 
                                onClick={() => updateOrderStatus(order.id, "ready")}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                                size="sm"
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Back to Ready
                              </Button>
                            )}
                            {order.status === "cancelled" && (
                              <Button 
                                onClick={() => updateOrderStatus(order.id, "confirmed")}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                size="sm"
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Restore Order
                              </Button>
                            )}
                            <Button 
                              onClick={() => updateOrderStatus(order.id, "preparing")}
                              variant="outline"
                              size="sm"
                              className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            >
                              <ChefHat className="h-4 w-4 mr-1" />
                              Back to Kitchen
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
            });
          })()}
        </div>
      )}

      {/* Order Cancellation Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Cancel Order #{selectedOrderForAction?.id}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                This will cancel the order and notify the customer. Please provide a reason for cancellation.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Cancellation Reason</Label>
              <Select value={cancelReason} onValueChange={setCancelReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="out_of_ingredients">Out of ingredients</SelectItem>
                  <SelectItem value="equipment_issue">Equipment malfunction</SelectItem>
                  <SelectItem value="staffing_issue">Insufficient staffing</SelectItem>
                  <SelectItem value="high_volume">Too many orders - cannot fulfill in time</SelectItem>
                  <SelectItem value="special_request">Cannot accommodate special request</SelectItem>
                  <SelectItem value="other">Other reason</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {cancelReason === "other" && (
              <div className="space-y-2">
                <Label htmlFor="customReason">Please specify:</Label>
                <Textarea
                  id="customReason"
                  placeholder="Enter specific reason for cancellation..."
                  value={cancelReason === "other" ? "" : cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            <div className="flex space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setCancelModalOpen(false);
                  setCancelReason("");
                  setSelectedOrderForAction(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={cancelOrder}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={!cancelReason.trim()}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Cancel Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Substitution Request Modal */}
      <Dialog open={substitutionModalOpen} onOpenChange={setSubstitutionModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-700">
              <RotateCcw className="h-5 w-5" />
              Request Substitution - Order #{selectedOrderForAction?.id}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                Request a substitution from the customer when ingredients are unavailable. The customer will be contacted to approve or decline.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="substitutionReason">What item is unavailable?</Label>
              <Select value={substitutionReason} onValueChange={setSubstitutionReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unavailable item..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pepperoni">Pepperoni</SelectItem>
                  <SelectItem value="italian_sausage">Italian Sausage</SelectItem>
                  <SelectItem value="ham">Ham</SelectItem>
                  <SelectItem value="bacon">Bacon</SelectItem>
                  <SelectItem value="chicken">Chicken</SelectItem>
                  <SelectItem value="ground_beef">Ground Beef</SelectItem>
                  <SelectItem value="mushrooms">Mushrooms</SelectItem>
                  <SelectItem value="green_peppers">Green Peppers</SelectItem>
                  <SelectItem value="red_peppers">Red Peppers</SelectItem>
                  <SelectItem value="onions">Onions</SelectItem>
                  <SelectItem value="black_olives">Black Olives</SelectItem>
                  <SelectItem value="green_olives">Green Olives</SelectItem>
                  <SelectItem value="tomatoes">Fresh Tomatoes</SelectItem>
                  <SelectItem value="spinach">Spinach</SelectItem>
                  <SelectItem value="jalapenos">Jalapeños</SelectItem>
                  <SelectItem value="banana_peppers">Banana Peppers</SelectItem>
                  <SelectItem value="pineapple">Pineapple</SelectItem>
                  <SelectItem value="extra_cheese">Extra Cheese</SelectItem>
                  <SelectItem value="stuffed_crust">Stuffed Crust</SelectItem>
                  <SelectItem value="thin_crust">Thin Crust</SelectItem>
                  <SelectItem value="hand_tossed">Hand Tossed Crust</SelectItem>
                  <SelectItem value="thick_crust">Thick Crust</SelectItem>
                  <SelectItem value="gluten_free">Gluten-Free Crust</SelectItem>
                  <SelectItem value="entire_pizza">Entire Pizza Type</SelectItem>
                  <SelectItem value="other">Other item</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="substitutionSuggestion">Suggested replacement:</Label>
              <Textarea
                id="substitutionSuggestion"
                placeholder="e.g., 'Replace pepperoni with Italian sausage' or 'Substitute stuffed crust with hand-tossed'"
                value={substitutionSuggestion}
                onChange={(e) => setSubstitutionSuggestion(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSubstitutionModalOpen(false);
                  setSubstitutionReason("");
                  setSubstitutionSuggestion("");
                  setSelectedOrderForAction(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={requestSubstitution}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                disabled={!substitutionReason.trim() || !substitutionSuggestion.trim()}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Request Substitution
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}