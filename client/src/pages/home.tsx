import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { Phone, MapPin, Clock } from "lucide-react";
import { CartItem } from "@shared/schema";
import { generateOrderId } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import CustomerNavigation from "@/components/CustomerNavigation";
import PhoneButton from "@/components/PhoneButton";

export default function Home() {
  const [hoveredPizza, setHoveredPizza] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { addToCart } = useCart();

  const orderPremadePizza = (pizza: typeof pizzas[0]) => {
    // Create cart item from premade pizza
    const cartItem: CartItem = {
      id: generateOrderId(),
      name: pizza.name,
      size: pizza.size,
      crust: pizza.crust,
      toppings: pizza.toppings,
      price: pizza.price,
      quantity: 1,
      imageUrl: pizza.image,
    };

    // Add to cart using shared cart system
    addToCart(cartItem);
    
    // Navigate to cart summary first
    setLocation('/cart');
  };

  const pizzas = [
    {
      id: "lotsa-meat",
      name: "Lotsa Meat",
      description: "Loaded with pepperoni, sausage, bacon, and beef — for the ultimate meat lover.",
      price: 11.99,
      image: "/lotsa-meat-pizza.png",
      toppings: ["Pepperoni", "Italian Sausage", "Bacon", "Beef"],
      size: "Large",
      crust: "Original",
    },
    {
      id: "veggie-delight", 
      name: "Veggie Delight",
      description: "Bell peppers, onions, mushrooms, black olives, banana peppers, jalapeños. No meat.",
      price: 11.99,
      image: "/veggie-delight-pizza.jpeg",
      toppings: ["Bell Peppers", "Onions", "Mushrooms", "Black Olives", "Banana Peppers", "Jalapeños"],
      size: "Large",
      crust: "Original",
    },
    {
      id: "loaded",
      name: "Loaded", 
      description: "Combo of meats & veggies: pepperoni, sausage, mushrooms, bell peppers, onions.",
      price: 11.99,
      image: "/loaded-pizza.jpeg",
      toppings: ["Pepperoni", "Italian Sausage", "Mushrooms", "Bell Peppers", "Onions"],
      size: "Large",
      crust: "Original",
    },
  ];



  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Header Navigation */}
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
            
            {/* Customer Contact Info */}
            <div className="flex items-center space-x-4">
              <div 
                className="bg-red-600 hover:bg-red-700 text-white flex items-center px-4 py-2 rounded-md cursor-pointer font-medium transition-colors"
                onClick={() => {
                  try {
                    window.location.href = 'tel:+1-361-403-0083';
                  } catch (error) {
                    const link = document.createElement('a');
                    link.href = 'tel:+1-361-403-0083';
                    link.click();
                  }
                }}
                role="button"
                aria-label="Call Hunt Brothers Pizza at 361-403-0083"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    try {
                      window.location.href = 'tel:+1-361-403-0083';
                    } catch (error) {
                      const link = document.createElement('a');
                      link.href = 'tel:+1-361-403-0083';
                      link.click();
                    }
                  }
                }}
              >
                <Phone className="h-4 w-4 mr-1" />
                (361) 403-0083
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-700 to-yellow-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Hunt Brothers Pizza - Made Fresh Daily
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Bold flavors, quality ingredients, and the pizza you crave - made fresh to order
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/build-pizza">
              <Button size="lg" className="bg-yellow-400 text-red-800 hover:bg-yellow-300 px-8 py-4 text-lg font-bold shadow-lg">
                Build Your Pizza
              </Button>
            </Link>
            <Link href="/build-pizza">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-red-700 px-8 py-4 text-lg font-bold bg-transparent shadow-lg">
                Order Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Pizzas */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-text mb-4">Hunt Brothers Signature Pizzas</h2>
            <p className="text-xl text-neutral-secondary">Bold flavors, loaded with your favorites</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pizzas.map((pizza) => (
              <Card
                key={pizza.id}
                className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer ${
                  hoveredPizza === pizza.id ? "ring-2 ring-red-500" : ""
                }`}
                onMouseEnter={() => setHoveredPizza(pizza.id)}
                onMouseLeave={() => setHoveredPizza(null)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={pizza.image}
                    alt={pizza.name}
                    className="w-full h-48 object-cover object-center transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-yellow-400 text-red-800 px-3 py-1 rounded-full font-bold border-2 border-red-700">
                    ${pizza.price}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-neutral-text mb-2">{pizza.name}</h3>
                  <p className="text-neutral-secondary mb-4 leading-relaxed">{pizza.description}</p>
                  <Button 
                    onClick={() => orderPremadePizza(pizza)}
                    className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 shadow-md"
                  >
                    Order This Pizza
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-neutral-text mb-4">
            Need Help with Your Order?
          </h2>
          <p className="text-xl text-neutral-secondary mb-8">
            Our friendly staff is ready to help you create the perfect pizza
          </p>
          <PhoneButton 
            size="lg" 
            className="bg-red-700 hover:bg-red-800 text-white px-8 py-4 text-lg font-bold shadow-lg"
          >
            Call (361) 403-0083
          </PhoneButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-red-900 via-red-800 to-red-900 text-white py-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-400 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-yellow-400 rounded-full translate-x-24 translate-y-24"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-bold text-yellow-400 mb-6">Hunt Brothers Pizza</h3>
              <p className="text-red-100 leading-relaxed text-lg">
                Serving Palacios, TX with bold, American-style pizzas since day one. 
                Every pizza is made fresh to order with quality ingredients.
              </p>
            </div>
            
            <div className="text-center md:text-left">
              <h4 className="text-xl font-bold mb-6 text-yellow-400">Visit Us</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-center md:justify-start group">
                  <div className="bg-yellow-400 p-2 rounded-full mr-4 group-hover:scale-110 transition-transform">
                    <MapPin className="h-5 w-5 text-red-800" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">2100 1st Street</p>
                    <p className="text-red-200">Palacios, TX 77465</p>
                  </div>
                </div>
                <div 
                  className="flex items-center justify-center md:justify-start group cursor-pointer hover:bg-white/10 rounded-lg p-2 transition-all"
                  onClick={() => {
                    // Multi-method phone calling for iOS compatibility
                    try {
                      window.location.href = 'tel:+1-361-403-0083';
                    } catch (error) {
                      const link = document.createElement('a');
                      link.href = 'tel:+1-361-403-0083';
                      link.click();
                    }
                  }}
                  role="button"
                  aria-label="Call Hunt Brothers Pizza at 361-403-0083"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      try {
                        window.location.href = 'tel:+1-361-403-0083';
                      } catch (error) {
                        const link = document.createElement('a');
                        link.href = 'tel:+1-361-403-0083';
                        link.click();
                      }
                    }
                  }}
                >
                  <div className="bg-yellow-400 p-2 rounded-full mr-4 group-hover:scale-110 transition-transform">
                    <Phone className="h-5 w-5 text-red-800" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">(361) 403-0083</p>
                    <p className="text-red-200">Call to order</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <h4 className="text-xl font-bold mb-6 text-yellow-400">Hours</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-center md:justify-start group">
                  <div className="bg-yellow-400 p-2 rounded-full mr-4 group-hover:scale-110 transition-transform">
                    <Clock className="h-5 w-5 text-red-800" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">9:00 AM – 12:00 AM</p>
                    <p className="text-red-200">Open 7 days a week</p>
                  </div>
                </div>
                <div className="bg-yellow-400/20 p-4 rounded-lg border border-yellow-400/30">
                  <p className="text-yellow-300 font-semibold text-center">🍕 Pickup Only</p>
                  <p className="text-red-100 text-sm text-center mt-1">Ready in 7-10 minutes</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-red-600/50 mt-12 pt-8">
            <div className="text-center">
              <p className="text-red-200 text-lg mb-2">&copy; 2024 Hunt Brothers Pizza. All rights reserved.</p>
              <p className="text-red-300 text-sm">Fresh • Bold • American</p>
            </div>
          </div>
        </div>
      </footer>


    </div>
  );
}
