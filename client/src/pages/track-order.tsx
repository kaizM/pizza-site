import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrderTracking from "@/components/OrderTracking";
import { Search } from "lucide-react";

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
    <div className="min-h-screen bg-neutral-bg py-16">
      <div className="max-w-md mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-neutral-text">
              Track Your Order
            </CardTitle>
            <p className="text-neutral-secondary">
              Enter your order ID to see the status
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrackOrder} className="space-y-4">
              <div>
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter your order ID"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
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
