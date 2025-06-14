import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { CartItem } from "@/shared/schema";

interface PizzaBuilderProps {
  onAddToCart: (item: CartItem) => void;
}

export default function PizzaBuilder({ onAddToCart }: PizzaBuilderProps) {
  const [selectedPizza, setSelectedPizza] = useState("Cheese");
  const [selectedSize, setSelectedSize] = useState("Medium");
  const [selectedCrust, setSelectedCrust] = useState("Hand Tossed");
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [doubleCheeseSelected, setDoubleCheeseSelected] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Hunt Brothers specific pricing
  const basePrices = {
    "Small": 12.99,
    "Medium": 15.99, 
    "Large": 18.99,
    "Extra Large": 21.99
  };

  const meatToppings = [
    "Pepperoni", "Italian Sausage", "Beef", "Bacon"
  ];

  const veggieToppings = [
    "Bell Peppers", "Onions", "Mushrooms", "Black Olives", "Banana Peppers", "Jalapeños"
  ];

  const calculatePrice = () => {
    let basePrice = basePrices[selectedSize as keyof typeof basePrices];
    let toppingsPrice = 0;

    // Add topping prices ($1.50 per topping)
    toppingsPrice += selectedToppings.length * 1.50;
    
    // Add double cheese if selected
    if (doubleCheeseSelected) {
      toppingsPrice += 2.19;
    }

    const subtotal = (basePrice + toppingsPrice) * quantity;
    const tax = subtotal * 0.0825;
    const total = subtotal + tax;

    return {
      basePrice,
      toppingsPrice,
      subtotal,
      tax,
      total
    };
  };

  const toggleTopping = (topping: string) => {
    setSelectedToppings(prev => 
      prev.includes(topping) 
        ? prev.filter(t => t !== topping)
        : [...prev, topping]
    );
  };

  const addToCart = () => {
    const pricing = calculatePrice();
    const allToppings = [...selectedToppings];
    if (doubleCheeseSelected) allToppings.push("Double Cheese");

    const cartItem: CartItem = {
      id: `pizza-${Date.now()}`,
      name: selectedPizza,
      size: selectedSize,
      crust: selectedCrust,
      toppings: allToppings,
      price: pricing.total,
      quantity: quantity,
      imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
    };

    onAddToCart(cartItem);
  };

  const pricing = calculatePrice();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-4xl font-bold text-red-700 mb-2">Build Your Pizza</h1>
          <p className="text-lg text-gray-600">Create your perfect Hunt Brothers pizza</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
        {/* Pizza Visual */}
        <Card className="border-2 border-red-200">
          <CardContent className="p-6">
            <div className="aspect-square bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mb-4 border-4 border-yellow-400">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-700">{selectedPizza}</div>
                <div className="text-lg text-red-600">{selectedSize}</div>
                <div className="text-sm text-gray-600">{selectedCrust}</div>
              </div>
            </div>
            
            {/* Selected Toppings Display */}
            <div className="space-y-2">
              <h3 className="font-semibold text-red-700">Your Toppings:</h3>
              <div className="flex flex-wrap gap-2">
                {doubleCheeseSelected && (
                  <Badge className="bg-yellow-500 text-black">Double Cheese</Badge>
                )}
                {selectedToppings.map((topping) => (
                  <Badge key={topping} className="bg-red-600 text-white">{topping}</Badge>
                ))}
                {selectedToppings.length === 0 && !doubleCheeseSelected && (
                  <span className="text-gray-500">Just cheese</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pizza Builder */}
        <Card className="border-2 border-red-200">
          <CardHeader className="bg-red-700 text-white">
            <CardTitle className="text-xl">Customize Your Pizza</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* Size Selection */}
            <div>
              <h3 className="font-semibold mb-3 text-red-700">Size</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(basePrices).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`p-3 text-sm border-2 rounded-lg font-semibold transition-all ${
                      selectedSize === size
                        ? "border-red-600 bg-red-50 text-red-700"
                        : "border-gray-200 hover:border-red-300"
                    }`}
                  >
                    {size}
                    <div className="text-xs text-gray-500">
                      ${basePrices[size as keyof typeof basePrices].toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Crust Selection */}
            <div>
              <h3 className="font-semibold mb-3 text-red-700">Crust</h3>
              <div className="grid grid-cols-1 gap-2">
                {["Hand Tossed", "Thin Crust", "Thick Crust"].map((crust) => (
                  <button
                    key={crust}
                    onClick={() => setSelectedCrust(crust)}
                    className={`p-3 text-sm border-2 rounded-lg font-semibold transition-all ${
                      selectedCrust === crust
                        ? "border-red-600 bg-red-50 text-red-700"
                        : "border-gray-200 hover:border-red-300"
                    }`}
                  >
                    {crust}
                  </button>
                ))}
              </div>
            </div>

            {/* Double Cheese Option */}
            <div>
              <h3 className="font-semibold mb-3 text-red-700">Cheese</h3>
              <button
                onClick={() => setDoubleCheeseSelected(!doubleCheeseSelected)}
                className={`w-full p-3 text-sm border-2 rounded-lg font-semibold transition-all ${
                  doubleCheeseSelected
                    ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                    : "border-gray-200 hover:border-yellow-300"
                }`}
              >
                Double Cheese (+$2.19)
              </button>
            </div>

            {/* Meat Toppings */}
            <div>
              <h3 className="font-semibold mb-3 text-red-700">Meat</h3>
              <div className="grid grid-cols-2 gap-2">
                {meatToppings.map((topping) => (
                  <button
                    key={topping}
                    onClick={() => toggleTopping(topping)}
                    className={`p-3 text-sm border-2 rounded-lg font-semibold transition-all ${
                      selectedToppings.includes(topping)
                        ? "border-red-600 bg-red-50 text-red-700"
                        : "border-gray-200 hover:border-red-300"
                    }`}
                  >
                    {topping}
                    <div className="text-xs text-gray-500">+$1.50</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fresh Toppings */}
            <div>
              <h3 className="font-semibold mb-3 text-red-700">Fresh Toppings</h3>
              <div className="grid grid-cols-2 gap-2">
                {veggieToppings.map((topping) => (
                  <button
                    key={topping}
                    onClick={() => toggleTopping(topping)}
                    className={`p-3 text-sm border-2 rounded-lg font-semibold transition-all ${
                      selectedToppings.includes(topping)
                        ? "border-green-600 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    {topping}
                    <div className="text-xs text-gray-500">+$1.50</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3 text-red-700">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="border-red-300 hover:border-red-500"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-bold text-red-700 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="border-red-300 hover:border-red-500"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
              <div className="flex justify-between text-sm">
                <span>Base Price ({selectedSize}):</span>
                <span>${pricing.basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Toppings:</span>
                <span>${pricing.toppingsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>${pricing.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-red-700 border-t-2 border-red-300 pt-2">
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
    </div>
  );
}