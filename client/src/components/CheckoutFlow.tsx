import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Clock, Store, CreditCard, CheckCircle } from "lucide-react";
import { CustomerInfo, OrderData, CartItem } from "@shared/schema";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import PaymentForm from "@/components/PaymentForm";

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
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const orderType = "pickup"; // Always pickup only
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.0825; // 8.25% tax
  const deliveryFee = 0; // No delivery service
  const total = subtotal + tax;

  const handleCustomerInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.phone) {
      toast({
        title: "Required Information Missing",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(2);
  };

  const handlePaymentSuccess = (paymentTransactionId: string) => {
    setPaymentId(paymentTransactionId);
    setCurrentStep(3);
    submitOrder(paymentTransactionId);
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  const submitOrder = async (paymentTransactionId: string) => {
    setLoading(true);

    try {
      const orderData: OrderData = {
        customerInfo,
        items: cartItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        orderType,
        specialInstructions,
      };

      // Submit to Firestore with payment info
      const docRef = await addDoc(collection(db, "orders"), {
        ...orderData,
        userId: user?.uid || null,
        status: "confirmed",
        paymentId: paymentTransactionId,
        estimatedTime: 10, // 7-10 minutes for pickup
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
              <span>Est. 7-10 mins</span>
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

        {/* Pickup Information */}
        <Card>
          <CardHeader>
            <CardTitle>Pickup Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-red-600 bg-red-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold flex items-center">
                    <Store className="mr-2 h-5 w-5 text-red-600" />
                    Pickup Only
                  </h4>
                  <p className="text-sm text-neutral-secondary mt-1">Ready in 7-10 minutes</p>
                  <p className="text-xs text-neutral-secondary mt-1">2100 1st Street, Palacios, TX 77465</p>
                </div>
                <div className="w-5 h-5 border-2 border-red-600 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                </div>
              </div>
            </div>
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
