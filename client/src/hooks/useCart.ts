import { useState, useEffect } from "react";
import { CartItem } from "@shared/schema";

const CART_STORAGE_KEY = "pizza-cart-v2";

export function useCart() {
  // Initialize state with localStorage data if available
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Auto-save to localStorage when cart changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
    setCartItems(current => [...current, item]);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getSubtotal = () => {
    // Hunt Brothers pricing: First pizza $11.99, additional pizzas $10.99
    const firstPizzaPrice = 11.99;
    const additionalPizzaPrice = 10.99;
    
    let subtotal = 0;
    let totalPizzaCount = 0;
    
    // First pass: count total pizzas and calculate topping costs
    cartItems.forEach(item => {
      totalPizzaCount += item.quantity;
      
      // Calculate toppings cost for this item
      let toppingsPerPizza = 0;
      
      // Extract topping costs from the item price (subtract base pizza price)
      toppingsPerPizza = item.price - firstPizzaPrice;
      
      // Add toppings cost for all quantities of this item
      subtotal += toppingsPerPizza * item.quantity;
    });
    
    // Calculate pizza base pricing with discount structure
    if (totalPizzaCount === 1) {
      subtotal += firstPizzaPrice;
    } else if (totalPizzaCount > 1) {
      subtotal += firstPizzaPrice + (additionalPizzaPrice * (totalPizzaCount - 1));
    }
    
    return subtotal;
  };

  return {
    cartItems,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalItems,
    getSubtotal,
  };
}