import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Lock, Calendar, User } from "lucide-react";

interface PaymentFormProps {
  total: number;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
}

export default function PaymentForm({ total, onPaymentSuccess, onPaymentError }: PaymentFormProps) {
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
    billingZip: "",
  });
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, "").length <= 16) {
      setPaymentData(prev => ({ ...prev, cardNumber: formatted }));
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length <= 4) {
      setPaymentData(prev => ({ ...prev, cvv: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Validate form data
      const cardNumberClean = paymentData.cardNumber.replace(/\s/g, "");
      if (cardNumberClean.length < 13 || cardNumberClean.length > 19) {
        throw new Error("Please enter a valid card number");
      }
      if (!paymentData.expiryMonth || !paymentData.expiryYear) {
        throw new Error("Please enter expiry date");
      }
      if (paymentData.cvv.length < 3) {
        throw new Error("Please enter a valid CVV");
      }
      if (!paymentData.cardholderName.trim()) {
        throw new Error("Please enter cardholder name");
      }
      if (!paymentData.billingZip.trim()) {
        throw new Error("Please enter billing ZIP code");
      }

      // Simulate payment processing (replace with actual payment gateway integration)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, simulate success
      const paymentId = `pay_${Date.now()}`;
      
      toast({
        title: "Payment Successful",
        description: `Payment of $${total.toFixed(2)} processed successfully`,
        variant: "success",
      });

      onPaymentSuccess(paymentId);
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Payment could not be processed",
        variant: "destructive",
      });
      onPaymentError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const months = [
    { value: "01", label: "01 - January" },
    { value: "02", label: "02 - February" },
    { value: "03", label: "03 - March" },
    { value: "04", label: "04 - April" },
    { value: "05", label: "05 - May" },
    { value: "06", label: "06 - June" },
    { value: "07", label: "07 - July" },
    { value: "08", label: "08 - August" },
    { value: "09", label: "09 - September" },
    { value: "10", label: "10 - October" },
    { value: "11", label: "11 - November" },
    { value: "12", label: "12 - December" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={paymentData.cardNumber}
              onChange={handleCardNumberChange}
              required
              disabled={processing}
            />
          </div>

          {/* Expiry Date and CVV */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="expiryMonth">
                <Calendar className="inline mr-1 h-4 w-4" />
                Month
              </Label>
              <Select
                value={paymentData.expiryMonth}
                onValueChange={(value) => setPaymentData(prev => ({ ...prev, expiryMonth: value }))}
                disabled={processing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryYear">Year</Label>
              <Select
                value={paymentData.expiryYear}
                onValueChange={(value) => setPaymentData(prev => ({ ...prev, expiryYear: value }))}
                disabled={processing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="YYYY" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                value={paymentData.cvv}
                onChange={handleCvvChange}
                required
                disabled={processing}
              />
            </div>
          </div>

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="cardholderName">
              <User className="inline mr-1 h-4 w-4" />
              Cardholder Name
            </Label>
            <Input
              id="cardholderName"
              type="text"
              placeholder="John Doe"
              value={paymentData.cardholderName}
              onChange={(e) => setPaymentData(prev => ({ ...prev, cardholderName: e.target.value }))}
              required
              disabled={processing}
            />
          </div>

          {/* Billing ZIP */}
          <div className="space-y-2">
            <Label htmlFor="billingZip">Billing ZIP Code</Label>
            <Input
              id="billingZip"
              type="text"
              placeholder="12345"
              value={paymentData.billingZip}
              onChange={(e) => setPaymentData(prev => ({ ...prev, billingZip: e.target.value }))}
              required
              disabled={processing}
            />
          </div>

          {/* Payment Button */}
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
            disabled={processing}
          >
            {processing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Lock className="mr-2 h-4 w-4" />
                Pay ${total.toFixed(2)}
              </div>
            )}
          </Button>

          {/* Security Notice */}
          <div className="text-xs text-center text-neutral-secondary mt-4">
            <Lock className="inline mr-1 h-3 w-3" />
            Your payment information is encrypted and secure
          </div>
        </form>
      </CardContent>
    </Card>
  );
}