import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Minus, Plus } from "lucide-react";
import { CartItem } from "@shared/schema";

interface OrderSummaryProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export default function OrderSummary({ cartItems, onUpdateQuantity, onRemoveItem }: OrderSummaryProps) {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.0825; // 8.25% tax
  const deliveryFee = 0; // Will be updated based on order type
  const total = subtotal + tax + deliveryFee;

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cart Items */}
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium text-neutral-text">{item.name}</h4>
                <p className="text-sm text-neutral-secondary">{item.size} • {item.crust}</p>
                {item.toppings.length > 0 && (
                  <p className="text-xs text-neutral-secondary mt-1">
                    {item.toppings.join(", ")}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-neutral-text">
                    ${item.price.toFixed(2)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-6 h-6 p-0 rounded-full"
                      onClick={() => {
                        if (item.quantity > 1) {
                          onUpdateQuantity(item.id, item.quantity - 1);
                        } else {
                          onRemoveItem(item.id);
                        }
                      }}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-6 h-6 p-0 rounded-full"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-secondary">Subtotal</span>
            <span className="text-neutral-text">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-secondary">Tax (8.25%)</span>
            <span className="text-neutral-text">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-secondary">Delivery Fee</span>
            <span className="text-neutral-text">${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between font-semibold text-lg">
              <span className="text-neutral-text">Total</span>
              <span className="text-red-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-center justify-center text-xs text-neutral-secondary">
          <Lock className="mr-1 h-3 w-3" />
          <span>Secure checkout powered by Stripe</span>
        </div>
      </CardContent>
    </Card>
  );
}
