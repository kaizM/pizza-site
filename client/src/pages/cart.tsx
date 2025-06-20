import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useLocation } from "wouter";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, Edit3 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { CartItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { cartStorage } from "@/lib/cartStorage";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { cartItems, updateQuantity, removeItem, clearCart, getSubtotal, getTotalItems, addToCart } = useCart();
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);

  // Available options for customization
  const crusts = ["Original", "Thin"];
  
  // Regular toppings included with pizza
  const regularToppings = [
    "Pepperoni", "Italian Sausage", "Beef", "Bacon",
    "Bell Peppers", "Onions", "Mushrooms", "Black Olives", 
    "Banana Peppers", "Jalapeños"
  ];
  
  // Extra toppings with proper pricing
  const meatToppings = [
    { name: "Extra Pepperoni", price: 1.50 },
    { name: "Extra Italian Sausage", price: 1.50 },
    { name: "Extra Beef", price: 1.50 },
    { name: "Extra Bacon", price: 1.50 }
  ];
  
  const veggieToppings = [
    { name: "Extra Bell Peppers", price: 1.00 },
    { name: "Extra Onions", price: 1.00 },
    { name: "Extra Mushrooms", price: 1.00 },
    { name: "Extra Black Olives", price: 1.00 },
    { name: "Extra Banana Peppers", price: 1.00 },
    { name: "Extra Jalapeños", price: 1.00 }
  ];
  
  const specialToppings = [
    { name: "Double Cheese", price: 2.19 }
  ];
  
  const extraToppings = [...meatToppings, ...veggieToppings, ...specialToppings];

  const handleEditItem = (item: CartItem) => {
    setEditingItem({ ...item });
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    // Calculate price: base $11.99 + extra toppings
    let totalPrice = 11.99;
    editingItem.toppings.forEach(topping => {
      const extraTopping = extraToppings.find(et => et.name === topping);
      if (extraTopping) {
        totalPrice += extraTopping.price;
      }
    });

    const updatedItem = {
      ...editingItem,
      price: totalPrice
    };

    // Remove old item and add updated one
    removeItem(editingItem.id);
    addToCart(updatedItem);

    toast({
      title: "Pizza Updated!",
      description: "Your pizza customization has been saved",
      variant: "default",
    });

    setEditingItem(null);
  };

  const handleToppingChange = (topping: string, checked: boolean) => {
    if (!editingItem) return;

    const newToppings = checked
      ? [...editingItem.toppings, topping]
      : editingItem.toppings.filter(t => t !== topping);

    setEditingItem({
      ...editingItem,
      toppings: newToppings
    });
  };

  const subtotal = getSubtotal();
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-16">
            <CardContent>
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
              <p className="text-gray-600 mb-8">Add some delicious Hunt Brothers pizzas to get started!</p>
              <Link href="/">
                <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3">
                  Browse Pizzas
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Your Order</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={clearCart}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">Size:</span> {item.size}</p>
                        <p><span className="font-medium">Crust:</span> {item.crust}</p>
                        {item.toppings.length > 0 && (
                          <p><span className="font-medium">Toppings:</span> {item.toppings.join(", ")}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Edit Button */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Edit3 className="h-4 w-4 mr-1" />
                            Customize
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                          <DialogHeader>
                            <DialogTitle>Customize {editingItem?.name}</DialogTitle>
                          </DialogHeader>
                          {editingItem && (
                            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                              {/* Crust Selection */}
                              <div>
                                <label className="text-sm font-medium mb-2 block">Crust</label>
                                <Select
                                  value={editingItem.crust}
                                  onValueChange={(value) => setEditingItem({...editingItem, crust: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {crusts.map(crust => (
                                      <SelectItem key={crust} value={crust}>{crust}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Regular Toppings Selection */}
                              <div>
                                <label className="text-sm font-medium mb-3 block">
                                  Regular Toppings (Free)
                                </label>
                                <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto border rounded p-2">
                                  {regularToppings.map(topping => (
                                    <div key={topping} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={topping}
                                        checked={editingItem.toppings.includes(topping)}
                                        onCheckedChange={(checked) => 
                                          handleToppingChange(topping, checked as boolean)
                                        }
                                      />
                                      <label htmlFor={topping} className="text-sm">
                                        {topping}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Extra Meat Toppings */}
                              <div>
                                <label className="text-sm font-medium mb-3 block">
                                  Extra Meat Toppings (+$1.50 each)
                                </label>
                                <div className="space-y-2 max-h-20 overflow-y-auto border rounded p-2">
                                  {meatToppings.map(topping => (
                                    <div key={topping.name} className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={topping.name}
                                          checked={editingItem.toppings.includes(topping.name)}
                                          onCheckedChange={(checked) => 
                                            handleToppingChange(topping.name, checked as boolean)
                                          }
                                        />
                                        <label htmlFor={topping.name} className="text-sm">
                                          {topping.name}
                                        </label>
                                      </div>
                                      <span className="text-sm font-medium text-red-600">
                                        +${topping.price.toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Extra Veggie Toppings */}
                              <div>
                                <label className="text-sm font-medium mb-3 block">
                                  Extra Veggie Toppings (+$1.00 each)
                                </label>
                                <div className="space-y-2 max-h-20 overflow-y-auto border rounded p-2">
                                  {veggieToppings.map(topping => (
                                    <div key={topping.name} className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={topping.name}
                                          checked={editingItem.toppings.includes(topping.name)}
                                          onCheckedChange={(checked) => 
                                            handleToppingChange(topping.name, checked as boolean)
                                          }
                                        />
                                        <label htmlFor={topping.name} className="text-sm">
                                          {topping.name}
                                        </label>
                                      </div>
                                      <span className="text-sm font-medium text-green-600">
                                        +${topping.price.toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Special Toppings */}
                              <div>
                                <label className="text-sm font-medium mb-3 block">
                                  Special Toppings
                                </label>
                                <div className="space-y-2 border rounded p-2">
                                  {specialToppings.map(topping => (
                                    <div key={topping.name} className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={topping.name}
                                          checked={editingItem.toppings.includes(topping.name)}
                                          onCheckedChange={(checked) => 
                                            handleToppingChange(topping.name, checked as boolean)
                                          }
                                        />
                                        <label htmlFor={topping.name} className="text-sm">
                                          {topping.name}
                                        </label>
                                      </div>
                                      <span className="text-sm font-medium text-blue-600">
                                        +${topping.price.toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Price Preview */}
                              <div className="bg-gray-50 p-3 rounded">
                                <div className="space-y-1">
                                  <p className="text-sm text-gray-600">Base Pizza: $11.99</p>
                                  {editingItem.toppings.some(t => extraToppings.find(et => et.name === t)) && (
                                    <div className="text-sm text-gray-600">
                                      <p>Extra Toppings:</p>
                                      {editingItem.toppings.map(topping => {
                                        const extra = extraToppings.find(et => et.name === topping);
                                        return extra ? (
                                          <p key={topping} className="ml-2">
                                            {extra.name}: +${extra.price.toFixed(2)}
                                          </p>
                                        ) : null;
                                      })}
                                    </div>
                                  )}
                                  <p className="font-bold text-lg">
                                    Total: ${(() => {
                                      let total = 11.99;
                                      editingItem.toppings.forEach(topping => {
                                        const extra = extraToppings.find(et => et.name === topping);
                                        if (extra) total += extra.price;
                                      });
                                      return total.toFixed(2);
                                    })()}
                                  </p>
                                </div>
                              </div>

                            </div>
                          )}
                          
                          {/* Save Button - Fixed at bottom */}
                          <div className="border-t pt-4 mt-4">
                            <Button onClick={handleSaveEdit} className="w-full">
                              Save Changes
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-right min-w-[80px]">
                        <p className="text-lg font-bold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-gray-500">
                            ${item.price.toFixed(2)} each
                          </p>
                        )}
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Items ({getTotalItems()})</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8.25%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Button 
                    onClick={() => setLocation('/checkout')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-lg"
                  >
                    Proceed to Checkout
                  </Button>
                </div>

                {/* Pickup Information */}
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-6">
                  <h4 className="font-medium text-yellow-800 mb-2">Pickup Information</h4>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p>📍 2100 1st Street, Palacios, TX</p>
                    <p>⏰ Ready in 7-10 minutes</p>
                    <p>📞 (361) 403-0083</p>
                  </div>
                </div>

                {/* Special Note */}
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Hunt Brothers Promise</h4>
                  <p className="text-sm text-green-700">
                    Fresh ingredients, bold flavors, and fast pickup. Every pizza made to order!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}