import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Phone, MapPin, Clock } from "lucide-react";

export default function Home() {
  const [hoveredPizza, setHoveredPizza] = useState<string | null>(null);

  const pizzas = [
    {
      id: "lotsa-meat",
      name: "Lotsa Meat",
      description: "Loaded with pepperoni, sausage, bacon, and beef — for the ultimate meat lover.",
      price: 11.99,
      image: "/lotsa-meat-pizza.png",
    },
    {
      id: "veggie-delight", 
      name: "Veggie Delight",
      description: "Bell peppers, onions, mushrooms, black olives, banana peppers. No meat.",
      price: 11.99,
      image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    },
    {
      id: "loaded",
      name: "Loaded", 
      description: "Combo of meats & veggies: pepperoni, sausage, mushrooms, bell peppers, onions.",
      price: 11.99,
      image: "/loaded-pizza.jpeg",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-bg">
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
                  <Link href="/build-pizza">
                    <Button className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 shadow-md">
                      Order This Pizza
                    </Button>
                  </Link>
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
          <Button size="lg" className="bg-red-700 hover:bg-red-800 text-white px-8 py-4 text-lg font-bold shadow-lg">
            <Phone className="mr-2 h-5 w-5" />
            Call (361) 403-0083
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-text text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-cursive text-red-400 mb-4">Hunt Brothers Pizza</h3>
              <p className="text-gray-300 leading-relaxed">
                Serving Palacios, TX with bold, American-style pizzas since day one. 
                Every pizza is made fresh to order with quality ingredients.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Location</h4>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-red-400" />
                  <span>2100 1st Street, Palacios, TX 77465</span>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-red-400" />
                  <span>(361) 403-0083</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Hours</h4>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-red-400" />
                  <span>9:00 AM – 12:00 AM</span>
                </div>
                <p className="text-sm">Open 7 days a week</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Hunt Brothers Pizza. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
