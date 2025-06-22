import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Phone, 
  MapPin, 
  Timer, 
  ChefHat, 
  Truck, 
  DollarSign,
  Settings,
  Bell,
  Users,
  TrendingUp,
  Calendar,
  MessageSquare,
  Star,
  MoreVertical,
  Play,
  Pause,
  RotateCcw,
  Archive
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useHaptics } from "@/hooks/useHaptics";

interface Order {
  id: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    address?: string;
  };
  items: Array<{
    id: string;
    name: string;
    size: string;
    quantity: number;
    toppings: string[];
    crust?: string;
    price: number;
    specialInstructions?: string;
  }>;
  total: number;
  status: "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  orderType: "pickup";
  specialInstructions?: string;
  estimatedTime?: number;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
  priority?: "normal" | "high" | "urgent";
  deliveryDriver?: string;
  preparationNotes?: string;
  customerRating?: number;
}

interface KitchenStats {
  activeOrders: number;
  avgPrepTime: number;
  completedToday: number;
  efficiency: number;
}

export default function AdvancedEmployeeDashboard() {
  const [selectedTab, setSelectedTab] = useState("active");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [customTime, setCustomTime] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [autoAccept, setAutoAccept] = useState(false);
  const [maxOrders, setMaxOrders] = useState(10);
  const [preparationNotes, setPreparationNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [delayReason, setDelayReason] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { success, mediumImpact, error: hapticError } = useHaptics();

  // Fetch orders with real-time updates
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    refetchInterval: 3000, // More frequent updates like Uber Eats
  });

  // Kitchen statistics (employee view - no revenue)
  const kitchenStats: KitchenStats = {
    activeOrders: orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status)).length,
    avgPrepTime: 12, // minutes
    completedToday: orders.filter(o => o.status === 'completed' && 
      new Date(o.updatedAt).toDateString() === new Date().toDateString()).length,
    efficiency: 92
  };

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }: { orderId: number; updates: Partial<Order> }) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      success();
      toast({
        title: "Order Updated",
        description: "Order status has been successfully updated",
      });
    },
    onError: () => {
      hapticError();
      toast({
        title: "Update Failed",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (orderId: number, newStatus: Order['status'], additionalData?: any) => {
    const updates: Partial<Order> = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
      ...additionalData
    };

    if (customTime && newStatus === 'preparing') {
      updates.estimatedTime = parseInt(customTime);
    }

    if (preparationNotes) {
      updates.preparationNotes = preparationNotes;
    }

    updateOrderMutation.mutate({ orderId, updates });
    setSelectedOrder(null);
    setCustomTime("");
    setPreparationNotes("");
  };

  const handleOrderAction = (action: string, order: Order) => {
    mediumImpact();
    
    switch (action) {
      case 'accept':
        handleStatusUpdate(order.id, 'preparing');
        break;
      case 'ready':
        handleStatusUpdate(order.id, 'ready');
        break;
      case 'complete':
        handleStatusUpdate(order.id, 'completed');
        break;
      case 'cancel':
        if (cancelReason) {
          handleStatusUpdate(order.id, 'cancelled', { cancelReason });
          setCancelReason("");
        }
        break;
      case 'delay':
        if (delayReason && customTime) {
          handleStatusUpdate(order.id, 'preparing', { 
            delayReason,
            estimatedTime: parseInt(customTime) 
          });
          setDelayReason("");
          setCustomTime("");
        }
        break;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500';
      case 'preparing': return 'bg-orange-500';
      case 'ready': return 'bg-green-500';

      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };



  const getPriorityColor = (priority: Order['priority'] = 'normal') => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      default: return 'border-l-gray-300 bg-white';
    }
  };

  const filteredOrders = orders.filter(order => {
    switch (selectedTab) {
      case 'active':
        return ['confirmed', 'preparing'].includes(order.status);
      case 'ready':
        return order.status === 'ready';
      case 'completed':
        return ['completed', 'cancelled'].includes(order.status);
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="h-12 w-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading kitchen dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChefHat className="h-8 w-8 text-orange-500" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Kitchen Dashboard</h1>
                <p className="text-sm text-gray-500">Lemur Express Pizza</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-blue-500 text-white">
                EMPLOYEE DASHBOARD
              </Badge>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Kitchen Stats */}
      <div className="px-4 py-4 bg-white border-b">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{kitchenStats.activeOrders}</div>
            <div className="text-xs text-gray-500">Active Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{kitchenStats.avgPrepTime}m</div>
            <div className="text-xs text-gray-500">Avg Prep Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{kitchenStats.completedToday}</div>
            <div className="text-xs text-gray-500">Completed Today</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="flex">
          {[
            { key: 'active', label: 'Active', count: orders.filter(o => ['confirmed', 'preparing'].includes(o.status)).length },
            { key: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'ready').length },
            { key: 'completed', label: 'Completed', count: orders.filter(o => ['completed', 'cancelled'].includes(o.status)).length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`flex-1 py-3 px-4 text-center border-b-2 ${
                selectedTab === tab.key
                  ? 'border-orange-500 text-orange-600 bg-orange-50'
                  : 'border-transparent text-gray-500'
              }`}
            >
              <div className="text-sm font-medium">{tab.label}</div>
              {tab.count > 0 && (
                <div className="text-xs text-gray-400">{tab.count}</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No orders in this section</p>
            <p className="text-gray-400 text-sm">New orders will appear here automatically</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredOrders.map((order) => (
              <Card 
                key={order.id} 
                className={`border-l-4 ${getPriorityColor(order.priority)} hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-gray-900">#{order.id}</div>
                      <Badge className={`${getStatusColor(order.status)} text-white text-xs`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {order.priority !== 'normal' && (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          {order.priority?.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">${order.total.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {order.customerInfo.firstName} {order.customerInfo.lastName}
                      </span>

                    </div>
                    {order.estimatedTime && (
                      <div className="flex items-center space-x-1 text-orange-600">
                        <Timer className="h-4 w-4" />
                        <span className="text-sm font-medium">{order.estimatedTime}m</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 mb-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="text-sm text-gray-700">
                        <span className="font-medium">{item.quantity}x {item.name}</span>
                        {item.size && <span className="text-gray-500"> - {item.size}</span>}
                        {item.toppings.length > 0 && (
                          <span className="text-gray-500"> + {item.toppings.join(', ')}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.specialInstructions && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mb-3">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <span className="text-sm text-yellow-800">{order.specialInstructions}</span>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex space-x-2">
                    {order.status === 'confirmed' && (
                      <>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOrderAction('accept', order);
                          }}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start Prep
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {order.status === 'preparing' && (
                      <>
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOrderAction('ready', order);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Ready
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                        >
                          <Timer className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {order.status === 'ready' && (
                      <Button 
                        size="sm" 
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderAction('complete', order);
                        }}
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Order #{selectedOrder.id}</span>
                <Badge className={`${getStatusColor(selectedOrder.status)} text-white`}>
                  {selectedOrder.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-left">
              {/* Customer Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                <div className="space-y-1 text-sm">
                  <div>{selectedOrder.customerInfo.firstName} {selectedOrder.customerInfo.lastName}</div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{selectedOrder.customerInfo.phone}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                      <div className="font-medium">{item.quantity}x {item.name}</div>
                      {item.size && <div className="text-sm text-gray-600">Size: {item.size}</div>}
                      {item.crust && <div className="text-sm text-gray-600">Crust: {item.crust}</div>}
                      {item.toppings.length > 0 && (
                        <div className="text-sm text-gray-600">Toppings: {item.toppings.join(', ')}</div>
                      )}
                      {item.specialInstructions && (
                        <div className="text-sm text-yellow-700 bg-yellow-50 p-1 rounded mt-1">
                          Note: {item.specialInstructions}
                        </div>
                      )}
                      <div className="text-sm font-medium text-green-600">${item.price.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preparation Notes */}
              <div>
                <Label htmlFor="prep-notes">Preparation Notes</Label>
                <Textarea
                  id="prep-notes"
                  placeholder="Add notes about preparation, delays, or special handling..."
                  value={preparationNotes}
                  onChange={(e) => setPreparationNotes(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Quick Prep Time Selection */}
              {(['confirmed', 'preparing'].includes(selectedOrder.status)) && (
                <div>
                  <Label className="text-base font-medium">Prep Time (minutes)</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {[5, 10, 15, 20].map((minutes) => (
                      <Button
                        key={minutes}
                        variant={customTime === minutes.toString() ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCustomTime(minutes.toString())}
                        className="h-12"
                      >
                        {minutes}m
                      </Button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    placeholder="Custom time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="mt-2"
                    min="1"
                    max="60"
                  />
                </div>
              )}
            </div>
            <DialogFooter className="flex-col space-y-2">
              {selectedOrder.status === 'confirmed' && (
                <div className="flex space-x-2 w-full">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleOrderAction('accept', selectedOrder)}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start Preparation
                  </Button>
                </div>
              )}
              
              {selectedOrder.status === 'preparing' && (
                <div className="flex space-x-2 w-full">
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleOrderAction('ready', selectedOrder)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark as Ready
                  </Button>
                </div>
              )}
              
              {selectedOrder.status === 'ready' && (
                <div className="flex space-x-2 w-full">
                  <Button 
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleOrderAction('complete', selectedOrder)}
                  >
                    <Archive className="h-4 w-4 mr-1" />
                    Complete Order
                  </Button>
                </div>
              )}

              <div className="flex space-x-2 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedOrder(null)}>Close</Button>
                {!['completed', 'cancelled'].includes(selectedOrder.status) && (
                  <Button 
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      setCancelReason("Issue with order");
                      handleOrderAction('cancel', selectedOrder);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel Order
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Kitchen Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Employee Info */}
              <div>
                <Label className="text-base font-medium">Employee Dashboard</Label>
                <p className="text-sm text-gray-500 mt-1">Manage orders and kitchen operations</p>
              </div>

              {/* Auto Accept Orders */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Auto-Accept Orders</Label>
                  <p className="text-sm text-gray-500">Automatically accept new orders during busy periods</p>
                </div>
                <Switch
                  checked={autoAccept}
                  onCheckedChange={setAutoAccept}
                />
              </div>

              {/* Max Orders */}
              <div>
                <Label htmlFor="maxOrders" className="text-base font-medium">Maximum Active Orders</Label>
                <p className="text-sm text-gray-500 mb-2">Limit concurrent orders to manage kitchen capacity</p>
                <Input
                  id="maxOrders"
                  type="number"
                  min="1"
                  max="50"
                  value={maxOrders}
                  onChange={(e) => setMaxOrders(parseInt(e.target.value) || 10)}
                  className="w-24"
                />
              </div>

              {/* Sound Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Sound Notifications</Label>
                  <p className="text-sm text-gray-500">Play sound alerts for new orders</p>
                </div>
                <Switch defaultChecked />
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive mobile notifications for urgent orders</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setShowSettings(false);
                  toast({
                    title: "Settings Updated",
                    description: "Kitchen settings have been saved successfully",
                  });
                }}
              >
                Save Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}


    </div>
  );
}