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
  // Only Medium size per requirements
  const selectedSize = "Medium";
  const [selectedCrust, setSelectedCrust] = useState<"Original Crust" | "Thin Crust">("Original Crust");
  
  // Up to 10 free toppings
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [extraToppings, setExtraToppings] = useState<string[]>([]);
  
  // Half and half functionality
  const [halfAndHalf, setHalfAndHalf] = useState(false);
  const [leftToppings, setLeftToppings] = useState<string[]>([]);
  const [rightToppings, setRightToppings] = useState<string[]>([]);
  const [leftExtraToppings, setLeftExtraToppings] = useState<string[]>([]);
  const [rightExtraToppings, setRightExtraToppings] = useState<string[]>([]);
  
  // Add-ons
  const [doubleCheese, setDoubleCheese] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  const basePrice = 12.99; // Medium pizza base price
  const extraMeatPrice = 1.50;
  const extraVeggiePrice = 1.00;
  const doubleCheesePrice = 2.19;
  const taxRate = 0.0825;

  const meatToppings = [
    "Pepperoni", "Italian Sausage", "Beef", "Bacon"
  ];

  const veggieToppings = [
    "Bell Peppers", "Onions", "Mushrooms", "Black Olives", "Banana Peppers", "Jalapeños"
  ];

  const calculatePrice = () => {
    let totalPrice = basePrice;
    let toppingsPrice = 0;

    if (halfAndHalf) {
      // Calculate extra toppings for half and half
      const leftExtraMeat = leftExtraToppings.filter(t => meatToppings.includes(t)).length;
      const leftExtraVeggie = leftExtraToppings.filter(t => veggieToppings.includes(t)).length;
      const rightExtraMeat = rightExtraToppings.filter(t => meatToppings.includes(t)).length;
      const rightExtraVeggie = rightExtraToppings.filter(t => veggieToppings.includes(t)).length;
      
      toppingsPrice = (leftExtraMeat + rightExtraMeat) * extraMeatPrice + 
                     (leftExtraVeggie + rightExtraVeggie) * extraVeggiePrice;
    } else {
      // Calculate extra toppings for regular pizza
      const extraMeat = extraToppings.filter(t => meatToppings.includes(t)).length;
      const extraVeggie = extraToppings.filter(t => veggieToppings.includes(t)).length;
      
      toppingsPrice = extraMeat * extraMeatPrice + extraVeggie * extraVeggiePrice;
    }

    if (doubleCheese) {
      toppingsPrice += doubleCheesePrice;
    }

    const subtotal = (totalPrice + toppingsPrice) * quantity;
    const tax = subtotal * taxRate;
    
    return {
      subtotal: subtotal,
      tax: tax,
      total: subtotal + tax
    };
  };

  const toggleTopping = (topping: string, isExtra: boolean = false) => {
    if (halfAndHalf) return; // Handle separately for half and half
    
    if (isExtra) {
      setExtraToppings(prev => 
        prev.includes(topping) 
          ? prev.filter(t => t !== topping)
          : [...prev, topping]
      );
    } else {
      const totalToppings = selectedToppings.length;
      if (!selectedToppings.includes(topping) && totalToppings >= 10) {
        toast({
          title: "Maximum toppings reached",
          description: "You can select up to 10 free toppings",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedToppings(prev => 
        prev.includes(topping) 
          ? prev.filter(t => t !== topping)
          : [...prev, topping]
      );
    }
  };

  const toggleHalfTopping = (topping: string, side: "left" | "right", isExtra: boolean = false) => {
    const currentToppings = side === "left" ? leftToppings : rightToppings;
    const setToppings = side === "left" ? setLeftToppings : setRightToppings;
    const currentExtraToppings = side === "left" ? leftExtraToppings : rightExtraToppings;
    const setExtraToppings = side === "left" ? setLeftExtraToppings : setRightExtraToppings;
    
    if (isExtra) {
      setExtraToppings(prev => 
        prev.includes(topping) 
          ? prev.filter(t => t !== topping)
          : [...prev, topping]
      );
    } else {
      if (!currentToppings.includes(topping) && currentToppings.length >= 10) {
        toast({
          title: "Maximum toppings reached",
          description: "You can select up to 10 free toppings per side",
          variant: "destructive"
        });
        return;
      }
      
      setToppings(prev => 
        prev.includes(topping) 
          ? prev.filter(t => t !== topping)
          : [...prev, topping]
      );
    }
  };

  const addToCart = () => {
    const pricing = calculatePrice();
    const allToppings = halfAndHalf 
      ? [...leftToppings, ...rightToppings, ...leftExtraToppings, ...rightExtraToppings]
      : [...selectedToppings, ...extraToppings];
    
    if (doubleCheese) {
      allToppings.push("Double Cheese");
    }

    const cartItem: CartItem = {
      id: `pizza-${Date.now()}`,
      name: `Custom ${selectedSize} Pizza`,
      size: selectedSize,
      crust: selectedCrust,
      toppings: allToppings,
      price: pricing.total,
      quantity: quantity,
      imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
    };

    onAddToCart(cartItem);
    console.log("Added to cart:", cartItem);
    
    toast({
      title: "Added to cart!",
      description: `${quantity}x Custom ${selectedSize} Pizza - $${pricing.total.toFixed(2)}`,
      variant: "success"
    });
  };

  const pricing = calculatePrice();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-neutral-text">Build Your Hunt Brothers Pizza</CardTitle>
          <p className="text-neutral-secondary">Create your perfect medium pizza with up to 10 free toppings</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Size - Fixed to Medium */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Size</h3>
            <div className="p-4 border-2 border-red-500 rounded-lg bg-red-50">
              <div className="flex justify-between items-center">
                <span className="font-medium">Medium (Only size available)</span>
                <Badge variant="secondary">${basePrice.toFixed(2)}</Badge>
              </div>
            </div>
          </div>

          {/* Crust Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Crust</h3>
            <div className="grid grid-cols-2 gap-3">
              {["Original Crust", "Thin Crust"].map((crust) => (
                <button
                  key={crust}
                  onClick={() => setSelectedCrust(crust as "Original Crust" | "Thin Crust")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedCrust === crust
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-red-300"
                  }`}
                >
                  <span className="font-medium">{crust}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Half and Half Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="half-and-half"
              checked={halfAndHalf}
              onCheckedChange={setHalfAndHalf}
            />
            <Label htmlFor="half-and-half" className="font-medium">
              Half and Half (Split toppings left/right)
            </Label>
          </div>

          {/* Toppings */}
          {!halfAndHalf ? (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Toppings ({selectedToppings.length}/10 free selected)
              </h3>
              
              {/* Meat Toppings */}
              <div className="mb-4">
                <h4 className="font-medium mb-2 text-neutral-text">Meat</h4>
                <div className="grid grid-cols-2 gap-2">
                  {meatToppings.map((topping) => (
                    <div key={topping} className="space-y-1">
                      <button
                        onClick={() => toggleTopping(topping, false)}
                        className={`w-full p-3 text-sm border rounded-lg transition-all ${
                          selectedToppings.includes(topping)
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-gray-200 hover:border-red-300"
                        }`}
                      >
                        {topping}
                      </button>
                      <button
                        onClick={() => toggleTopping(topping, true)}
                        className={`w-full p-1 text-xs border rounded transition-all ${
                          extraToppings.includes(topping)
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 hover:border-orange-300"
                        }`}
                      >
                        Extra (+${extraMeatPrice.toFixed(2)})
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Veggie Toppings */}
              <div>
                <h4 className="font-medium mb-2 text-neutral-text">Fresh Toppings</h4>
                <div className="grid grid-cols-2 gap-2">
                  {veggieToppings.map((topping) => (
                    <div key={topping} className="space-y-1">
                      <button
                        onClick={() => toggleTopping(topping, false)}
                        className={`w-full p-3 text-sm border rounded-lg transition-all ${
                          selectedToppings.includes(topping)
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-gray-200 hover:border-red-300"
                        }`}
                      >
                        {topping}
                      </button>
                      <button
                        onClick={() => toggleTopping(topping, true)}
                        className={`w-full p-1 text-xs border rounded transition-all ${
                          extraToppings.includes(topping)
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 hover:border-orange-300"
                        }`}
                      >
                        Extra (+${extraVeggiePrice.toFixed(2)})
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Half and Half Toppings */
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Side */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Left Side ({leftToppings.length}/10 free)
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Meat</h4>
                    <div className="space-y-1">
                      {meatToppings.map((topping) => (
                        <div key={topping} className="flex gap-1">
                          <button
                            onClick={() => toggleHalfTopping(topping, "left", false)}
                            className={`flex-1 p-2 text-xs border rounded ${
                              leftToppings.includes(topping)
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200"
                            }`}
                          >
                            {topping}
                          </button>
                          <button
                            onClick={() => toggleHalfTopping(topping, "left", true)}
                            className={`px-2 text-xs border rounded ${
                              leftExtraToppings.includes(topping)
                                ? "border-orange-500 bg-orange-50"
                                : "border-gray-200"
                            }`}
                          >
                            Extra
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Veggies</h4>
                    <div className="space-y-1">
                      {veggieToppings.map((topping) => (
                        <div key={topping} className="flex gap-1">
                          <button
                            onClick={() => toggleHalfTopping(topping, "left", false)}
                            className={`flex-1 p-2 text-xs border rounded ${
                              leftToppings.includes(topping)
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200"
                            }`}
                          >
                            {topping}
                          </button>
                          <button
                            onClick={() => toggleHalfTopping(topping, "left", true)}
                            className={`px-2 text-xs border rounded ${
                              leftExtraToppings.includes(topping)
                                ? "border-orange-500 bg-orange-50"
                                : "border-gray-200"
                            }`}
                          >
                            Extra
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Right Side ({rightToppings.length}/10 free)
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Meat</h4>
                    <div className="space-y-1">
                      {meatToppings.map((topping) => (
                        <div key={topping} className="flex gap-1">
                          <button
                            onClick={() => toggleHalfTopping(topping, "right", false)}
                            className={`flex-1 p-2 text-xs border rounded ${
                              rightToppings.includes(topping)
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200"
                            }`}
                          >
                            {topping}
                          </button>
                          <button
                            onClick={() => toggleHalfTopping(topping, "right", true)}
                            className={`px-2 text-xs border rounded ${
                              rightExtraToppings.includes(topping)
                                ? "border-orange-500 bg-orange-50"
                                : "border-gray-200"
                            }`}
                          >
                            Extra
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Veggies</h4>
                    <div className="space-y-1">
                      {veggieToppings.map((topping) => (
                        <div key={topping} className="flex gap-1">
                          <button
                            onClick={() => toggleHalfTopping(topping, "right", false)}
                            className={`flex-1 p-2 text-xs border rounded ${
                              rightToppings.includes(topping)
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200"
                            }`}
                          >
                            {topping}
                          </button>
                          <button
                            onClick={() => toggleHalfTopping(topping, "right", true)}
                            className={`px-2 text-xs border rounded ${
                              rightExtraToppings.includes(topping)
                                ? "border-orange-500 bg-orange-50"
                                : "border-gray-200"
                            }`}
                          >
                            Extra
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Double Cheese */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <span className="font-medium">Double Cheese</span>
              <span className="text-sm text-neutral-secondary ml-2">+${doubleCheesePrice.toFixed(2)}</span>
            </div>
            <Switch
              checked={doubleCheese}
              onCheckedChange={setDoubleCheese}
            />
          </div>

          {/* Quantity */}
          <div className="flex items-center space-x-4">
            <span className="font-medium">Quantity:</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Price Summary */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${pricing.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8.25%):</span>
              <span>${pricing.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${pricing.total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={addToCart}
            className="w-full bg-red-700 hover:bg-red-800 text-white py-4 text-lg font-bold shadow-lg"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart - ${pricing.total.toFixed(2)}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}