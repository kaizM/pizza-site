import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Phone, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface CustomerNavigationProps {
  variant?: "default" | "checkout" | "minimal";
  showCartButton?: boolean;
}

export default function CustomerNavigation({ 
  variant = "default", 
  showCartButton = true 
}: CustomerNavigationProps) {
  const { getTotalItems } = useCart();

  if (variant === "minimal") {
    return (
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="text-2xl mr-2">🍕</div>
              <div>
                <h1 className="font-bold text-2xl text-red-600">Hunt Brothers Pizza</h1>
                <p className="text-xs text-gray-500 -mt-1">Fresh • Bold • American</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button className="bg-red-600 hover:bg-red-700 text-white flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                (361) 403-0083
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (variant === "checkout") {
    return (
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
              <Button className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold shadow-lg transform hover:scale-105 transition-all">
                <Phone className="h-4 w-4 mr-1" />
                Call Now
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Default navigation
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <div className="text-2xl mr-2">🍕</div>
                <div>
                  <h1 className="font-bold text-2xl text-red-600">Hunt Brothers Pizza</h1>
                  <p className="text-xs text-gray-500 -mt-1">Fresh • Bold • American</p>
                </div>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-red-600 transition-colors font-medium">
              Menu
            </Link>
            <Link href="/build-pizza" className="text-gray-700 hover:text-red-600 transition-colors font-medium">
              Build Pizza
            </Link>
            <Link href="/track-order" className="text-gray-700 hover:text-red-600 transition-colors font-medium">
              Track Order
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button className="bg-red-600 hover:bg-red-700 text-white flex items-center">
              <Phone className="h-4 w-4 mr-1" />
              (361) 403-0083
            </Button>
            {showCartButton && (
              <Link href="/checkout">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Cart ({getTotalItems()})
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}