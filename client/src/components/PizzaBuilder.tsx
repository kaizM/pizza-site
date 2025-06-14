import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { CartItem } from "@shared/schema";

interface PizzaBuilderProps {
  onAddToCart: (item: CartItem) => void;
}

export default function PizzaBuilder({ onAddToCart }: PizzaBuilderProps) {
  const [selectedPizza, setSelectedPizza] = useState("Cheese");
  const [selectedCrust, setSelectedCrust] = useState("Original");
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [extraToppings, setExtraToppings] = useState<string[]>([]);
  const [doubleCheeseSelected, setDoubleCheeseSelected] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Hunt Brothers specific pricing
  const firstPizzaPrice = 11.99;
  const additionalPizzaPrice = 10.99;
  const doubleCheesePrice = 2.19;
  const extraMeatPrice = 1.50;
  const extraVeggiePrice = 1.00;
  const taxRate = 0.0825;

  const meatToppings = [
    "Pepperoni", "Italian Sausage", "Beef", "Bacon"
  ];

  const veggieToppings = [
    "Bell Peppers", "Onions", "Mushrooms", "Black Olives", "Banana Peppers", "Jalapeños"
  ];

  const calculatePrice = () => {
    let totalPizzasPrice = 0;
    let toppingsPrice = 0;

    // Calculate pizza pricing: first pizza $11.99, additional pizzas $10.99
    if (quantity === 1) {
      totalPizzasPrice = firstPizzaPrice;
    } else {
      totalPizzasPrice = firstPizzaPrice + (additionalPizzaPrice * (quantity - 1));
    }

    // Calculate extra toppings cost (per pizza)
    extraToppings.forEach(topping => {
      if (meatToppings.includes(topping)) {
        toppingsPrice += extraMeatPrice;
      } else if (veggieToppings.includes(topping)) {
        toppingsPrice += extraVeggiePrice;
      }
    });
    
    // Add double cheese if selected (per pizza)
    if (doubleCheeseSelected) {
      toppingsPrice += doubleCheesePrice;
    }

    // Multiply toppings price by quantity
    const totalToppingsPrice = toppingsPrice * quantity;
    const subtotal = totalPizzasPrice + totalToppingsPrice;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return {
      pizzasPrice: totalPizzasPrice,
      toppingsPrice: totalToppingsPrice,
      subtotal,
      tax,
      total,
      freeToppings: selectedToppings.length,
      extraToppingsCount: extraToppings.length
    };
  };

  const toggleTopping = (topping: string) => {
    setSelectedToppings(prev => {
      const newToppings = prev.includes(topping) 
        ? prev.filter(t => t !== topping)
        : prev.length < 10 
          ? [...prev, topping]
          : prev;
      
      // If removing a regular topping, also remove its extra
      if (!newToppings.includes(topping)) {
        setExtraToppings(prevExtras => prevExtras.filter(t => t !== topping));
      }
      
      return newToppings;
    });
  };

  const toggleExtraTopping = (topping: string) => {
    // Can only add extra if the base topping is selected
    if (!selectedToppings.includes(topping)) return;
    
    setExtraToppings(prev => 
      prev.includes(topping) 
        ? prev.filter(t => t !== topping)
        : [...prev, topping]
    );
  };

  const addToCart = () => {
    const pricing = calculatePrice();
    const allToppings = [...selectedToppings];
    
    // Add extra toppings with "Extra" prefix
    extraToppings.forEach(topping => {
      allToppings.push(`Extra ${topping}`);
    });
    
    if (doubleCheeseSelected) allToppings.push("Double Cheese");

    const cartItem: CartItem = {
      id: `pizza-${Date.now()}`,
      name: selectedPizza,
      size: "Standard",
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
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-4xl font-bold text-red-700 mb-2">Build Your Pizza</h1>
          <p className="text-lg text-gray-600">Create your perfect Hunt Brothers pizza • Pickup Only</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pizza Visual */}
          <Card className="border-2 border-red-200 lg:sticky lg:top-4 h-fit">
            <CardContent className="p-6">
              <div className="aspect-square bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mb-4 border-4 border-yellow-400">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-700">{selectedPizza}</div>
                  <div className="text-lg text-red-600">Standard Size</div>
                  <div className="text-sm text-gray-600">{selectedCrust} Crust</div>
                </div>
              </div>
              
              {/* Selected Toppings Display */}
              <div className="space-y-2">
                <h3 className="font-semibold text-red-700">Your Toppings ({pricing.freeToppings}/10 free):</h3>
                <div className="flex flex-wrap gap-2">
                  {doubleCheeseSelected && (
                    <Badge className="bg-yellow-500 text-black">Double Cheese</Badge>
                  )}
                  {selectedToppings.map((topping) => (
                    <Badge key={topping} className="bg-red-600 text-white">{topping}</Badge>
                  ))}
                  {extraToppings.map((topping) => (
                    <Badge key={`extra-${topping}`} className="bg-orange-600 text-white">Extra {topping}</Badge>
                  ))}
                  {selectedToppings.length === 0 && !doubleCheeseSelected && (
                    <span className="text-gray-500">Just cheese</span>
                  )}
                </div>
              </div>

              {/* Pricing Preview */}
              <div className="mt-4 bg-yellow-50 p-3 rounded-lg border-2 border-yellow-300">
                <div className="flex justify-between font-bold text-lg text-red-700">
                  <span>Total:</span>
                  <span>${pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pizza Builder */}
          <div className="space-y-6">
            {/* Pickup Only Notice */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="font-bold text-blue-800 text-lg">🏪 Pickup Only</h3>
                  <p className="text-blue-700">We do not offer delivery. Ready in 7-10 minutes.</p>
                </div>
              </CardContent>
            </Card>

            {/* Crust Selection */}
            <Card className="border-2 border-red-200">
              <CardHeader className="bg-red-700 text-white">
                <CardTitle className="text-xl">Choose Your Crust</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-3">
                  {["Original", "Thin"].map((crust) => (
                    <button
                      key={crust}
                      onClick={() => setSelectedCrust(crust)}
                      className={`p-4 text-lg border-2 rounded-lg font-semibold transition-all ${
                        selectedCrust === crust
                          ? "border-red-600 bg-red-50 text-red-700"
                          : "border-gray-200 hover:border-red-300"
                      }`}
                    >
                      {crust} Crust
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Double Cheese Option */}
            <Card className="border-2 border-red-200">
              <CardHeader className="bg-red-700 text-white">
                <CardTitle className="text-xl">Cheese</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <button
                  onClick={() => setDoubleCheeseSelected(!doubleCheeseSelected)}
                  className={`w-full p-4 text-lg border-2 rounded-lg font-semibold transition-all ${
                    doubleCheeseSelected
                      ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                      : "border-gray-200 hover:border-yellow-300"
                  }`}
                >
                  Double Cheese (+$2.19)
                </button>
              </CardContent>
            </Card>

            {/* Meat Toppings */}
            <Card className="border-2 border-red-200">
              <CardHeader className="bg-red-700 text-white">
                <CardTitle className="text-xl">Meat Toppings</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {meatToppings.map((topping) => (
                    <div key={topping} className="space-y-2">
                      <button
                        onClick={() => toggleTopping(topping)}
                        disabled={!selectedToppings.includes(topping) && selectedToppings.length >= 10}
                        className={`w-full p-3 text-left border-2 rounded-lg font-semibold transition-all ${
                          selectedToppings.includes(topping)
                            ? "border-red-600 bg-red-50 text-red-700"
                            : selectedToppings.length >= 10
                              ? "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                              : "border-gray-200 hover:border-red-300"
                        }`}
                      >
                        ✓ {topping} {selectedToppings.includes(topping) ? "(Selected)" : "(Free)"}
                      </button>
                      <button
                        onClick={() => toggleExtraTopping(topping)}
                        disabled={!selectedToppings.includes(topping)}
                        className={`w-full p-2 text-left text-sm border rounded-lg transition-all ml-4 ${
                          extraToppings.includes(topping)
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : selectedToppings.includes(topping)
                              ? "border-gray-200 hover:border-orange-300"
                              : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        ⬜ Extra {topping} (+$1.50)
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Veggie Toppings */}
            <Card className="border-2 border-red-200">
              <CardHeader className="bg-red-700 text-white">
                <CardTitle className="text-xl">Fresh Toppings</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {veggieToppings.map((topping) => (
                    <div key={topping} className="space-y-2">
                      <button
                        onClick={() => toggleTopping(topping)}
                        disabled={!selectedToppings.includes(topping) && selectedToppings.length >= 10}
                        className={`w-full p-3 text-left border-2 rounded-lg font-semibold transition-all ${
                          selectedToppings.includes(topping)
                            ? "border-green-600 bg-green-50 text-green-700"
                            : selectedToppings.length >= 10
                              ? "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                              : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        ✓ {topping} {selectedToppings.includes(topping) ? "(Selected)" : "(Free)"}
                      </button>
                      <button
                        onClick={() => toggleExtraTopping(topping)}
                        disabled={!selectedToppings.includes(topping)}
                        className={`w-full p-2 text-left text-sm border rounded-lg transition-all ml-4 ${
                          extraToppings.includes(topping)
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : selectedToppings.includes(topping)
                              ? "border-gray-200 hover:border-orange-300"
                              : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        ⬜ Extra {topping} (+$1.00)
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quantity and Add to Cart */}
            <Card className="border-2 border-red-200">
              <CardContent className="p-6 space-y-4">
                {/* Quantity */}
                <div>
                  <h3 className="font-semibold mb-3 text-red-700 text-xl">Quantity</h3>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="border-red-300 hover:border-red-500"
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <span className="text-2xl font-bold text-red-700 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setQuantity(quantity + 1)}
                      className="border-red-300 hover:border-red-500"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
                  <div className="flex justify-between text-sm">
                    <span>Pizzas ({quantity}):</span>
                    <span>${pricing.pizzasPrice.toFixed(2)}</span>
                  </div>
                  {pricing.extraToppingsCount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Extra Toppings ({pricing.extraToppingsCount}):</span>
                      <span>${pricing.toppingsPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {doubleCheeseSelected && (
                    <div className="flex justify-between text-sm">
                      <span>Double Cheese:</span>
                      <span>${doubleCheesePrice.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${pricing.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (8.25%):</span>
                    <span>${pricing.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-red-700 border-t-2 border-red-300 pt-2 mt-2">
                    <span>Total:</span>
                    <span>${pricing.total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={addToCart}
                  className="w-full bg-red-700 hover:bg-red-800 text-white py-4 text-xl font-bold shadow-lg"
                >
                  <ShoppingCart className="mr-2 h-6 w-6" />
                  Add to Cart - ${pricing.total.toFixed(2)}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}