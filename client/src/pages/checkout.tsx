import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { handleRedirectResult } from "@/lib/auth";
import AuthModal from "@/components/AuthModal";
import CheckoutFlow from "@/components/CheckoutFlow";
import OrderSummary from "@/components/OrderSummary";
import OrderTracking from "@/components/OrderTracking";
import { ShoppingCart, User } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/hooks/useCart";
import { CartItem } from "@shared/schema";

export default function CheckoutPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const { cartItems, updateQuantity, removeItem, clearCart, getTotalItems, addToCart } = useCart();

  const { user, loading } = useAuth();

  useEffect(() => {
    // Load premade cart items from localStorage if available (for direct navigation from home page)
    const storedCartItems = localStorage.getItem('premadeCartItems');
    if (storedCartItems) {
      try {
        const parsedItems: CartItem[] = JSON.parse(storedCartItems);
        parsedItems.forEach(item => addToCart(item));
        localStorage.removeItem('premadeCartItems');
      } catch (error) {
        console.error('Error parsing stored cart items:', error);
      }
    }

    // Handle redirect result from Google sign-in
    handleRedirectResult().then(({ user: redirectUser, error }) => {
      if (error) {
        // Handle redirect auth error securely
      } else if (redirectUser) {
        // User successfully signed in via redirect
      }
    });
  }, [addToCart]);

  const handleOrderComplete = (orderId: string) => {
    setCompletedOrderId(orderId);
    clearCart();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Show order tracking if order is completed
  if (completedOrderId) {
    return (
      <div className="min-h-screen bg-neutral-bg py-8">
        <OrderTracking orderId={completedOrderId} />
        <div className="text-center mt-8">
          <Link href="/">
            <Button
              onClick={() => {
                setCompletedOrderId(null);
              }}
              variant="outline"
            >
              Order More
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-bg">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="text-2xl mr-2">🍕</div>
                  <div>
                    <h1 className="font-cursive text-2xl text-red-600">Hunt Brothers Pizza</h1>
                    <p className="text-xs text-neutral-secondary -mt-1">Checkout</p>
                  </div>
                </div>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
                <a href="/" className="text-neutral-text hover:text-red-600 transition-colors font-medium">Menu</a>
                <a href="#" className="text-neutral-text hover:text-red-600 transition-colors font-medium">Build Pizza</a>
                <a href="#" className="text-neutral-text hover:text-red-600 transition-colors font-medium">Track Order</a>
              </nav>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowAuthModal(true)}
                  className="text-neutral-secondary hover:text-neutral-text"
                >
                  <User className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">
                    {user ? user.email?.split('@')[0] : 'Sign In'}
                  </span>
                </Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Cart
                  <span className="ml-2 bg-yellow-400 text-neutral-text text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    0
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-neutral-text mb-4">Your cart is empty</h2>
          <p className="text-neutral-secondary mb-8">Add some delicious pizzas to get started!</p>
          <Link href="/">
            <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg">
              Browse Menu
            </Button>
          </Link>
        </div>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="text-2xl mr-2">🍕</div>
                <div>
                  <h1 className="font-cursive text-2xl text-red-600">Hunt Brothers Pizza</h1>
                  <p className="text-xs text-neutral-secondary -mt-1">Checkout</p>
                </div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/" className="text-neutral-text hover:text-red-600 transition-colors font-medium">Menu</a>
              <a href="#" className="text-neutral-text hover:text-red-600 transition-colors font-medium">Build Pizza</a>
              <a href="#" className="text-neutral-text hover:text-red-600 transition-colors font-medium">Track Order</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setShowAuthModal(true)}
                className="text-neutral-secondary hover:text-neutral-text"
              >
                <User className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">
                  {user ? user.email?.split('@')[0] : 'Sign In'}
                </span>
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Cart
                <span className="ml-2 bg-yellow-400 text-neutral-text text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Flow */}
          <div className="lg:col-span-2">
            <CheckoutFlow
              cartItems={cartItems}
              onOrderComplete={handleOrderComplete}
            />
          </div>
          
          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary
              cartItems={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
            />
          </div>
        </div>
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
