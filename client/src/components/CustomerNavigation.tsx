import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Phone, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import PhoneButton from "@/components/PhoneButton";

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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center min-w-0 flex-shrink-0">
              <div className="text-xl sm:text-2xl mr-2">🍕</div>
              <div className="min-w-0">
                <h1 className="font-bold text-lg sm:text-xl lg:text-2xl text-red-600 truncate">Hunt Brothers Pizza</h1>
                <p className="text-xs text-gray-500 -mt-1 hidden sm:block">Fresh • Bold • American</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <a 
                href="tel:+1-361-403-0083"
                className="bg-red-600 hover:bg-red-700 text-white flex items-center px-2 sm:px-4 py-2 rounded-md font-medium transition-colors no-underline text-sm sm:text-base"
                role="button"
                aria-label="Call Hunt Brothers Pizza at 361-403-0083"
              >
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden xs:inline">(361) 403-0083</span>
                <span className="xs:hidden">Call</span>
              </a>
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (variant === "checkout") {
    return (
      <header className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between min-h-[64px] sm:min-h-[72px] py-2">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-shrink-0">
              <div className="flex items-center">
                <div className="text-xl sm:text-2xl lg:text-3xl mr-2 sm:mr-3 filter drop-shadow-lg">🍕</div>
                <div className="min-w-0">
                  <h1 className="font-bold text-lg sm:text-xl lg:text-2xl xl:text-3xl text-white drop-shadow-lg truncate">Hunt Brothers Pizza</h1>
                  <p className="text-xs sm:text-sm text-orange-100 -mt-1 font-medium hidden sm:block">Delicious Checkout Experience</p>
                </div>
              </div>
            </div>
            
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-8">
              <Link href="/" className="text-white hover:text-yellow-200 transition-colors font-medium text-base lg:text-lg px-2 lg:px-3 py-2 rounded-lg hover:bg-white/10">
                Menu
              </Link>
              <Link href="/build-pizza" className="text-white hover:text-yellow-200 transition-colors font-medium text-base lg:text-lg px-2 lg:px-3 py-2 rounded-lg hover:bg-white/10">
                Build Pizza
              </Link>
              <Link href="/track-order" className="text-white hover:text-yellow-200 transition-colors font-medium text-base lg:text-lg px-2 lg:px-3 py-2 rounded-lg hover:bg-white/10">
                Track Order
              </Link>
            </nav>
            
            <div className="flex items-center">
              <a 
                href="tel:+1-361-403-0083"
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold shadow-lg transform hover:scale-105 transition-all px-2 sm:px-4 py-2 rounded-md flex items-center no-underline text-sm sm:text-base"
                role="button"
                aria-label="Call Hunt Brothers Pizza at 361-403-0083"
              >
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden xs:inline">Call Now</span>
                <span className="xs:hidden">Call</span>
              </a>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Default navigation
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-shrink-0">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <div className="text-xl sm:text-2xl mr-2">🍕</div>
                <div className="min-w-0">
                  <h1 className="font-bold text-lg sm:text-xl lg:text-2xl text-red-600 truncate">Hunt Brothers Pizza</h1>
                  <p className="text-xs text-gray-500 -mt-1 hidden sm:block">Fresh • Bold • American</p>
                </div>
              </div>
            </Link>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
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
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <a 
              href="tel:+1-361-403-0083"
              className="bg-red-600 hover:bg-red-700 text-white flex items-center px-2 sm:px-4 py-2 rounded-md font-medium transition-colors no-underline text-sm sm:text-base"
              role="button"
              aria-label="Call Hunt Brothers Pizza at 361-403-0083"
            >
              <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden xs:inline">(361) 403-0083</span>
              <span className="xs:hidden">Call</span>
            </a>
            {showCartButton && (
              <Link href="/cart">
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-2 sm:px-4 py-2 shadow-lg transition-all duration-200 text-sm sm:text-base"
                  style={{ 
                    background: 'var(--pizza-primary)',
                    borderColor: 'var(--pizza-primary)'
                  }}
                >
                  <ShoppingCart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Cart ({getTotalItems()})</span>
                  <span className="xs:hidden">({getTotalItems()})</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}