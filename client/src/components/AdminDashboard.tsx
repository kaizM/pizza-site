import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Receipt, 
  DollarSign, 
  Clock, 
  Timer, 
  ArrowUp, 
  ArrowDown, 
  Settings, 
  Plus, 
  RefreshCw 
} from "lucide-react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
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
  }>;
  total: number;
  status: "confirmed" | "preparing" | "ready" | "completed";
  orderType: "pickup" | "delivery";
  createdAt: any;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: new Date(),
      });
      
      toast({
        title: "Order Updated",
        description: `Order ${orderId.slice(-8).toUpperCase()} marked as ${newStatus}`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const filteredOrders = orders.filter(order => 
    statusFilter === "all" || order.status === statusFilter
  );

  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt?.toDate());
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });

  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
  const activeOrders = orders.filter(order => 
    order.status === "confirmed" || order.status === "preparing" || order.status === "ready"
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="secondary">Confirmed</Badge>;
      case "preparing":
        return <Badge className="bg-orange-100 text-orange-800">Preparing</Badge>;
      case "ready":
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-text">Admin Dashboard</h1>
          <p className="text-neutral-secondary">Manage your restaurant orders</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-secondary text-sm">Today's Orders</p>
                <p className="text-2xl font-bold text-neutral-text">{todayOrders.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Receipt className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+12%</span>
              <span className="text-neutral-secondary ml-1">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-secondary text-sm">Revenue</p>
                <p className="text-2xl font-bold text-neutral-text">${todayRevenue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+8%</span>
              <span className="text-neutral-secondary ml-1">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-secondary text-sm">Active Orders</p>
                <p className="text-2xl font-bold text-neutral-text">{activeOrders.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-neutral-secondary">
              In kitchen & ready
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-secondary text-sm">Avg. Prep Time</p>
                <p className="text-2xl font-bold text-neutral-text">23m</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Timer className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <ArrowDown className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">-3m</span>
              <span class="text-neutral-secondary ml-1">improvement</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Live Orders</CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium">#{order.id.slice(-8).toUpperCase()}</div>
                        <div className="text-sm text-neutral-secondary capitalize">
                          {order.orderType}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {order.customerInfo.firstName} {order.customerInfo.lastName}
                        </div>
                        <div className="text-sm text-neutral-secondary">
                          {order.customerInfo.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.items.map((item, index) => (
                          <div key={index}>
                            {item.quantity}x {item.name} ({item.size})
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-text">
                      {getTimeElapsed(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {order.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOrderStatus(order.id, "preparing")}
                          >
                            Start
                          </Button>
                        )}
                        {order.status === "preparing" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updateOrderStatus(order.id, "ready")}
                          >
                            Ready
                          </Button>
                        )}
                        {order.status === "ready" && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => updateOrderStatus(order.id, "completed")}
                          >
                            Complete
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
