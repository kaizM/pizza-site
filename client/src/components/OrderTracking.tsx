import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock, Flame, Package, Phone } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface OrderTrackingProps {
  orderId: string;
}

interface OrderStatus {
  id: string;
  status: "confirmed" | "preparing" | "ready" | "completed";
  estimatedTime: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  total: number;
  createdAt: any;
}

export default function OrderTracking({ orderId }: OrderTrackingProps) {
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = onSnapshot(
      doc(db, "orders", orderId),
      (doc) => {
        if (doc.exists()) {
          setOrder({ id: doc.id, ...doc.data() } as OrderStatus);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching order:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-3">
                <div className="h-16 bg-gray-200 rounded"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-neutral-text mb-2">Order Not Found</h2>
            <p className="text-neutral-secondary">We couldn't find an order with ID: {orderId}</p>
          </CardContent>
        </Card>
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Track Your Order</h2>
              <p className="opacity-90">Order #{orderId.slice(-8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Estimated Time</p>
              <p className="text-xl font-bold">{order.estimatedTime} mins</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Order Status Timeline */}
          <div className="space-y-6">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? "bg-green-500" : "bg-gray-200"
              }`}>
                <Check className={`h-5 w-5 ${currentStep >= 1 ? "text-white" : "text-gray-400"}`} />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="font-semibold text-neutral-text">Order Confirmed</h4>
                <p className="text-sm text-neutral-secondary">We received your order</p>
              </div>
              <span className="text-sm text-neutral-secondary">
                {order.createdAt && new Date(order.createdAt.toDate()).toLocaleTimeString()}
              </span>
            </div>

            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? "bg-orange-500 animate-pulse" : "bg-gray-200"
              }`}>
                <Flame className={`h-5 w-5 ${currentStep >= 2 ? "text-white" : "text-gray-400"}`} />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="font-semibold text-neutral-text">Preparing Your Order</h4>
                <p className="text-sm text-neutral-secondary">Our chefs are making your pizza fresh</p>
              </div>
              <span className={`text-sm font-medium ${
                currentStep === 2 ? "text-orange-500" : "text-neutral-secondary"
              }`}>
                {currentStep === 2 ? "In Progress" : currentStep > 2 ? "Complete" : "Pending"}
              </span>
            </div>

            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? "bg-blue-500" : "bg-gray-200"
              }`}>
                <Package className={`h-5 w-5 ${currentStep >= 3 ? "text-white" : "text-gray-400"}`} />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="font-semibold text-neutral-text">Ready for Pickup</h4>
                <p className="text-sm text-neutral-secondary">Your order is ready!</p>
              </div>
              <span className={`text-sm font-medium ${
                currentStep === 3 ? "text-blue-500" : "text-neutral-secondary"
              }`}>
                {currentStep === 3 ? "Ready!" : currentStep > 3 ? "Complete" : "Pending"}
              </span>
            </div>
          </div>

          {/* Restaurant Contact */}
          <div className="mt-8 bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-neutral-text mb-2">Need Help?</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-secondary">Call us directly</p>
                <p className="font-medium text-neutral-text">(361) 403-0083</p>
              </div>
              <Button className="bg-red-600 hover:bg-red-700">
                <Phone className="mr-2 h-4 w-4" />
                Call Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
