import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Clock, Store, CreditCard, CheckCircle } from "lucide-react";
import { CustomerInfo, OrderData, CartItem } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import PaymentForm from "@/components/PaymentForm";
import { apiRequest } from "@/lib/queryClient";

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
  const [tip, setTip] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const orderType = "pickup";
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.0825;
  const totalWithoutTip = subtotal + tax;
  const finalTotal = totalWithoutTip + tip;
  
  // Preset tip options
  const tipOptions = [
    { label: "No Tip", value: 0 },
    { label: "15%", value: Math.round(totalWithoutTip * 0.15 * 100) / 100 },
    { label: "18%", value: Math.round(totalWithoutTip * 0.18 * 100) / 100 },
    { label: "20%", value: Math.round(totalWithoutTip * 0.20 * 100) / 100 },
    { label: "Custom", value: -1 }
  ];

  const handleTipSelection = (selectedTip: number) => {
    if (selectedTip === -1) {
      setTip(0);
    } else {
      setTip(selectedTip);
      setCustomTip("");
    }
  };

  const handleCustomTipChange = (value: string) => {
    setCustomTip(value);
    const customAmount = parseFloat(value) || 0;
    setTip(customAmount);
  };

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
        tip: parseFloat(tip.toFixed(2)),
        total: parseFloat(finalTotal.toFixed(2)),
        orderType,
        specialInstructions,
        paymentStatus: "authorized", // Payment held until order confirmed
      };

      // Log complete order details for testing
      console.log("=== ORDER SUBMISSION DATA ===");
      console.log("Customer Info:", {
        name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        phone: customerInfo.phone,
        email: customerInfo.email || 'Not provided'
      });
      console.log("Order Items:", cartItems.map(item => ({
        name: item.name,
        size: item.size,
        crust: item.crust,
        toppings: item.toppings,
        quantity: item.quantity,
        price: `$${item.price.toFixed(2)}`
      })));
      console.log("Order Type:", orderType);
      console.log("Special Instructions:", specialInstructions || 'None');
      console.log("Pricing:", {
        subtotal: `$${subtotal.toFixed(2)}`,
        tax: `$${tax.toFixed(2)}`,
        tip: `$${tip.toFixed(2)}`,
        total: `$${finalTotal.toFixed(2)}`
      });
      console.log("Payment ID:", paymentTransactionId);
      console.log("User ID:", user?.uid || 'Guest order');
      console.log("=== END ORDER DATA ===");

      const finalOrderData = {
        ...orderData,
        userId: user?.uid || null,
        status: "confirmed",
        paymentId: paymentTransactionId,
        estimatedTime: 10,
      };

      const response = await apiRequest("POST", "/api/orders", finalOrderData);
      const savedOrder = await response.json();

      console.log("=== ORDER SUCCESS ===");
      console.log("Order ID:", savedOrder.id);
      console.log("Status: CONFIRMED");
      console.log("Database: Backend Storage");
      console.log("Full Order:", savedOrder);
      console.log("=====================");

      toast({
        title: "Order Placed Successfully!",
        description: `Your order has been confirmed. Order ID: ${savedOrder.id}`,
        variant: "success",
      });

      onOrderComplete(savedOrder.id.toString());
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
      <Card className="shadow-lg border-0" style={{ background: 'var(--pizza-surface)' }}>
        <CardHeader className="text-white" style={{ background: 'var(--pizza-gradient)' }}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Checkout</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-orange-100">
              <Clock className="h-4 w-4" />
              <span>Est. 7-10 mins</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                currentStep >= 1 ? "text-white shadow-lg" : "bg-gray-300 text-gray-600"
              }`} style={currentStep >= 1 ? { background: 'var(--pizza-primary)' } : {}}>
                {currentStep > 1 ? <CheckCircle className="h-4 w-4" /> : "1"}
              </div>
              <span className={`ml-2 text-sm font-medium ${currentStep >= 1 ? "" : "text-gray-600"}`} style={currentStep >= 1 ? { color: 'var(--pizza-text)' } : {}}>
                Customer Info
              </span>
            </div>
            <div className={`flex-1 h-px transition-all duration-200 ${currentStep > 1 ? "" : "bg-gray-300"}`} style={currentStep > 1 ? { background: 'var(--pizza-primary)' } : {}}></div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                currentStep >= 2 ? "text-white shadow-lg" : "bg-gray-300 text-gray-600"
              }`} style={currentStep >= 2 ? { background: 'var(--pizza-primary)' } : {}}>
                {currentStep > 2 ? <CheckCircle className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
              </div>
              <span className={`ml-2 text-sm font-medium ${currentStep >= 2 ? "" : "text-gray-600"}`} style={currentStep >= 2 ? { color: 'var(--pizza-text)' } : {}}>
                Payment
              </span>
            </div>
            <div className={`flex-1 h-px transition-all duration-200 ${currentStep > 2 ? "" : "bg-gray-300"}`} style={currentStep > 2 ? { background: 'var(--pizza-success)' } : {}}></div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                currentStep >= 3 ? "text-white shadow-lg" : "bg-gray-300 text-gray-600"
              }`} style={currentStep >= 3 ? { background: 'var(--pizza-success)' } : {}}>
                {currentStep >= 3 ? <CheckCircle className="h-4 w-4" /> : "3"}
              </div>
              <span className={`ml-2 text-sm font-medium ${currentStep >= 3 ? "" : "text-gray-600"}`} style={currentStep >= 3 ? { color: 'var(--pizza-success)' } : {}}>
                Confirmation
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Customer Information */}
      {currentStep === 1 && (
        <form onSubmit={handleCustomerInfoSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={customerInfo.firstName}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={customerInfo.lastName}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(361) 555-0123"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

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

          <Card>
            <CardHeader>
              <CardTitle>Special Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any special requests for your order..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Tip Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Add a Tip (Optional)</CardTitle>
              <p className="text-sm text-gray-600">Show your appreciation for great service</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {tipOptions.map((option) => (
                  <Button
                    key={option.label}
                    type="button"
                    variant={tip === option.value ? "default" : "outline"}
                    onClick={() => handleTipSelection(option.value)}
                    className={`${tip === option.value ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  >
                    {option.label}
                    {option.value > 0 && (
                      <div className="text-xs mt-1">${option.value.toFixed(2)}</div>
                    )}
                  </Button>
                ))}
              </div>
              
              {(tip === 0 && customTip !== "") || tipOptions.find(o => o.label === "Custom" && tip === 0) ? (
                <div className="mt-4">
                  <Label htmlFor="customTip">Custom Tip Amount</Label>
                  <div className="flex items-center mt-1">
                    <span className="text-lg mr-2">$</span>
                    <Input
                      id="customTip"
                      type="number"
                      step="0.01"
                      min="0"
                      value={customTip}
                      onChange={(e) => handleCustomTipChange(e.target.value)}
                      placeholder="0.00"
                      className="w-24"
                    />
                  </div>
                </div>
              ) : null}
              
              {tip > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm font-medium">
                    Thank you! Tip amount: ${tip.toFixed(2)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3">
            Continue to Payment
          </Button>
        </form>
      )}

      {/* Step 2: Payment */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Payment</h3>
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              Back to Info
            </Button>
          </div>
          <PaymentForm
            total={finalTotal}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        </div>
      )}

      {/* Step 3: Confirmation */}
      {currentStep === 3 && (
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-lg font-semibold">Processing your order...</p>
                <p className="text-neutral-secondary">Please wait while we confirm your payment</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-600 mb-2">Order Confirmed!</h3>
                <p className="text-neutral-secondary mb-4">
                  Your payment has been processed and your order is being prepared.
                </p>
                {paymentId && (
                  <p className="text-xs text-neutral-secondary">
                    Payment ID: {paymentId}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}