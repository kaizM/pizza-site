import React, { useMemo } from "react";

interface PhotoRealisticPizzaVisualizerProps {
  size: string;
  crust: string;
  selectedToppings: string[];
  extraToppings: string[];
  doubleCheeseSelected: boolean;
}

interface ToppingPlacement {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

export default function PhotoRealisticPizzaVisualizer({ 
  size, 
  crust, 
  selectedToppings, 
  extraToppings, 
  doubleCheeseSelected 
}: PhotoRealisticPizzaVisualizerProps) {

  // Base pizza images - using real pizza photography URLs
  const getBasePizzaImage = () => {
    if (doubleCheeseSelected) {
      // Extra cheese pizza
      return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop&crop=center";
    } else {
      // Regular cheese pizza
      return "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center";
    }
  };

  // Real food topping images
  const getToppingImage = (toppingName: string): string => {
    const toppingImages: Record<string, string> = {
      "Pepperoni": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=60&h=60&fit=crop&crop=center",
      "Italian Sausage": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=60&h=60&fit=crop&crop=center", 
      "Beef": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=60&h=60&fit=crop&crop=center",
      "Bacon": "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=60&h=60&fit=crop&crop=center",
      "Bell Peppers": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=60&h=60&fit=crop&crop=center",
      "Onions": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=60&h=60&fit=crop&crop=center",
      "Mushrooms": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=60&h=60&fit=crop&crop=center",
      "Black Olives": "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=60&h=60&fit=crop&crop=center",
      "Banana Peppers": "https://images.unsplash.com/photo-1583659117632-b4b1bb2f26a0?w=60&h=60&fit=crop&crop=center",
      "Jalapeños": "https://images.unsplash.com/photo-1544473244-f6895e69ad8b?w=60&h=60&fit=crop&crop=center"
    };
    
    return toppingImages[toppingName] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60&h=60&fit=crop&crop=center";
  };

  // Generate realistic topping placements using pizza slice zones
  const generateToppingPlacements = (toppingName: string, quantity: number): ToppingPlacement[] => {
    const placements: ToppingPlacement[] = [];
    
    // Pizza dimensions as percentages
    const centerX = 50;
    const centerY = 50;
    const maxRadius = 32; // Stay within pizza bounds
    const minRadius = 15;
    
    // Create 8 pizza slice zones for natural distribution
    const slices = 8;
    const toppingsPerSlice = Math.ceil(quantity / slices);
    
    for (let slice = 0; slice < slices; slice++) {
      const sliceAngle = (slice / slices) * 2 * Math.PI;
      
      for (let i = 0; i < toppingsPerSlice && placements.length < quantity; i++) {
        // Random position within slice
        const angleOffset = (Math.random() - 0.5) * (2 * Math.PI / slices * 0.7);
        const angle = sliceAngle + angleOffset;
        
        // Random distance from center
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        // Natural variation
        const rotation = Math.random() * 360;
        const scale = 0.8 + Math.random() * 0.4; // Size variation
        const zIndex = Math.floor(Math.random() * 5) + 10;
        
        placements.push({ x, y, rotation, scale, zIndex });
      }
    }
    
    return placements;
  };

  // Get topping quantities for rendering
  const getToppingQuantities = () => {
    const quantities = new Map<string, number>();
    
    // Base toppings (4-8 pieces each for realistic coverage)
    selectedToppings.forEach(topping => {
      quantities.set(topping, 4 + Math.floor(Math.random() * 5));
    });
    
    // Extra toppings (3-5 additional pieces)
    extraToppings.forEach(topping => {
      const current = quantities.get(topping) || 0;
      quantities.set(topping, current + 3 + Math.floor(Math.random() * 3));
    });
    
    return quantities;
  };

  // Generate stable topping placements (memoized)
  const toppingPlacements = useMemo(() => {
    const quantities = getToppingQuantities();
    const placements = new Map<string, ToppingPlacement[]>();
    
    Array.from(quantities.entries()).forEach(([toppingName, quantity]) => {
      placements.set(toppingName, generateToppingPlacements(toppingName, quantity));
    });
    
    return placements;
  }, [selectedToppings.join(','), extraToppings.join(',')]);

  // Render individual topping as real food image
  const renderToppingImage = (toppingName: string, placement: ToppingPlacement, index: number) => {
    const toppingSize = getToppingSize(toppingName);
    
    return (
      <img
        key={`${toppingName}-${index}`}
        src={getToppingImage(toppingName)}
        alt={toppingName}
        style={{
          position: "absolute",
          left: `${placement.x}%`,
          top: `${placement.y}%`,
          width: `${toppingSize}px`,
          height: `${toppingSize}px`,
          transform: `translate(-50%, -50%) rotate(${placement.rotation}deg) scale(${placement.scale})`,
          zIndex: placement.zIndex,
          borderRadius: getToppingBorderRadius(toppingName),
          opacity: 0.95,
          filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.3))",
          pointerEvents: "none"
        }}
        loading="lazy"
      />
    );
  };

  // Get appropriate size for each topping type
  const getToppingSize = (toppingName: string): number => {
    const sizes: Record<string, number> = {
      "Pepperoni": 24,
      "Italian Sausage": 20,
      "Beef": 18,
      "Bacon": 26,
      "Bell Peppers": 22,
      "Onions": 20,
      "Mushrooms": 19,
      "Black Olives": 16,
      "Banana Peppers": 28,
      "Jalapeños": 18
    };
    return sizes[toppingName] || 20;
  };

  // Get appropriate border radius for topping shape
  const getToppingBorderRadius = (toppingName: string): string => {
    const shapes: Record<string, string> = {
      "Pepperoni": "50%",
      "Italian Sausage": "30%",
      "Beef": "20%",
      "Bacon": "15%",
      "Bell Peppers": "25%",
      "Onions": "40%",
      "Mushrooms": "30%",
      "Black Olives": "50%",
      "Banana Peppers": "20%",
      "Jalapeños": "25%"
    };
    return shapes[toppingName] || "30%";
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Photo-Realistic Pizza */}
      <div className="relative">
        <div
          style={{
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            overflow: "hidden",
            position: "relative",
            boxShadow: "0 8px 25px rgba(0,0,0,0.3)"
          }}
        >
          {/* Base Pizza Photo */}
          <img
            src={getBasePizzaImage()}
            alt="Pizza Base"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 1
            }}
            loading="lazy"
          />
          
          {/* Render Real Food Toppings */}
          {Array.from(toppingPlacements.entries()).map(([toppingName, placements]) => 
            placements.map((placement, index) => 
              renderToppingImage(toppingName, placement, index)
            )
          )}
        </div>
      </div>

      {/* Pizza Info */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-red-700">
          {selectedToppings.length > 0 ? 
            selectedToppings.join(" & ") + " Pizza" : 
            "Cheese Pizza"
          }
        </h3>
        <p className="text-sm text-gray-600 font-medium">{size} Size • {crust} Crust</p>
      </div>

      {/* Toppings Summary */}
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-red-700">
          Your Toppings ({selectedToppings.length + extraToppings.length}/10 free):
        </p>
        <p className="text-sm text-gray-600 max-w-xs leading-relaxed">
          {selectedToppings.length === 0 && extraToppings.length === 0 ? 
            "Just cheese" : 
            [
              ...selectedToppings,
              ...extraToppings.map(t => `Extra ${t}`)
            ].join(", ")
          }
        </p>
      </div>
    </div>
  );
}