import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Clock, CheckCircle, AlertCircle, Phone, User, MapPin, Package, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { usePWA } from '@/hooks/usePWA';
import { useHaptics } from '@/hooks/useHaptics';
import NotificationManager from './NotificationManager';

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

export default function EmployeeMobileApp() {
  const [selectedTab, setSelectedTab] = useState("new");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [customTime, setCustomTime] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isInstallable, installApp } = usePWA();
  const { success, mediumImpact } = useHaptics();

  // Fetch all orders
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, estimatedTime }: { 
      orderId: number; 
      status: string; 
      estimatedTime?: number 
    }) => {
      const updates: any = { status };
      if (estimatedTime) updates.estimatedTime = estimatedTime;
      
      return await apiRequest('PATCH', `/api/orders/${orderId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      success(); // Haptic feedback
      toast({
        title: "Order updated",
        description: "Order status has been updated successfully",
      });
      setSelectedOrder(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: number; reason: string }) => {
      return await apiRequest('POST', `/api/orders/${orderId}/cancel`, {
        reason,
        cancelledBy: 'employee'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      mediumImpact(); // Haptic feedback
      toast({
        title: "Order cancelled",
        description: "Order has been cancelled successfully",
      });
      setSelectedOrder(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      });
    },
  });

  // Request substitution mutation
  const substitutionMutation = useMutation({
    mutationFn: async ({ orderId, reason, suggestion }: { 
      orderId: number; 
      reason: string; 
      suggestion: string 
    }) => {
      return await apiRequest('POST', `/api/orders/${orderId}/substitution`, {
        substitutionReason: reason,
        substitutionSuggestion: suggestion,
        requestedBy: 'employee'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      success(); // Haptic feedback
      toast({
        title: "Substitution requested",
        description: "Customer will be notified about the substitution",
      });
      setSelectedOrder(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to request substitution",
        variant: "destructive",
      });
    },
  });

  // Update time mutation
  const updateTimeMutation = useMutation({
    mutationFn: async ({ orderId, estimatedTime }: { orderId: number; estimatedTime: number }) => {
      return await apiRequest('POST', `/api/orders/${orderId}/time`, {
        estimatedTime
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      success(); // Haptic feedback
      toast({
        title: "Time updated",
        description: "Estimated preparation time has been updated",
      });
      setSelectedOrder(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update time",
        variant: "destructive",
      });
    },
  });

  // Filter orders by status
  const newOrders = orders.filter(order => order.status === "confirmed");
  const preparingOrders = orders.filter(order => order.status === "preparing");
  const readyOrders = orders.filter(order => order.status === "ready");
  const completedOrders = orders.filter(order => order.status === "completed");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-blue-500";
      case "preparing": return "bg-yellow-500";
      case "ready": return "bg-green-500";
      case "completed": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <Bell className="h-4 w-4" />;
      case "preparing": return <Clock className="h-4 w-4" />;
      case "ready": return <CheckCircle className="h-4 w-4" />;
      case "completed": return <Package className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = (orderId: number, newStatus: string) => {
    const estimatedTime = customTime ? parseInt(customTime) : undefined;
    updateStatusMutation.mutate({ orderId, status: newStatus, estimatedTime });
    setCustomTime("");
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow active:scale-95 transition-transform" 
          onClick={() => {
            mediumImpact();
            setSelectedOrder(order);
          }}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Order #{order.id}</CardTitle>
          <Badge className={`${getStatusColor(order.status)} text-white`}>
            <div className="flex items-center gap-1">
              {getStatusIcon(order.status)}
              {order.status}
            </div>
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>{order.customerInfo.firstName} {order.customerInfo.lastName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="h-4 w-4" />
          <span>{order.customerInfo.phone}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total: ${order.total.toFixed(2)}</span>
            <span className="text-sm text-gray-500">
              {formatTime(order.createdAt)}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)}
          </div>
          {order.estimatedTime && (
            <div className="flex items-center gap-1 text-sm text-orange-600">
              <Clock className="h-4 w-4" />
              <span>{order.estimatedTime} min</span>
            </div>
          )}
          {order.orderType === "delivery" && (
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <MapPin className="h-4 w-4" />
              <span>Delivery</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const OrderDetailModal = ({ order }: { order: Order }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>Order #{order.id}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
              ×
            </Button>
          </div>
        </CardHeader>
        <ScrollArea className="max-h-[60vh]">
          <CardContent className="space-y-4">
            {/* Customer Info */}
            <div>
              <h3 className="font-semibold mb-2">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{order.customerInfo.firstName} {order.customerInfo.lastName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{order.customerInfo.phone}</span>
                </div>
                {order.customerInfo.email && (
                  <div className="text-gray-600">{order.customerInfo.email}</div>
                )}
              </div>
            </div>

            <Separator />

            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-2">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm">×{item.quantity}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Size: {item.size}</div>
                      {item.crust && <div>Crust: {item.crust}</div>}
                      {item.toppings.length > 0 && (
                        <div>Toppings: {item.toppings.join(", ")}</div>
                      )}
                      <div className="font-medium">${item.price.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Special Instructions */}
            {order.specialInstructions && (
              <>
                <div>
                  <h3 className="font-semibold mb-2">Special Instructions</h3>
                  <p className="text-sm text-gray-600">{order.specialInstructions}</p>
                </div>
                <Separator />
              </>
            )}

            {/* Order Summary */}
            <div>
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Order Type: {order.orderType}
              </div>
              <div className="text-sm text-gray-600">
                Placed: {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {order.status === "confirmed" && (
                <Button 
                  className="w-full"
                  onClick={() => updateStatusMutation.mutate({ 
                    orderId: order.id, 
                    status: "preparing" 
                  })}
                  disabled={updateStatusMutation.isPending}
                >
                  Start Preparing
                </Button>
              )}
              
              {order.status === "preparing" && (
                <Button 
                  className="w-full"
                  onClick={() => updateStatusMutation.mutate({ 
                    orderId: order.id, 
                    status: "ready" 
                  })}
                  disabled={updateStatusMutation.isPending}
                >
                  Mark as Ready
                </Button>
              )}
              
              {order.status === "ready" && (
                <Button 
                  className="w-full"
                  onClick={() => updateStatusMutation.mutate({ 
                    orderId: order.id, 
                    status: "completed" 
                  })}
                  disabled={updateStatusMutation.isPending}
                >
                  Complete Order
                </Button>
              )}

              {/* Custom Time Input */}
              {order.status !== "completed" && order.status !== "cancelled" && (
                <div className="space-y-2">
                  <Label htmlFor="custom-time">Update Estimated Time (minutes)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="custom-time"
                      type="number"
                      placeholder="15"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      min="5"
                      max="60"
                    />
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const time = parseInt(customTime);
                        if (time >= 5 && time <= 60) {
                          updateTimeMutation.mutate({ 
                            orderId: order.id, 
                            estimatedTime: time
                          });
                          setCustomTime("");
                        }
                      }}
                      disabled={!customTime || updateTimeMutation.isPending}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              )}

              {/* Quick Time Buttons */}
              {order.status !== "completed" && order.status !== "cancelled" && (
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateTimeMutation.mutate({ orderId: order.id, estimatedTime: 10 })}
                    disabled={updateTimeMutation.isPending}
                  >
                    10 min
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateTimeMutation.mutate({ orderId: order.id, estimatedTime: 15 })}
                    disabled={updateTimeMutation.isPending}
                  >
                    15 min
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateTimeMutation.mutate({ orderId: order.id, estimatedTime: 20 })}
                    disabled={updateTimeMutation.isPending}
                  >
                    20 min
                  </Button>
                </div>
              )}

              {/* Substitution Request */}
              {order.status !== "completed" && order.status !== "cancelled" && (
                <div className="space-y-2">
                  <Label>Request Substitution</Label>
                  <Select onValueChange={(value) => {
                    const [reason, suggestion] = value.split('|');
                    substitutionMutation.mutate({
                      orderId: order.id,
                      reason,
                      suggestion
                    });
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select substitution..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pepperoni|ham">Out of Pepperoni → Ham</SelectItem>
                      <SelectItem value="italian_sausage|chicken">Out of Italian Sausage → Chicken</SelectItem>
                      <SelectItem value="mushrooms|bell_peppers">Out of Mushrooms → Bell Peppers</SelectItem>
                      <SelectItem value="thin_crust|original">Out of Thin Crust → Original</SelectItem>
                      <SelectItem value="large_size|medium">Out of Large → Medium Size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Cancel Order */}
              {order.status !== "completed" && order.status !== "cancelled" && (
                <div className="space-y-2">
                  <Label>Cancel Order</Label>
                  <Select onValueChange={(reason) => {
                    cancelOrderMutation.mutate({
                      orderId: order.id,
                      reason
                    });
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cancel reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="out_of_ingredients">Out of Ingredients</SelectItem>
                      <SelectItem value="equipment_failure">Equipment Failure</SelectItem>
                      <SelectItem value="staffing_issue">Staffing Issue</SelectItem>
                      <SelectItem value="customer_request">Customer Request</SelectItem>
                      <SelectItem value="special_request">Unable to Fulfill Special Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {order.status !== "completed" && order.status !== "cancelled" && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold">Update Status</h3>
                  
                  {order.status === "confirmed" && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="estimated-time">Estimated Time (minutes)</Label>
                        <Input
                          id="estimated-time"
                          type="number"
                          placeholder="e.g., 15"
                          value={customTime}
                          onChange={(e) => setCustomTime(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={() => handleStatusUpdate(order.id, "preparing")}
                        className="w-full"
                        disabled={updateStatusMutation.isPending}
                      >
                        Start Preparing
                      </Button>
                    </div>
                  )}

                  {order.status === "preparing" && (
                    <Button 
                      onClick={() => handleStatusUpdate(order.id, "ready")}
                      className="w-full"
                      disabled={updateStatusMutation.isPending}
                    >
                      Mark as Ready
                    </Button>
                  )}

                  {order.status === "ready" && (
                    <Button 
                      onClick={() => handleStatusUpdate(order.id, "completed")}
                      className="w-full"
                      disabled={updateStatusMutation.isPending}
                    >
                      Complete Order
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-orange-500 text-white p-4 sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-center">Lemur Express 11</h1>
            <p className="text-center text-orange-100">Employee Kitchen App</p>
          </div>
          {isInstallable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={installApp}
              className="text-white hover:bg-orange-600"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white p-4 shadow-sm">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{newOrders.length}</div>
            <div className="text-xs text-gray-600">New</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{preparingOrders.length}</div>
            <div className="text-xs text-gray-600">Preparing</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{readyOrders.length}</div>
            <div className="text-xs text-gray-600">Ready</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">{completedOrders.length}</div>
            <div className="text-xs text-gray-600">Done</div>
          </div>
        </div>
      </div>

      {/* Order Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-4 bg-white border-b">
          <TabsTrigger value="new" className="relative">
            New
            {newOrders.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-xs p-0 flex items-center justify-center">
                {newOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preparing" className="relative">
            Preparing
            {preparingOrders.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-yellow-500 text-xs p-0 flex items-center justify-center">
                {preparingOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ready" className="relative">
            Ready
            {readyOrders.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-green-500 text-xs p-0 flex items-center justify-center">
                {readyOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <div className="p-4">
          <TabsContent value="new" className="mt-0">
            {newOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No new orders</p>
              </div>
            ) : (
              newOrders.map(order => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="preparing" className="mt-0">
            {preparingOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No orders being prepared</p>
              </div>
            ) : (
              preparingOrders.map(order => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="ready" className="mt-0">
            {readyOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No orders ready for pickup</p>
              </div>
            ) : (
              readyOrders.map(order => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            {completedOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No completed orders today</p>
              </div>
            ) : (
              completedOrders.slice(0, 20).map(order => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* Order Detail Modal */}
      {selectedOrder && <OrderDetailModal order={selectedOrder} />}
      
      {/* Notification Manager */}
      <NotificationManager orders={orders} />
    </div>
  );
}