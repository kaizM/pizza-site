import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import PizzaBuilder from "@/components/PizzaBuilder";
import OrderSummary from "@/components/OrderSummary";
import CustomerNavigation from "@/components/CustomerNavigation";
import { useCart } from "@/hooks/useCart";

export default function BuildPizzaPage() {
  const { cartItems, addToCart, updateQuantity, removeItem, getTotalItems } = useCart();

  return (
    <div className="min-h-screen bg-neutral-bg">
      <CustomerNavigation showCartButton={true} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pizza Builder */}
          <div className="lg:col-span-2">
            <PizzaBuilder onAddToCart={addToCart} />
          </div>
          
          {/* Cart Summary Sidebar */}
          <div className="lg:col-span-1">
            {cartItems.length > 0 ? (
              <OrderSummary
                cartItems={cartItems}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
              />
            ) : (
              <div className="sticky top-24">
                <div className="bg-white rounded-xl border p-8 text-center">
                  <div className="text-4xl mb-4">🛒</div>
                  <h3 className="font-semibold text-neutral-text mb-2">Your cart is empty</h3>
                  <p className="text-sm text-neutral-secondary">
                    Build a pizza to see it here!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>


    </div>
  );
}