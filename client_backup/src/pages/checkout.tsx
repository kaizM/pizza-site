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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-yellow-300 rounded-full opacity-30 animate-bounce delay-300"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-orange-200 rounded-full opacity-25 animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-red-300 rounded-full opacity-20 animate-bounce delay-1000"></div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="text-3xl mr-3 filter drop-shadow-lg">🍕</div>
                <div>
                  <h1 className="font-bold text-3xl text-white drop-shadow-lg">Hunt Brothers Pizza</h1>
                  <p className="text-sm text-orange-100 -mt-1 font-medium">Delicious Checkout Experience</p>
                </div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-white hover:text-yellow-200 transition-colors font-medium text-lg px-3 py-2 rounded-lg hover:bg-white/10">
                Menu
              </Link>
              <Link href="/build-pizza" className="text-white hover:text-yellow-200 transition-colors font-medium text-lg px-3 py-2 rounded-lg hover:bg-white/10">
                Build Pizza
              </Link>
              <Link href="/track-order" className="text-white hover:text-yellow-200 transition-colors font-medium text-lg px-3 py-2 rounded-lg hover:bg-white/10">
                Track Order
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setShowAuthModal(true)}
                className="text-white hover:text-yellow-200 hover:bg-white/10 border-2 border-white/20"
              >
                <User className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline font-medium">
                  {user ? user.email?.split('@')[0] : 'Sign In'}
                </span>
              </Button>
              <Button className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold shadow-lg transform hover:scale-105 transition-all">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Cart
                <span className="ml-2 bg-red-600 text-white text-sm rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-md">
                  {getTotalItems()}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 py-6 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white drop-shadow-lg">Almost There!</h2>
            <p className="text-xl text-white/90 mt-2 font-medium">Complete your delicious order in just a few steps</p>
            <div className="flex justify-center items-center mt-4 space-x-8">
              <div className="flex items-center text-white">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-2">
                  <span className="text-lg">⚡</span>
                </div>
                <span className="font-medium">Fast Checkout</span>
              </div>
              <div className="flex items-center text-white">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-2">
                  <span className="text-lg">🔒</span>
                </div>
                <span className="font-medium">Secure Payment</span>
              </div>
              <div className="flex items-center text-white">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-2">
                  <span className="text-lg">🍕</span>
                </div>
                <span className="font-medium">Fresh & Hot</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Flow */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-gradient-to-r from-red-200 to-orange-200">
              <CheckoutFlow
                cartItems={cartItems}
                onOrderComplete={handleOrderComplete}
              />
            </div>
          </div>
          
          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl shadow-2xl p-1">
              <div className="bg-white rounded-xl p-6">
                <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg p-4 mb-6">
                  <h3 className="text-xl font-bold flex items-center">
                    <span className="mr-2">🛒</span>
                    Your Order
                  </h3>
                  <p className="text-red-100 text-sm mt-1">Review your delicious selections</p>
                </div>
                <OrderSummary
                  cartItems={cartItems}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeItem}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8 border-2 border-yellow-200">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <span className="text-2xl">✅</span>
              </div>
              <h4 className="font-bold text-lg text-gray-800">Quality Guaranteed</h4>
              <p className="text-gray-600 mt-2">Fresh ingredients, made to order</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <span className="text-2xl">🕐</span>
              </div>
              <h4 className="font-bold text-lg text-gray-800">Ready in 7-10 Minutes</h4>
              <p className="text-gray-600 mt-2">Hot and fresh for pickup</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <span className="text-2xl">💯</span>
              </div>
              <h4 className="font-bold text-lg text-gray-800">100% Satisfaction</h4>
              <p className="text-gray-600 mt-2">Love it or we'll make it right</p>
            </div>
          </div>
        </div>
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
