import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Clock, Store, Truck } from "lucide-react";
import { CustomerInfo, OrderData, CartItem } from "@shared/schema";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

interface CheckoutFlowProps {
  cartItems: CartItem[];
  onOrderComplete: (orderId: string) => void;
}

export default function CheckoutFlow({ cartItems, onOrderComplete }: CheckoutFlowProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.0825; // 8.25% tax
  const deliveryFee = orderType === "delivery" ? 3.99 : 0;
  const total = subtotal + tax + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData: OrderData = {
        customerInfo,
        items: cartItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        orderType,
        specialInstructions,
      };

      // Submit to Firestore
      const docRef = await addDoc(collection(db, "orders"), {
        ...orderData,
        userId: user?.uid || null,
        status: "confirmed",
        estimatedTime: orderType === "pickup" ? 25 : 35,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Order Placed Successfully!",
        description: `Your order has been confirmed. Order ID: ${docRef.id}`,
        variant: "success",
      });

      onOrderComplete(docRef.id);
    } catch (error: any) {
      console.error("Order submission error:", error);
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Checkout</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-neutral-secondary">
              <Clock className="h-4 w-4" />
              <span>Est. {orderType === "pickup" ? "25-35" : "35-45"} mins</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <span className="ml-2 text-sm font-medium">Details</span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 text-neutral-secondary rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-neutral-secondary">Payment</span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 text-neutral-secondary rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-neutral-secondary">Confirm</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmitOrder} className="space-y-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={customerInfo.firstName}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={customerInfo.lastName}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                placeholder="(361) 555-0123"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Order Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Order Type</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={orderType} onValueChange={(value: "pickup" | "delivery") => setOrderType(value)}>
              <div className="grid sm:grid-cols-2 gap-4">
                <Label
                  htmlFor="pickup"
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:bg-opacity-10 ${
                    orderType === "pickup" ? "border-red-600 bg-red-50" : "border-gray-200"
                  }`}
                >
                  <RadioGroupItem value="pickup" id="pickup" className="sr-only" />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold flex items-center">
                        <Store className="mr-2 h-5 w-5 text-red-600" />
                        Pickup
                      </h4>
                      <p className="text-sm text-neutral-secondary mt-1">Ready in 25-30 mins</p>
                      <p className="text-xs text-neutral-secondary mt-1">2100 1st Street, Palacios, TX</p>
                    </div>
                    <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                      orderType === "pickup" ? "border-red-600" : "border-gray-300"
                    }`}>
                      {orderType === "pickup" && <div className="w-3 h-3 bg-red-600 rounded-full"></div>}
                    </div>
                  </div>
                </Label>

                <Label
                  htmlFor="delivery"
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:bg-opacity-10 ${
                    orderType === "delivery" ? "border-red-600 bg-red-50" : "border-gray-200"
                  }`}
                >
                  <RadioGroupItem value="delivery" id="delivery" className="sr-only" />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold flex items-center">
                        <Truck className="mr-2 h-5 w-5 text-neutral-secondary" />
                        Delivery
                      </h4>
                      <p className="text-sm text-neutral-secondary mt-1">Ready in 35-45 mins</p>
                      <p className="text-xs text-neutral-secondary mt-1">+ $3.99 delivery fee</p>
                    </div>
                    <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                      orderType === "delivery" ? "border-red-600" : "border-gray-300"
                    }`}>
                      {orderType === "delivery" && <div className="w-3 h-3 bg-red-600 rounded-full"></div>}
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Special Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={3}
              placeholder="Any special requests or notes for your order..."
            />
            <p className="text-xs text-neutral-secondary mt-2">
              Optional - Let us know if you have any specific preferences
            </p>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-lg font-semibold"
          disabled={loading}
        >
          {loading ? "Processing..." : `Place Order - $${total.toFixed(2)}`}
        </Button>
      </form>
    </div>
  );
}
