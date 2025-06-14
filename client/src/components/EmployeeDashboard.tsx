import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Clock, 
  ChefHat, 
  CheckCircle, 
  Phone, 
  Eye,
  Timer,
  RefreshCw
} from "lucide-react";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  items: Array<{
    name: string;
    size: string;
    quantity: number;
    toppings: string[];
  }>;
  total: number;
  status: "confirmed" | "preparing" | "ready" | "completed";
  orderType: "pickup" | "delivery";
  specialInstructions?: string;
  estimatedTime: number;
  createdAt: any;
}

export default function EmployeeDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [customTime, setCustomTime] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Only show active orders (not completed)
    const q = query(
      collection(db, "orders"),
      where("status", "in", ["confirmed", "preparing", "ready"]),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData: Order[] = [];
      querySnapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string, estimatedTime?: number) => {
    try {
      const updateData: any = {
        status: newStatus,
        updatedAt: new Date(),
      };

      if (estimatedTime) {
        updateData.estimatedTime = estimatedTime;
      }

      await updateDoc(doc(db, "orders", orderId), updateData);
      
      toast({
        title: "Order Updated",
        description: `Order ${orderId.slice(-8).toUpperCase()} marked as ${newStatus}`,
        variant: "success",
      });
    } catch (error) {
      // Log error securely without exposing sensitive data
      toast({
        title: "Update Failed",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const setCustomEstimatedTime = async (orderId: string) => {
    const time = parseInt(customTime);
    if (!time || time < 1) {
      toast({
        title: "Invalid Time",
        description: "Please enter a valid time in minutes",
        variant: "destructive",
      });
      return;
    }

    await updateOrderStatus(orderId, "preparing", time);
    setCustomTime("");
    toast({
      title: "Time Updated",
      description: `Order will be ready in ${time} minutes`,
      variant: "success",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "preparing":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "ready":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTimeElapsed = (createdAt: any) => {
    if (!createdAt) return "Unknown";
    const now = new Date();
    const orderTime = new Date(createdAt.toDate());
    const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours}h ${diffMinutes % 60}m ago`;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-text flex items-center">
            <ChefHat className="mr-3 h-8 w-8 text-red-600" />
            Kitchen Dashboard
          </h1>
          <p className="text-neutral-secondary">Manage incoming orders and update status</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="px-3 py-1">
            <Clock className="mr-1 h-4 w-4" />
            {orders.length} Active Orders
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.status === "confirmed").length}
            </div>
            <div className="text-sm text-blue-700">New Orders</div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {orders.filter(o => o.status === "preparing").length}
            </div>
            <div className="text-sm text-orange-700">In Kitchen</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === "ready").length}
            </div>
            <div className="text-sm text-green-700">Ready for Pickup</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ChefHat className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-text mb-2">No Active Orders</h3>
            <p className="text-neutral-secondary">All caught up! New orders will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <Card key={order.id} className={`border-2 ${getStatusColor(order.status)} hover:shadow-lg transition-shadow`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Order #{order.id.slice(-8).toUpperCase()}
                  </CardTitle>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-neutral-secondary">
                  <span>{getTimeElapsed(order.createdAt)}</span>
                  <span className="font-medium">${order.total.toFixed(2)}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div>
                  <div className="font-medium text-neutral-text">
                    {order.customerInfo.firstName} {order.customerInfo.lastName}
                  </div>
                  <div className="text-sm text-neutral-secondary flex items-center">
                    <Phone className="mr-1 h-3 w-3" />
                    {order.customerInfo.phone}
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="bg-white rounded p-2 border">
                      <div className="font-medium text-sm">
                        {item.quantity}x {item.name} ({item.size})
                      </div>
                      {item.toppings && item.toppings.length > 0 && (
                        <div className="text-xs text-neutral-secondary">
                          {item.toppings.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <div className="text-xs font-medium text-yellow-800 mb-1">Special Instructions:</div>
                    <div className="text-xs text-yellow-700">{order.specialInstructions}</div>
                  </div>
                )}

                {/* Estimated Time */}
                <div className="flex items-center justify-center bg-gray-50 rounded p-2">
                  <Timer className="mr-1 h-4 w-4 text-neutral-secondary" />
                  <span className="text-sm font-medium">Est. {order.estimatedTime} mins</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {order.status === "confirmed" && (
                    <div className="space-y-2">
                      <Button
                        onClick={() => updateOrderStatus(order.id, "preparing")}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        size="sm"
                      >
                        <ChefHat className="mr-2 h-4 w-4" />
                        Start Cooking
                      </Button>
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          placeholder="Minutes"
                          value={customTime}
                          onChange={(e) => setCustomTime(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => setCustomEstimatedTime(order.id)}
                          variant="outline"
                          size="sm"
                        >
                          Set Time
                        </Button>
                      </div>
                    </div>
                  )}

                  {order.status === "preparing" && (
                    <Button
                      onClick={() => updateOrderStatus(order.id, "ready")}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark Ready
                    </Button>
                  )}

                  {order.status === "ready" && (
                    <Button
                      onClick={() => updateOrderStatus(order.id, "completed")}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Order
                    </Button>
                  )}

                  {/* View Details Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Order Details #{order.id.slice(-8).toUpperCase()}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Customer</Label>
                          <div className="text-sm">
                            {order.customerInfo.firstName} {order.customerInfo.lastName}
                          </div>
                          <div className="text-sm text-neutral-secondary">{order.customerInfo.phone}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Order Type</Label>
                          <div className="text-sm capitalize">{order.orderType}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Items</Label>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="bg-gray-50 rounded p-2">
                                <div className="font-medium text-sm">
                                  {item.quantity}x {item.name} ({item.size})
                                </div>
                                {item.toppings && item.toppings.length > 0 && (
                                  <div className="text-xs text-neutral-secondary">
                                    Toppings: {item.toppings.join(", ")}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        {order.specialInstructions && (
                          <div>
                            <Label className="text-sm font-medium">Special Instructions</Label>
                            <div className="text-sm bg-yellow-50 border border-yellow-200 rounded p-2">
                              {order.specialInstructions}
                            </div>
                          </div>
                        )}
                        <div>
                          <Label className="text-sm font-medium">Total</Label>
                          <div className="text-lg font-bold text-red-600">${order.total.toFixed(2)}</div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}