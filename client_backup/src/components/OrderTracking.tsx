import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Check, 
  Clock, 
  ChefHat, 
  Package, 
  Phone, 
  MapPin, 
  CreditCard,
  Star,
  MessageSquare,
  Timer,
  Utensils,
  CheckCircle2,
  AlertCircle,
  Heart,
  RefreshCw,
  Home,
  ArrowLeft,
  XCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface OrderTrackingProps {
  orderId: string;
}

interface OrderStatus {
  id: number;
  status: "confirmed" | "preparing" | "ready" | "completed";
  estimatedTime: number | null;
  customerInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  total: number;
  subtotal: number;
  tax: number;
  tip: string | number;
  createdAt: string;
  updatedAt: string;
  paymentStatus: "authorized" | "charged" | "failed";
  specialInstructions?: string;
  items: Array<{
    id: string;
    name: string;
    size: string;
    crust?: string;
    toppings: string[];
    quantity: number;
    price: number;
  }>;
}

export default function OrderTracking({ orderId }: OrderTrackingProps) {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [responseText, setResponseText] = useState("");
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const progressRef = useRef<HTMLDivElement>(null);

  const { data: order, isLoading: loading, error, refetch } = useQuery({
    queryKey: ["/api/orders", orderId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Order not found');
      }
      return response.json();
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    enabled: !!orderId
  });

  // Fetch notifications for this order
  const { data: orderNotifications } = useQuery({
    queryKey: ["/api/notifications/order", orderId],
    queryFn: async () => {
      const response = await fetch(`/api/notifications/order/${orderId}`);
      if (!response.ok) return [];
      return response.json();
    },
    refetchInterval: 10000, // Check for new notifications every 10 seconds
    enabled: !!orderId
  });

  useEffect(() => {
    if (orderNotifications) {
      setNotifications(orderNotifications);
    }
  }, [orderNotifications]);

  const feedbackMutation = useMutation({
    mutationFn: async (feedbackData: { rating: number; comment: string }) => {
      const response = await fetch(`/api/orders/${orderId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });
      if (!response.ok) throw new Error('Failed to submit feedback');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thank you for your feedback!",
        description: "We appreciate your review and will use it to improve our service.",
        variant: "default"
      });
      setShowFeedback(false);
      setFeedback("");
      setRating(0);
    },
    onError: () => {
      toast({
        title: "Feedback submission failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const notificationResponseMutation = useMutation({
    mutationFn: async ({ notificationId, response, status }: { notificationId: number; response: string; status: string }) => {
      const res = await fetch(`/api/notifications/${notificationId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response, status })
      });
      if (!res.ok) throw new Error('Failed to submit response');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Response Submitted",
        description: "Thank you for your response. The restaurant has been notified.",
        variant: "default"
      });
      setSelectedNotification(null);
      setResponseText("");
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/order", orderId] });
    },
    onError: () => {
      toast({
        title: "Response Failed",
        description: "Unable to submit your response. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Loading state with unified pizza theme
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-8" style={{ background: 'var(--pizza-surface)' }}>
        <div className="max-w-4xl mx-auto p-6">
          {/* Navigation Header */}
          <div className="mb-6 flex items-center justify-between">
            <Link href="/">
              <Button 
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 shadow-lg transition-all duration-200"
                style={{ 
                  background: 'var(--pizza-primary)',
                  borderColor: 'var(--pizza-primary)'
                }}
              >
                <Home className="h-4 w-4" />
                Back to Homepage
              </Button>
            </Link>
            <div className="text-lg font-semibold" style={{ color: 'var(--pizza-text)' }}>
              Order Tracking
            </div>
          </div>
          
          <Card className="shadow-xl border-0">
            <CardHeader className="text-white rounded-t-lg" style={{ background: 'var(--pizza-gradient)' }}>
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <div>
                  <CardTitle className="text-2xl">Loading Your Order...</CardTitle>
                  <p className="text-blue-100">Please wait while we fetch your order details</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="animate-pulse space-y-6">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-8">
        <div className="max-w-4xl mx-auto p-6">
          <Card className="shadow-xl border-0">
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Order Not Found</h2>
              <p className="text-gray-600 mb-8 text-lg">We couldn't locate order #{orderId}. Please check your order number and try again.</p>
              <div className="space-y-4">
                <Button 
                  onClick={() => refetch()}
                  variant="outline"
                  className="mr-4"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button 
                  onClick={() => window.location.href = '/track-order'}
                  variant="outline"
                  className="mr-4"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Track Different Order
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Utensils className="mr-2 h-4 w-4" />
                  Order More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusStep = (status: string) => {
    switch (status) {
      case "confirmed": return 1;
      case "preparing": return 2;
      case "ready": return 3;
      case "completed": return 4;
      default: return 1;
    }
  };

  const currentStep = getStatusStep(order.status);
  const progressPercentage = (currentStep / 4) * 100;

  const getStepDetails = (step: number) => {
    const details = [
      { 
        title: "Order Confirmed", 
        description: "We've received your order and payment is secure",
        icon: CheckCircle2,
        color: "text-blue-600",
        bgColor: "bg-blue-100"
      },
      { 
        title: "Preparing Your Food", 
        description: "Our chefs are crafting your delicious meal",
        icon: ChefHat,
        color: "text-orange-600",
        bgColor: "bg-orange-100"
      },
      { 
        title: "Ready for Pickup", 
        description: "Your order is ready! Come get it while it's hot",
        icon: Package,
        color: "text-green-600",
        bgColor: "bg-green-100"
      },
      { 
        title: "Order Complete", 
        description: "Thank you for choosing us! Enjoy your meal",
        icon: Heart,
        color: "text-purple-600",
        bgColor: "bg-purple-100"
      }
    ];
    return details[step - 1];
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEstimatedReadyTime = () => {
    if (!order.estimatedTime) return "Calculating...";
    const orderTime = new Date(order.createdAt);
    const readyTime = new Date(orderTime.getTime() + order.estimatedTime * 60000);
    return readyTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeRemaining = () => {
    if (!order.estimatedTime) return null;
    const orderTime = new Date(order.createdAt);
    const readyTime = new Date(orderTime.getTime() + order.estimatedTime * 60000);
    const now = new Date();
    const diff = readyTime.getTime() - now.getTime();
    
    if (diff <= 0) return "Ready now!";
    
    const minutes = Math.ceil(diff / 60000);
    return `${minutes} min remaining`;
  };

  const submitFeedback = () => {
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        description: "Your rating helps us improve our service.",
        variant: "destructive"
      });
      return;
    }
    feedbackMutation.mutate({ rating, comment: feedback });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50" style={{ background: 'var(--pizza-surface)' }}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Navigation Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <Button 
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 shadow-lg transition-all duration-200"
              style={{ 
                background: 'var(--pizza-primary)',
                borderColor: 'var(--pizza-primary)'
              }}
            >
              <Home className="h-4 w-4" />
              Back to Homepage
            </Button>
          </Link>
          <div className="text-lg font-semibold" style={{ color: 'var(--pizza-text)' }}>
            Order Tracking
          </div>
        </div>

        {/* Professional Header with Live Status */}
        <Card className="mb-8 shadow-2xl border-0 overflow-hidden">
          <CardHeader className="text-white relative" style={{ background: 'var(--pizza-gradient)' }}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl font-bold mb-2">
                    Order #{order.id}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-blue-100">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Placed at {formatTime(order.createdAt)}
                    </div>
                    <div className="flex items-center">
                      <Timer className="mr-2 h-4 w-4" />
                      Ready by {getEstimatedReadyTime()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-white/20 text-white px-4 py-2 text-lg font-semibold">
                    {getTimeRemaining() || "Processing..."}
                  </Badge>
                  <p className="text-blue-100 mt-2 text-sm">
                    {order.customerInfo.firstName} {order.customerInfo.lastName}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Real-time Progress Tracker */}
        <Card className="mb-8 shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold text-gray-800">Order Progress</CardTitle>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000 ease-in-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((step) => {
                const stepDetails = getStepDetails(step);
                const Icon = stepDetails.icon;
                const isActive = step === currentStep;
                const isCompleted = step < currentStep;
                
                return (
                  <div 
                    key={step} 
                    className={`relative p-6 rounded-xl transition-all duration-500 ${
                      isActive 
                        ? `${stepDetails.bgColor} border-2 border-current shadow-lg scale-105` 
                        : isCompleted 
                        ? 'bg-green-50 border-2 border-green-200' 
                        : 'bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                        isActive 
                          ? stepDetails.bgColor
                          : isCompleted 
                          ? 'bg-green-100' 
                          : 'bg-gray-200'
                      }`}>
                        <Icon className={`h-8 w-8 ${
                          isActive 
                            ? stepDetails.color
                            : isCompleted 
                            ? 'text-green-600' 
                            : 'text-gray-400'
                        }`} />
                      </div>
                      <h3 className={`font-bold text-lg mb-2 ${
                        isActive 
                          ? stepDetails.color
                          : isCompleted 
                          ? 'text-green-700' 
                          : 'text-gray-500'
                      }`}>
                        {stepDetails.title}
                      </h3>
                      <p className={`text-sm ${
                        isActive 
                          ? 'text-gray-700'
                          : isCompleted 
                          ? 'text-green-600' 
                          : 'text-gray-400'
                      }`}>
                        {stepDetails.description}
                      </p>
                      {isActive && (
                        <div className="mt-3">
                          <div className="w-2 h-2 bg-current rounded-full mx-auto animate-pulse"></div>
                        </div>
                      )}
                      {isCompleted && (
                        <div className="absolute -top-2 -right-2">
                          <CheckCircle2 className="h-6 w-6 text-green-500 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Order Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Order Items */}
          <Card className="lg:col-span-2 shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <Utensils className="mr-3 h-6 w-6" />
                Your Delicious Order
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-800">{item.name}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.size}
                          </Badge>
                          {item.crust && (
                            <Badge variant="outline" className="text-xs">
                              {item.crust} Crust
                            </Badge>
                          )}
                          <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                        </div>
                        {item.toppings && item.toppings.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">Toppings:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.toppings.map((topping, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {topping}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-lg text-green-600">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer & Payment Info */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Phone className="mr-2 h-5 w-5" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Customer Name</p>
                    <p className="text-lg font-semibold">{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Phone</p>
                    <p className="text-lg">{order.customerInfo.phone}</p>
                  </div>
                  {order.customerInfo.email && (
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Email</p>
                      <p className="text-lg">{order.customerInfo.email}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Order Type</p>
                    <Badge className="bg-blue-100 text-blue-800">
                      <MapPin className="mr-1 h-3 w-3" />
                      Pickup
                    </Badge>
                  </div>
                  {order.specialInstructions && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                      <p className="text-sm text-gray-600 font-medium">Special Instructions</p>
                      <p className="text-sm mt-1">{order.specialInstructions}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tip</span>
                    <span className="font-medium">${Number(order.tip).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-green-600">${order.total.toFixed(2)}</span>
                  </div>
                  <div className="mt-4">
                    <Badge className={`w-full justify-center py-2 ${
                      order.paymentStatus === 'charged' 
                        ? 'bg-green-100 text-green-800 border-green-300' 
                        : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    }`}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payment {order.paymentStatus === 'charged' ? 'Completed' : 'Authorized'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notifications Section */}
        {notifications && notifications.filter(n => n.type === 'substitution_request' && !n.customerResponse).length > 0 && (
          <Card className="shadow-xl border-0 mb-8 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                Action Required - Substitution Request
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {notifications
                .filter(n => n.type === 'substitution_request' && !n.customerResponse)
                .map((notification, index) => (
                  <div key={notification.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-orange-800 mb-2">Restaurant Message:</h3>
                        <p className="text-gray-700 mb-3">{notification.message}</p>
                        <p className="text-sm text-gray-500">
                          Sent: {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={() => notificationResponseMutation.mutate({
                          notificationId: notification.id,
                          response: "approved",
                          status: "approved"
                        })}
                        disabled={notificationResponseMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve Substitution
                      </Button>
                      
                      <Button
                        onClick={() => notificationResponseMutation.mutate({
                          notificationId: notification.id,
                          response: "declined",
                          status: "declined"
                        })}
                        disabled={notificationResponseMutation.isPending}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                      
                      <Button
                        onClick={() => setSelectedNotification(notification)}
                        disabled={notificationResponseMutation.isPending}
                        variant="outline"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Add Comment
                      </Button>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {/* Custom Response Modal */}
        {selectedNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Respond to Substitution Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Restaurant Message:</Label>
                  <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded">{selectedNotification.message}</p>
                </div>
                
                <div>
                  <Label htmlFor="response" className="text-sm font-medium">Your Response:</Label>
                  <Textarea
                    id="response"
                    placeholder="Please approve/decline and add any special instructions..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => notificationResponseMutation.mutate({
                      notificationId: selectedNotification.id,
                      response: responseText || "approved",
                      status: "approved"
                    })}
                    disabled={notificationResponseMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                  
                  <Button
                    onClick={() => notificationResponseMutation.mutate({
                      notificationId: selectedNotification.id,
                      response: responseText || "declined",
                      status: "declined"
                    })}
                    disabled={notificationResponseMutation.isPending}
                    variant="destructive"
                    className="flex-1"
                  >
                    Decline
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setSelectedNotification(null);
                      setResponseText("");
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Previous Notifications */}
        {notifications && notifications.filter(n => n.customerResponse).length > 0 && (
          <Card className="shadow-xl border-0 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-700">
                <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
                Previous Responses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {notifications
                .filter(n => n.customerResponse)
                .map((notification) => (
                  <div key={notification.id} className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <p className="font-medium text-green-800">
                          Your response: {notification.responseStatus} 
                          {notification.customerResponse !== notification.responseStatus && 
                            ` - "${notification.customerResponse}"`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Responded: {new Date(notification.respondedAt!).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {/* Feedback Section */}
        {(order.status === 'completed' || order.status === 'ready') && (
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                How was your experience?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!showFeedback ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    We'd love to hear about your experience! Your feedback helps us serve you better.
                  </p>
                  <Button 
                    onClick={() => setShowFeedback(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Leave Feedback
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">Rate your experience</Label>
                    <div className="flex space-x-2 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`p-2 rounded-full transition-all ${
                            star <= rating 
                              ? 'text-yellow-500 bg-yellow-100' 
                              : 'text-gray-300 hover:text-yellow-400'
                          }`}
                        >
                          <Star className="h-8 w-8 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="feedback" className="text-base font-medium">
                      Tell us more (optional)
                    </Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="How was the food? Service? Anything we can improve?"
                      className="mt-2 min-h-[100px]"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <Button 
                      onClick={submitFeedback}
                      disabled={feedbackMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    >
                      {feedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowFeedback(false);
                        setRating(0);
                        setFeedback("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}