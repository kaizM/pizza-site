import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShoppingCart, User, ArrowLeft } from "lucide-react";
import PizzaBuilder from "@/components/PizzaBuilder";
import OrderSummary from "@/components/OrderSummary";
import AuthModal from "@/components/AuthModal";
import { CartItem } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function BuildPizzaPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  const addToCart = (item: CartItem) => {
    setCartItems(prev => [...prev, item]);
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center">
                <div className="text-2xl mr-2">🍕</div>
                <div>
                  <h1 className="font-cursive text-2xl text-red-600">Hunt Brothers Pizza</h1>
                  <p className="text-xs text-neutral-secondary -mt-1">Pizza Builder</p>
                </div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-neutral-text hover:text-red-600 transition-colors font-medium">
                Menu
              </Link>
              <Link href="/track-order" className="text-neutral-text hover:text-red-600 transition-colors font-medium">
                Track Order
              </Link>
              <Link href="/employee" className="text-neutral-text hover:text-red-600 transition-colors font-medium">
                Kitchen
              </Link>
              <Link href="/admin" className="text-neutral-text hover:text-red-600 transition-colors font-medium">
                Admin
              </Link>
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
              <Link href="/checkout">
                <Button className="bg-red-700 hover:bg-red-800 text-white font-bold shadow-md">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Cart
                  <span className="ml-2 bg-yellow-400 text-red-800 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold border border-red-700">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

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

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}