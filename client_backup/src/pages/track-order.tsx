import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrderTracking from "@/components/OrderTracking";
import { Search, Home } from "lucide-react";
import { Link } from "wouter";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      setTrackingOrderId(orderId.trim());
    }
  };

  if (trackingOrderId) {
    return (
      <div className="min-h-screen bg-neutral-bg py-8">
        <OrderTracking orderId={trackingOrderId} />
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => {
              setTrackingOrderId(null);
              setOrderId("");
            }}
          >
            Track Another Order
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16" style={{ background: 'var(--pizza-surface)' }}>
      <div className="max-w-md mx-auto px-4">
        {/* Navigation Header */}
        <div className="mb-6 flex justify-center">
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
        </div>

        <Card className="shadow-lg border-0" style={{ background: 'var(--pizza-surface)' }}>
          <CardHeader className="text-center text-white" style={{ background: 'var(--pizza-gradient)' }}>
            <CardTitle className="text-2xl font-bold">
              Track Your Order
            </CardTitle>
            <p className="text-orange-100">
              Enter your order ID to see the status
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrackOrder} className="space-y-4">
              <div>
                <Label htmlFor="orderId" style={{ color: 'var(--pizza-text)' }}>Order ID</Label>
                <Input
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter your order ID"
                  required
                  className="border-red-200 focus:border-red-400 focus:ring-red-200"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full text-white font-semibold py-3 shadow-lg transition-all duration-200"
                style={{ 
                  background: 'var(--pizza-primary)',
                  borderColor: 'var(--pizza-primary)'
                }}
              >
                <Search className="mr-2 h-4 w-4" />
                Track Order
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
