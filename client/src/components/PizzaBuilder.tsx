import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { CartItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface PizzaBuilderProps {
  onAddToCart: (item: CartItem) => void;
}

export default function PizzaBuilder({ onAddToCart }: PizzaBuilderProps) {
  const [selectedSize, setSelectedSize] = useState<"Small" | "Medium" | "Large">("Medium");
  const [selectedCrust, setSelectedCrust] = useState<"Original" | "Thin">("Original");
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [halfAndHalf, setHalfAndHalf] = useState(false);
  const [leftToppings, setLeftToppings] = useState<string[]>([]);
  const [rightToppings, setRightToppings] = useState<string[]>([]);
  const [doubleSpice, setDoubleSpice] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  const basePrices = {
    Small: 9.99,
    Medium: 12.99,
    Large: 15.99,
  };

  const meatToppings = [
    "Pepperoni", "Italian Sausage", "Bacon", "Ham", "Ground Beef", "Chicken"
  ];

  const veggieToppings = [
    "Bell Peppers", "Mushrooms", "Red Onions", "Black Olives", "Green Olives", 
    "Tomatoes", "Jalapeños", "Pineapple", "Spinach", "Banana Peppers"
  ];

  const extraMeatPrice = 1.50;
  const extraVeggiePrice = 1.00;
  const doubleSpicePrice = 2.19;
  const taxRate = 0.0825;

  const calculatePrice = () => {
    let basePrice = basePrices[selectedSize];
    let toppingsPrice = 0;

    if (halfAndHalf) {
      const leftMeatCount = leftToppings.filter(t => meatToppings.includes(t)).length;
      const leftVeggieCount = leftToppings.filter(t => veggieToppings.includes(t)).length;
      const rightMeatCount = rightToppings.filter(t => meatToppings.includes(t)).length;
      const rightVeggieCount = rightToppings.filter(t => veggieToppings.includes(t)).length;
      
      toppingsPrice += (leftMeatCount + rightMeatCount) * extraMeatPrice;
      toppingsPrice += (leftVeggieCount + rightVeggieCount) * extraVeggiePrice;
    } else {
      const meatCount = selectedToppings.filter(t => meatToppings.includes(t)).length;
      const veggieCount = selectedToppings.filter(t => veggieToppings.includes(t)).length;
      
      toppingsPrice += meatCount * extraMeatPrice;
      toppingsPrice += veggieCount * extraVeggiePrice;
    }

    if (doubleSpice) {
      toppingsPrice += doubleSpicePrice;
    }

    const subtotal = basePrice + toppingsPrice;
    const tax = subtotal * taxRate;
    
    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  };

  const toggleTopping = (topping: string, side?: 'left' | 'right') => {
    if (halfAndHalf) {
      if (side === 'left') {
        setLeftToppings(prev => 
          prev.includes(topping) 
            ? prev.filter(t => t !== topping)
            : prev.length < 10 ? [...prev, topping] : prev
        );
      } else if (side === 'right') {
        setRightToppings(prev => 
          prev.includes(topping)
            ? prev.filter(t => t !== topping)
            : prev.length < 10 ? [...prev, topping] : prev
        );
      }
    } else {
      setSelectedToppings(prev => 
        prev.includes(topping)
          ? prev.filter(t => t !== topping)
          : prev.length < 10 ? [...prev, topping] : prev
      );
    }
  };

  const handleAddToCart = () => {
    const toppings = halfAndHalf 
      ? [...new Set([...leftToppings, ...rightToppings])]
      : selectedToppings;

    const cartItem: CartItem = {
      id: `pizza-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `Custom ${selectedSize} Pizza`,
      size: selectedSize,
      crust: selectedCrust,
      toppings: halfAndHalf 
        ? [`Left: ${leftToppings.join(', ') || 'None'}`, `Right: ${rightToppings.join(', ') || 'None'}`]
        : toppings,
      price: calculatePrice().total,
      quantity,
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
    };

    onAddToCart(cartItem);
    
    toast({
      title: "Pizza Added to Cart!",
      description: `${quantity}x Custom ${selectedSize} Pizza added successfully`,
      variant: "success",
    });

    // Reset form
    setSelectedToppings([]);
    setLeftToppings([]);
    setRightToppings([]);
    setQuantity(1);
    setDoubleSpice(false);
    setHalfAndHalf(false);
  };

  const { subtotal, tax, total } = calculatePrice();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Build Your Perfect Pizza</CardTitle>
          <p className="text-center text-neutral-secondary">
            Customize every detail to create your ideal pizza
          </p>
        </CardHeader>
      </Card>

      {/* Size Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Size</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {(["Small", "Medium", "Large"] as const).map((size) => (
              <Button
                key={size}
                variant={selectedSize === size ? "default" : "outline"}
                className={`h-20 flex flex-col ${
                  selectedSize === size ? "bg-red-600 hover:bg-red-700" : ""
                }`}
                onClick={() => setSelectedSize(size)}
              >
                <span className="font-semibold">{size}</span>
                <span className="text-sm">${basePrices[size].toFixed(2)}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Crust Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Crust</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {(["Original", "Thin"] as const).map((crust) => (
              <Button
                key={crust}
                variant={selectedCrust === crust ? "default" : "outline"}
                className={`h-16 ${
                  selectedCrust === crust ? "bg-red-600 hover:bg-red-700" : ""
                }`}
                onClick={() => setSelectedCrust(crust)}
              >
                {crust} Crust
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Half and Half Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="half-and-half" className="text-base font-medium">
                Half and Half Pizza
              </Label>
              <p className="text-sm text-neutral-secondary">
                Different toppings on each half
              </p>
            </div>
            <Switch
              id="half-and-half"
              checked={halfAndHalf}
              onCheckedChange={setHalfAndHalf}
            />
          </div>
        </CardContent>
      </Card>

      {/* Toppings Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Your Toppings</CardTitle>
          <p className="text-sm text-neutral-secondary">
            Choose up to 10 toppings {halfAndHalf ? "per half" : ""}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Meat Toppings */}
          <div>
            <h4 className="font-semibold mb-3 text-red-600">🥩 Meat Toppings (+$1.50 each)</h4>
            {halfAndHalf ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium mb-2">Left Half</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {meatToppings.map((topping) => (
                      <Button
                        key={`left-${topping}`}
                        variant={leftToppings.includes(topping) ? "default" : "outline"}
                        size="sm"
                        className={`text-xs ${
                          leftToppings.includes(topping) ? "bg-red-600 hover:bg-red-700" : ""
                        }`}
                        onClick={() => toggleTopping(topping, 'left')}
                        disabled={!leftToppings.includes(topping) && leftToppings.length >= 10}
                      >
                        {topping}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Right Half</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {meatToppings.map((topping) => (
                      <Button
                        key={`right-${topping}`}
                        variant={rightToppings.includes(topping) ? "default" : "outline"}
                        size="sm"
                        className={`text-xs ${
                          rightToppings.includes(topping) ? "bg-red-600 hover:bg-red-700" : ""
                        }`}
                        onClick={() => toggleTopping(topping, 'right')}
                        disabled={!rightToppings.includes(topping) && rightToppings.length >= 10}
                      >
                        {topping}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {meatToppings.map((topping) => (
                  <Button
                    key={topping}
                    variant={selectedToppings.includes(topping) ? "default" : "outline"}
                    size="sm"
                    className={`text-xs ${
                      selectedToppings.includes(topping) ? "bg-red-600 hover:bg-red-700" : ""
                    }`}
                    onClick={() => toggleTopping(topping)}
                    disabled={!selectedToppings.includes(topping) && selectedToppings.length >= 10}
                  >
                    {topping}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Veggie Toppings */}
          <div>
            <h4 className="font-semibold mb-3 text-green-600">🥬 Veggie Toppings (+$1.00 each)</h4>
            {halfAndHalf ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium mb-2">Left Half</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {veggieToppings.map((topping) => (
                      <Button
                        key={`left-${topping}`}
                        variant={leftToppings.includes(topping) ? "default" : "outline"}
                        size="sm"
                        className={`text-xs ${
                          leftToppings.includes(topping) ? "bg-green-600 hover:bg-green-700" : ""
                        }`}
                        onClick={() => toggleTopping(topping, 'left')}
                        disabled={!leftToppings.includes(topping) && leftToppings.length >= 10}
                      >
                        {topping}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Right Half</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {veggieToppings.map((topping) => (
                      <Button
                        key={`right-${topping}`}
                        variant={rightToppings.includes(topping) ? "default" : "outline"}
                        size="sm"
                        className={`text-xs ${
                          rightToppings.includes(topping) ? "bg-green-600 hover:bg-green-700" : ""
                        }`}
                        onClick={() => toggleTopping(topping, 'right')}
                        disabled={!rightToppings.includes(topping) && rightToppings.length >= 10}
                      >
                        {topping}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {veggieToppings.map((topping) => (
                  <Button
                    key={topping}
                    variant={selectedToppings.includes(topping) ? "default" : "outline"}
                    size="sm"
                    className={`text-xs ${
                      selectedToppings.includes(topping) ? "bg-green-600 hover:bg-green-700" : ""
                    }`}
                    onClick={() => toggleTopping(topping)}
                    disabled={!selectedToppings.includes(topping) && selectedToppings.length >= 10}
                  >
                    {topping}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Double Spice */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="double-spice" className="text-base font-medium">
                Double Spice
              </Label>
              <p className="text-sm text-neutral-secondary">
                Extra seasoning and spices (+$2.19)
              </p>
            </div>
            <Switch
              id="double-spice"
              checked={doubleSpice}
              onCheckedChange={setDoubleSpice}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quantity and Add to Cart */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Quantity Selector */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${(subtotal * quantity).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (8.25%)</span>
              <span>${(tax * quantity).toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-red-600">${(total * quantity).toFixed(2)}</span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            className="w-full bg-red-600 hover:bg-red-700 py-4 text-lg font-semibold"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart - ${(total * quantity).toFixed(2)}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}