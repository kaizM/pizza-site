import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Star, MapPin, Phone, ChefHat, ShoppingCart, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';

interface PizzaItem {
  id: number;
  name: string;
  description: string;
  basePrice: string;
  imageUrl: string;
  category: string;
  isActive: boolean;
}

interface KitchenStatus {
  status: 'open' | 'busy' | 'closed';
}

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { data: pizzas = [], isLoading } = useQuery<PizzaItem[]>({
    queryKey: ['/api/pizzas'],
  });

  const { data: kitchenStatus } = useQuery<KitchenStatus>({
    queryKey: ['/api/kitchen-status'],
    refetchInterval: 5000, // Check status every 5 seconds
  });

  const categories = [
    { id: 'all', name: 'All Pizzas', icon: '🍕' },
    { id: 'signature', name: 'Signature', icon: '⭐' },
    { id: 'veggie', name: 'Veggie', icon: '🥬' },
    { id: 'specialty', name: 'Specialty', icon: '👨‍🍳' }
  ];

  const filteredPizzas = pizzas.filter(pizza => 
    selectedCategory === 'all' || pizza.category === selectedCategory
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      case 'closed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'OPEN FOR ORDERS';
      case 'busy': return 'BUSY - LONGER WAIT';
      case 'closed': return 'CLOSED';
      default: return 'UNKNOWN';
    }
  };

  const isOrderingAvailable = kitchenStatus?.status !== 'closed';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Status Bar */}
      <div className={`${getStatusColor(kitchenStatus?.status || 'open')} text-white py-2`}>
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <ChefHat className="h-4 w-4" />
            <span className="font-bold">{getStatusText(kitchenStatus?.status || 'open')}</span>
            {kitchenStatus?.status === 'open' && <CheckCircle className="h-4 w-4" />}
          </div>
        </div>
      </div>

      {/* Hero Section - Domino's Style */}
      <div className="bg-gradient-to-br from-red-600 via-orange-600 to-yellow-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight">
              LEMUR EXPRESS
            </h1>
            <p className="text-xl md:text-3xl mb-2 font-bold">
              🍕 PIZZA PERFECTION 🍕
            </p>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Authentic Italian flavors, delivered fast to your door
            </p>
            
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-bold">HOURS</span>
                </div>
                <div className="text-lg font-bold">9:00 PM - 11:00 PM</div>
                <div className="text-sm opacity-80">Daily</div>
              </div>
              
              <div className={`${getStatusColor(kitchenStatus?.status || 'open')} rounded-xl p-4 border-2 border-white/20`}>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <ChefHat className="h-5 w-5" />
                  <span className="font-bold">KITCHEN</span>
                </div>
                <div className="text-lg font-bold">{getStatusText(kitchenStatus?.status || 'open')}</div>
                <div className="text-sm opacity-80">Live Status</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Star className="h-5 w-5" />
                  <span className="font-bold">RATING</span>
                </div>
                <div className="text-lg font-bold">4.8/5.0</div>
                <div className="text-sm opacity-80">2,450+ Reviews</div>
              </div>
            </div>

            {/* Order Now Button */}
            {isOrderingAvailable ? (
              <Link href="/order">
                <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 text-xl px-12 py-6 rounded-full font-black shadow-2xl transform hover:scale-105 transition-all">
                  <ShoppingCart className="mr-2 h-6 w-6" />
                  ORDER NOW
                </Button>
              </Link>
            ) : (
              <div className="bg-red-500/80 text-white px-8 py-4 rounded-full font-bold text-lg">
                🔒 Kitchen Closed - Check Back During Business Hours
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert Bars for Status */}
      {kitchenStatus?.status === 'closed' && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  <strong>Kitchen Closed:</strong> We're currently not taking new orders. 
                  Please check back during business hours (9:00 PM - 11:00 PM).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {kitchenStatus?.status === 'busy' && (
        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChefHat className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  <strong>Kitchen Busy:</strong> We're experiencing high demand. 
                  Orders may take 5-10 minutes longer than usual.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Categories - Pizza Hut Style */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-black text-center mb-8 text-gray-900">
          🍕 OUR MENU 🍕
        </h2>
        
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="lg"
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-full px-6 py-3 font-bold ${
                selectedCategory === category.id 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'border-2 border-red-600 text-red-600 hover:bg-red-50'
              }`}
            >
              <span className="mr-2 text-lg">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Pizza Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPizzas.map(pizza => (
              <Card key={pizza.id} className="overflow-hidden group hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 hover:border-red-300">
                <div className="relative">
                  <img 
                    src={pizza.imageUrl} 
                    alt={pizza.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4 bg-red-600 text-white font-bold">
                    FRESH
                  </Badge>
                  {!isOrderingAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">KITCHEN CLOSED</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-black mb-2 text-gray-900">{pizza.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{pizza.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-red-600">
                      ${pizza.basePrice}
                    </span>
                    {isOrderingAvailable ? (
                      <Link href="/order">
                        <Button className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full px-6">
                          ORDER
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="bg-gray-400 text-white rounded-full px-6">
                        CLOSED
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Location & Contact - Professional Footer */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-red-500 mr-2" />
                <h3 className="text-xl font-bold">LOCATION</h3>
              </div>
              <p className="text-gray-300">123 Pizza Street<br/>Food District, City 12345</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-4">
                <Phone className="h-8 w-8 text-red-500 mr-2" />
                <h3 className="text-xl font-bold">CONTACT</h3>
              </div>
              <p className="text-gray-300">(555) PIZZA-NOW<br/>orders@lemurexpress.com</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-red-500 mr-2" />
                <h3 className="text-xl font-bold">HOURS</h3>
              </div>
              <p className="text-gray-300">Daily: 9:00 PM - 11:00 PM<br/>Pickup Only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}