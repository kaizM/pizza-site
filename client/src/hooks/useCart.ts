import { useState, useEffect } from "react";
import { CartItem } from "@shared/schema";
import { cartStore } from "@/lib/cartStore";

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>(cartStore.getItems());

  useEffect(() => {
    const unsubscribe = cartStore.subscribe(() => {
      setCartItems(cartStore.getItems());
    });

    return unsubscribe;
  }, []);

  const addToCart = (item: CartItem) => {
    cartStore.addItem(item);
  };

  const updateQuantity = (id: string, quantity: number) => {
    cartStore.updateQuantity(id, quantity);
  };

  const removeItem = (id: string) => {
    cartStore.removeItem(id);
  };

  const clearCart = () => {
    cartStore.clearCart();
  };

  const getTotalItems = () => {
    return cartStore.getTotalItems();
  };

  const getSubtotal = () => {
    return cartStore.getSubtotal();
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