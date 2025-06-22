import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  RefreshCw,
  Download,
  Edit,
  Trash2,
  Pizza,
  Users,
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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

interface PizzaItem {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  activeOrders: number;
  avgPrepTime: number;
  recentOrders: Order[];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pizzas, setPizzas] = useState<PizzaItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todayOrders: 0,
    todayRevenue: 0,
    activeOrders: 0,
    avgPrepTime: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newPizza, setNewPizza] = useState({
    name: "",
    description: "",
    basePrice: 0,
    imageUrl: "",
    category: "signature",
    isActive: true
  });
  const { toast } = useToast();

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const ordersResponse = await apiRequest("GET", "/api/orders");
      const allOrders = await ordersResponse.json();
      setOrders(allOrders);

      // Fetch pizzas
      const pizzasResponse = await apiRequest("GET", "/api/pizzas");
      const allPizzas = await pizzasResponse.json();
      setPizzas(allPizzas);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayOrders = allOrders.filter((order: Order) => 
        new Date(order.createdAt) >= today
      );
      
      const todayRevenue = todayOrders.reduce((sum: number, order: Order) => 
        sum + order.total, 0
      );
      
      const activeOrders = allOrders.filter((order: Order) => 
        order.status !== "completed"
      );

      const recentOrders = allOrders
        .sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 10);

      setStats({
        todayOrders: todayOrders.length,
        todayRevenue,
        activeOrders: activeOrders.length,
        avgPrepTime: 8, // Default estimated time
        recentOrders
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
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
        await fetchData();
        toast({
          title: "Order Updated",
          description: `Order #${orderId} status updated to ${newStatus}`,
          variant: "success",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  // Add new pizza
  const addPizza = async () => {
    try {
      if (!newPizza.name || !newPizza.description || newPizza.basePrice <= 0) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const response = await apiRequest("POST", "/api/pizzas", newPizza);
      
      if (response.ok) {
        await fetchData();
        setNewPizza({
          name: "",
          description: "",
          basePrice: 0,
          imageUrl: "",
          category: "signature",
          isActive: true
        });
        toast({
          title: "Pizza Added",
          description: "New pizza item has been added to the menu",
          variant: "success",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add pizza",
        variant: "destructive",
      });
    }
  };

  // Auto-refresh every 60 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-blue-500 text-white";
      case "preparing": return "bg-yellow-500 text-black";
      case "ready": return "bg-green-500 text-white";
      case "completed": return "bg-gray-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const exportOrders = () => {
    const csvContent = [
      ["Order ID", "Customer", "Phone", "Items", "Total", "Status", "Date"].join(","),
      ...orders.map(order => [
        order.id,
        `${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
        order.customerInfo.phone,
        order.items.map(item => `${item.quantity}x ${item.name}`).join("; "),
        order.total.toFixed(2),
        order.status,
        new Date(order.createdAt).toLocaleDateString()
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-600 rounded-full">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600">Hunt Brothers Pizza - Management Portal</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button onClick={exportOrders} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Orders
            </Button>
            <Button onClick={fetchData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +8% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Prep Time</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgPrepTime}m</div>
            <p className="text-xs text-muted-foreground">
              Within target range
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="menu">Menu Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>
                        {order.customerInfo.firstName} {order.customerInfo.lastName}
                      </TableCell>
                      <TableCell>
                        {order.items.map(item => `${item.quantity}x ${item.name}`).join(", ").slice(0, 30)}...
                      </TableCell>
                      <TableCell>${order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              View
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
                              <div className="flex justify-between items-center pt-4 border-t">
                                <h4 className="font-semibold">Total: ${order.total.toFixed(2)}</h4>
                                <div className="space-x-2">
                                  {order.status !== "completed" && (
                                    <Button 
                                      onClick={() => updateOrderStatus(order.id, "completed")}
                                      size="sm"
                                    >
                                      Mark Complete
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          {/* All Orders */}
          <Card>
            <CardHeader>
              <CardTitle>All Orders ({orders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>
                        {order.customerInfo.firstName} {order.customerInfo.lastName}
                      </TableCell>
                      <TableCell>{order.customerInfo.phone}</TableCell>
                      <TableCell>
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </TableCell>
                      <TableCell>${order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="space-y-6">
          {/* Add New Pizza */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Pizza</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Pizza Name</Label>
                  <Input
                    id="name"
                    value={newPizza.name}
                    onChange={(e) => setNewPizza({...newPizza, name: e.target.value})}
                    placeholder="e.g., Pepperoni Supreme"
                  />
                </div>
                <div>
                  <Label htmlFor="basePrice">Base Price</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={newPizza.basePrice || ""}
                    onChange={(e) => setNewPizza({...newPizza, basePrice: parseFloat(e.target.value) || 0})}
                    placeholder="11.99"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPizza.description}
                  onChange={(e) => setNewPizza({...newPizza, description: e.target.value})}
                  placeholder="Delicious pizza with fresh ingredients..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newPizza.category}
                    onValueChange={(value) => setNewPizza({...newPizza, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="signature">Signature</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="specialty">Specialty</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={newPizza.imageUrl}
                    onChange={(e) => setNewPizza({...newPizza, imageUrl: e.target.value})}
                    placeholder="https://example.com/pizza.jpg"
                  />
                </div>
              </div>
              <Button onClick={addPizza} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Pizza to Menu
              </Button>
            </CardContent>
          </Card>

          {/* Current Menu */}
          <Card>
            <CardHeader>
              <CardTitle>Current Menu ({pizzas.length} items)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pizzas.map((pizza) => (
                  <Card key={pizza.id} className="relative">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{pizza.name}</CardTitle>
                        <Badge variant={pizza.isActive ? "default" : "secondary"}>
                          {pizza.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">{pizza.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">${Number(pizza.basePrice).toFixed(2)}</span>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Orders:</span>
                    <span className="font-bold">{orders.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Revenue:</span>
                    <span className="font-bold">
                      ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Order Value:</span>
                    <span className="font-bold">
                      ${orders.length > 0 ? (orders.reduce((sum, order) => sum + order.total, 0) / orders.length).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed Orders:</span>
                    <span className="font-bold">
                      {orders.filter(order => order.status === "completed").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["confirmed", "preparing", "ready", "completed"].map(status => {
                    const count = orders.filter(order => order.status === status).length;
                    const percentage = orders.length > 0 ? (count / orders.length * 100).toFixed(1) : '0';
                    return (
                      <div key={status} className="flex justify-between items-center">
                        <span className="capitalize">{status}:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">{count}</span>
                          <span className="text-sm text-gray-500">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}