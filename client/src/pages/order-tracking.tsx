import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { Clock, CheckCircle, Truck, ArrowLeft, Search, Copy, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { orderStorage, OrderTrackingInfo } from "@/lib/orderStorage";
import { useQuery } from "@tanstack/react-query";

export default function OrderTracking() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchId, setSearchId] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState<string>("");
  const [orderHistory, setOrderHistory] = useState<OrderTrackingInfo[]>([]);

  // Load order history on mount
  useEffect(() => {
    setOrderHistory(orderStorage.getOrderHistory());
    
    // Check URL for order ID parameter
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = urlParams.get('id');
    if (orderIdFromUrl) {
      setCurrentOrderId(orderIdFromUrl);
      setSearchId(orderIdFromUrl);
    }
  }, []);

  // Fetch order details from server
  const { data: orderDetails, isLoading, error } = useQuery({
    queryKey: ['/api/orders', currentOrderId],
    enabled: !!currentOrderId,
  });

  const handleSearch = () => {
    if (!searchId.trim()) {
      toast({
        title: "Enter Order ID",
        description: "Please enter your order ID to track your order.",
        variant: "destructive",
      });
      return;
    }
    setCurrentOrderId(searchId.trim());
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Order ID copied to clipboard.",
    });
  };

  const getStatusIcon = (status: string) => {
    if (!status) return <Clock className="h-5 w-5 text-gray-500" />;
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'preparing':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'completed':
        return <Truck className="h-5 w-5 text-green-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-200 text-green-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
          <div></div>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Track Your Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Enter your order ID (e.g., LE123456ABC)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? "Searching..." : "Track Order"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Order Details */}
        {currentOrderId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order Details</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(currentOrderId)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy ID
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Order not found or there was an error loading your order.
                  </p>
                  <p className="text-sm text-gray-500">
                    Order ID: <span className="font-mono">{currentOrderId}</span>
                  </p>
                </div>
              ) : isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading order details...</p>
                </div>
              ) : orderDetails ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">Order #{orderDetails.id}</h3>
                      <p className="text-gray-600">ID: {currentOrderId}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(orderDetails.status)}>
                        {getStatusIcon(orderDetails.status)}
                        <span className="ml-2 capitalize">{orderDetails.status}</span>
                      </Badge>
                      {orderDetails.estimatedTime && (
                        <p className="text-sm text-gray-600 mt-1">
                          Est. ready: {orderDetails.estimatedTime} min
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Customer Information</h4>
                      <p className="text-sm text-gray-600">
                        {orderDetails.customerName}<br/>
                        {orderDetails.customerPhone}<br/>
                        {orderDetails.customerEmail && `${orderDetails.customerEmail}`}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Order Information</h4>
                      <p className="text-sm text-gray-600">
                        Type: Pickup<br/>
                        Total: ${orderDetails.total?.toFixed(2)}<br/>
                        Placed: {formatTime(orderDetails.createdAt)}
                      </p>
                    </div>
                  </div>

                  {orderDetails.items && (
                    <div>
                      <h4 className="font-medium mb-2">Order Items</h4>
                      <div className="space-y-2">
                        {JSON.parse(orderDetails.items).map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium">{item.name}</span>
                              {item.crust && <span className="text-sm text-gray-600"> - {item.crust}</span>}
                              {item.toppings && item.toppings.length > 0 && (
                                <div className="text-sm text-gray-600">
                                  Toppings: {item.toppings.join(', ')}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="font-medium">${item.price?.toFixed(2)}</span>
                              <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {orderDetails.specialInstructions && (
                    <div>
                      <h4 className="font-medium mb-2">Special Instructions</h4>
                      <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                        {orderDetails.specialInstructions}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Order History */}
        {orderHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orderHistory.map((order) => (
                  <div
                    key={order.orderId}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setCurrentOrderId(order.orderId);
                      setSearchId(order.orderId);
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Order #{order.orderNumber}</span>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.customerName} • {formatTime(order.timestamp)}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        ID: {order.orderId}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-medium mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Can't find your order? Call us at <span className="font-medium">(555) 123-PIZZA</span>
              </p>
              <p className="text-xs text-gray-500">
                Order IDs are in the format: LE123456ABC
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}