import { useState, useEffect } from "react";
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
import { orderStorage } from "@/lib/orderStorage";
import { useLocation } from "wouter";
import { FormPersistence } from "@/lib/formPersistence";

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
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [phoneVerificationCode, setPhoneVerificationCode] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [cashEligible, setCashEligible] = useState(false);
  const [trustScore, setTrustScore] = useState(0);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Load saved customer info on component mount
  useEffect(() => {
    const savedData = FormPersistence.getFormData('checkout-customer-info');
    if (savedData.firstName || savedData.lastName || savedData.phone || savedData.email) {
      setCustomerInfo({
        firstName: savedData.firstName || "",
        lastName: savedData.lastName || "",
        phone: savedData.phone || "",
        email: savedData.email || "",
      });
    }
    if (savedData.specialInstructions) {
      setSpecialInstructions(savedData.specialInstructions);
    }
  }, []);

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

  const checkCashEligibility = async (phone: string) => {
    if (!phone || phone.length < 10) return;
    
    setCheckingEligibility(true);
    try {
      const response = await apiRequest("POST", "/api/check-cash-eligibility", { phone });
      const data = await response.json();
      setCashEligible(data.eligible);
      setTrustScore(data.trustScore);
    } catch (error) {
      console.error("Error checking cash eligibility:", error);
      setCashEligible(false);
      setTrustScore(0);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const validateName = (name: string) => {
    // Check if name contains only letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    return nameRegex.test(name) && name.trim().length >= 2;
  };

  // Auto-save customer info when it changes
  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
    const updatedInfo = { ...customerInfo, [field]: value };
    setCustomerInfo(updatedInfo);
    
    // Save to localStorage automatically
    FormPersistence.saveFormData('checkout-customer-info', {
      ...updatedInfo,
      specialInstructions
    });
  };

  // Auto-save special instructions
  const handleSpecialInstructionsChange = (value: string) => {
    setSpecialInstructions(value);
    FormPersistence.saveFormData('checkout-customer-info', {
      ...customerInfo,
      specialInstructions: value
    });
  };

  const handleCustomerInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.phone) {
      toast({
        title: "Required Information Missing",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate names
    if (!validateName(customerInfo.firstName)) {
      toast({
        title: "Invalid First Name",
        description: "Please enter a valid first name (letters only, minimum 2 characters).",
        variant: "destructive",
      });
      return;
    }

    if (!validateName(customerInfo.lastName)) {
      toast({
        title: "Invalid Last Name",
        description: "Please enter a valid last name (letters only, minimum 2 characters).",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number format
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = customerInfo.phone.replace(/[\s\-\(\)]/g, '');
    if (!phoneRegex.test(cleanPhone) || cleanPhone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number (10+ digits).",
        variant: "destructive",
      });
      return;
    }

    // Check cash payment eligibility
    checkCashEligibility(cleanPhone);
    
    setCurrentStep(2);
  };

  const sendPhoneVerification = async () => {
    if (!customerInfo.phone) return;
    
    setLoading(true);
    try {
      // Generate a simple 4-digit code (in production, use SMS service)
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Store verification code temporarily (in production, store server-side)
      sessionStorage.setItem(`verification_${customerInfo.phone}`, code);
      
      toast({
        title: "Verification Code Sent",
        description: `Code: ${code} (This is a demo - in production this would be sent via SMS)`,
        variant: "default",
      });
      
      setVerificationSent(true);
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Unable to send verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyPhone = () => {
    const storedCode = sessionStorage.getItem(`verification_${customerInfo.phone}`);
    if (phoneVerificationCode === storedCode) {
      setPhoneVerified(true);
      sessionStorage.removeItem(`verification_${customerInfo.phone}`);
      toast({
        title: "Phone Verified",
        description: "Your phone number has been verified successfully.",
        variant: "default",
      });
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter the correct verification code.",
        variant: "destructive",
      });
    }
  };

  const handleCashPayment = () => {
    if (!phoneVerified) {
      toast({
        title: "Phone Verification Required",
        description: "Please verify your phone number before placing a cash order.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentStep(3);
    submitOrder("CASH_PAYMENT");
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

  const handleQuickPayment = async (method: "card" | "cash") => {
    // Check required fields
    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setPaymentMethod(method);
    
    if (method === 'cash') {
      // Check cash payment eligibility
      if (!cashEligible) {
        toast({
          title: "Cash Payment Not Available",
          description: "Please use card payment or contact us",
          variant: "destructive",
        });
        return;
      }
      
      // Process cash payment immediately
      setCurrentStep(3);
      submitOrder("CASH_PAYMENT");
    } else {
      // Go to card payment step
      setCurrentStep(2);
    }
  };

  const submitOrder = async (paymentTransactionId: string) => {
    setLoading(true);

    try {
      // Generate unique order ID
      const uniqueOrderId = orderStorage.generateOrderId();
      
      const orderData: OrderData = {
        customerInfo,
        items: cartItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        tip: parseFloat(tip.toFixed(2)),
        total: parseFloat(finalTotal.toFixed(2)),
        orderType,
        specialInstructions,
        paymentStatus: paymentTransactionId === "CASH_PAYMENT" ? "cash_pending" : "authorized", // Payment held until order confirmed
      };

      // Log complete order details for testing
      console.log("=== ORDER SUBMISSION DATA ===");
      console.log("Unique Order ID:", uniqueOrderId);
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
        uniqueOrderId: uniqueOrderId, // Add unique order ID to database
      };

      const response = await apiRequest("POST", "/api/orders", finalOrderData);
      const savedOrder = await response.json();

      // Save order tracking info to localStorage
      const orderTrackingInfo = {
        orderId: uniqueOrderId,
        orderNumber: savedOrder.id,
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        timestamp: new Date().toISOString(),
        status: "confirmed"
      };
      
      orderStorage.saveOrderInfo(orderTrackingInfo);

      console.log("=== ORDER SUCCESS ===");
      console.log("Order ID:", savedOrder.id);
      console.log("Unique ID:", uniqueOrderId);
      console.log("Status: CONFIRMED");
      console.log("Database: Backend Storage");
      console.log("Full Order:", savedOrder);
      console.log("=====================");

      toast({
        title: "Order Placed Successfully!",
        description: `Your order has been confirmed. Order ID: ${uniqueOrderId}`,
        variant: "success",
      });

      // Automatically redirect to order tracking page with the unique ID
      setTimeout(() => {
        setLocation(`/order-tracking?id=${uniqueOrderId}`);
      }, 2000); // 2 second delay to show success message

      onOrderComplete(uniqueOrderId);
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
        <form id="checkout-form" onSubmit={handleCustomerInfoSubmit} className="space-y-6">
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
                    onChange={(e) => handleCustomerInfoChange('firstName', e.target.value)}
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
                    onChange={(e) => handleCustomerInfoChange('lastName', e.target.value)}
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

          {/* Payment Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <p className="text-sm text-gray-600">Choose how you'd like to pay</p>
              {checkingEligibility && (
                <div className="text-sm text-blue-600">Checking customer eligibility...</div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`grid gap-4 ${cashEligible ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <Button
                  type="button"
                  variant={paymentMethod === "card" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("card")}
                  className={`h-16 ${paymentMethod === "card" ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Credit Card
                </Button>
                {cashEligible && (
                  <Button
                    type="button"
                    variant={paymentMethod === "cash" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("cash")}
                    className={`h-16 ${paymentMethod === "cash" ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  >
                    💵 Cash at Pickup
                  </Button>
                )}
              </div>

              {/* Customer Trust Score Display */}
              {trustScore > 0 && (
                <div className={`p-4 rounded-lg border ${cashEligible ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Customer Trust Score</span>
                    <span className={`font-bold ${cashEligible ? 'text-green-700' : 'text-orange-700'}`}>
                      {trustScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${cashEligible ? 'bg-green-600' : 'bg-orange-500'}`}
                      style={{ width: `${trustScore}%` }}
                    ></div>
                  </div>
                  <p className={`text-xs mt-2 ${cashEligible ? 'text-green-700' : 'text-orange-700'}`}>
                    {cashEligible 
                      ? "You're eligible for cash payment as a trusted customer!"
                      : "Complete a few more orders with card payment to unlock cash payment option."
                    }
                  </p>
                </div>
              )}

              {paymentMethod === "cash" && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Cash Payment Requirements</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Phone verification required to prevent spam orders</li>
                    <li>• Payment due at pickup - exact change appreciated</li>
                    <li>• Order will be cancelled if not picked up within 30 minutes</li>
                  </ul>
                  
                  {!phoneVerified && (
                    <div className="mt-4 space-y-3">
                      {!verificationSent ? (
                        <Button
                          onClick={sendPhoneVerification}
                          disabled={loading || !customerInfo.phone}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {loading ? "Sending..." : "Send Verification Code"}
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="verificationCode">Enter 4-digit code</Label>
                          <div className="flex gap-2">
                            <Input
                              id="verificationCode"
                              value={phoneVerificationCode}
                              onChange={(e) => setPhoneVerificationCode(e.target.value)}
                              placeholder="1234"
                              maxLength={4}
                              className="flex-1"
                            />
                            <Button
                              onClick={verifyPhone}
                              disabled={phoneVerificationCode.length !== 4}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Verify
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {phoneVerified && (
                    <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded">
                      <div className="flex items-center text-green-800">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Phone verified - ready for cash payment
                      </div>
                    </div>
                  )}
                </div>
              )}
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

          {/* Quick Payment Options */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                type="button" 
                onClick={() => handleQuickPayment('card')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 flex items-center justify-center gap-2"
              >
                💳 Quick Pay with Card
              </Button>
              
              {cashEligible && (
                <Button 
                  type="button" 
                  onClick={() => handleQuickPayment('cash')}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 flex items-center justify-center gap-2"
                >
                  💵 Quick Pay Cash
                </Button>
              )}
            </div>
            
            <div className="text-center text-sm text-gray-500">
              or
            </div>
            
            <Button type="submit" variant="outline" className="w-full py-3">
              Continue to Payment Options
            </Button>
          </div>
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
          
          {paymentMethod === "card" ? (
            <PaymentForm
              total={finalTotal}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  💵 Cash Payment at Pickup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8.25%):</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    {tip > 0 && (
                      <div className="flex justify-between">
                        <span>Tip:</span>
                        <span>${tip.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total Due at Pickup:</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Important Reminders</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Bring exact change or cash for ${finalTotal.toFixed(2)}</li>
                    <li>• Order must be picked up within 30 minutes</li>
                    <li>• We'll call you when your order is ready</li>
                    <li>• Orders not picked up on time will be cancelled</li>
                  </ul>
                </div>

                <Button
                  onClick={handleCashPayment}
                  disabled={!phoneVerified}
                  className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-semibold"
                >
                  {phoneVerified ? "Place Cash Order" : "Phone Verification Required"}
                </Button>
              </CardContent>
            </Card>
          )}
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
                {paymentId === "CASH_PAYMENT" ? (
                  <div className="space-y-3">
                    <p className="text-neutral-secondary mb-4">
                      Your order is confirmed and being prepared. Payment due at pickup: <strong>${finalTotal.toFixed(2)}</strong>
                    </p>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg max-w-md mx-auto">
                      <h4 className="font-medium text-blue-800 mb-2">Pickup Instructions</h4>
                      <ul className="text-sm text-blue-700 space-y-1 text-left">
                        <li>• We'll call you when your order is ready</li>
                        <li>• Bring ${finalTotal.toFixed(2)} in cash</li>
                        <li>• Pickup within 30 minutes to avoid cancellation</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-neutral-secondary mb-4">
                    Your payment has been processed and your order is being prepared.
                  </p>
                )}
                {paymentId && paymentId !== "CASH_PAYMENT" && (
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