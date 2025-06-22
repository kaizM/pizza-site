import React, { useMemo } from "react";

interface RealisticPizzaVisualizerProps {
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

export default function RealisticPizzaVisualizer({ 
  size, 
  crust, 
  selectedToppings, 
  extraToppings, 
  doubleCheeseSelected 
}: RealisticPizzaVisualizerProps) {
  
  // Generate realistic topping placements using pizza slice zones
  const generateToppingPlacements = (toppingName: string, quantity: number): ToppingPlacement[] => {
    const placements: ToppingPlacement[] = [];
    const centerX = 50; // Percentage
    const centerY = 50; // Percentage
    const maxRadius = 35; // Percentage from center
    const minRadius = 12; // Percentage from center
    
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
        const scale = 0.7 + Math.random() * 0.6;
        const zIndex = Math.floor(Math.random() * 10) + 10; // Above base pizza
        
        placements.push({ x, y, rotation, scale, zIndex });
      }
    }
    
    return placements;
  };

  // Create CSS background for base pizza with proper crust and cheese
  const getBasePizzaStyle = () => {
    // Use CSS gradients to create realistic pizza base
    const crustColor = crust === "Thin" ? "#D2B48C" : "#DEB887";
    const cheeseColor = doubleCheeseSelected ? "#FFD700" : "#FFF8DC";
    
    return {
      background: `
        radial-gradient(circle at 50% 50%, 
          ${cheeseColor} 0%, 
          ${cheeseColor} 60%, 
          #B22222 62%, 
          #B22222 75%, 
          ${crustColor} 77%, 
          ${crustColor} 100%
        )
      `,
      borderRadius: "50%",
      position: "relative" as const,
      width: "300px",
      height: "300px",
      boxShadow: "0 8px 25px rgba(0,0,0,0.3), inset 0 0 0 3px rgba(184,134,11,0.8)"
    };
  };

  // Get topping quantities
  const getToppingQuantities = () => {
    const quantities = new Map<string, number>();
    
    // Base toppings (6-12 pieces each)
    selectedToppings.forEach(topping => {
      quantities.set(topping, 6 + Math.floor(Math.random() * 7));
    });
    
    // Extra toppings (4-8 additional pieces)
    extraToppings.forEach(topping => {
      const current = quantities.get(topping) || 0;
      quantities.set(topping, current + 4 + Math.floor(Math.random() * 5));
    });
    
    return quantities;
  };

  // Generate stable topping placements (memoized so they don't change on re-render)
  const toppingPlacements = useMemo(() => {
    const quantities = getToppingQuantities();
    const placements = new Map<string, ToppingPlacement[]>();
    
    Array.from(quantities.entries()).forEach(([toppingName, quantity]) => {
      placements.set(toppingName, generateToppingPlacements(toppingName, quantity));
    });
    
    return placements;
  }, [selectedToppings.join(','), extraToppings.join(',')]);

  // Render individual topping using CSS styling to look realistic
  const renderTopping = (toppingName: string, placement: ToppingPlacement, index: number) => {
    const toppingStyles: Record<string, React.CSSProperties> = {
      "Pepperoni": {
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        background: "radial-gradient(circle at 30% 30%, #CD5C5C 0%, #B22222 60%, #8B0000 100%)",
        boxShadow: "inset 0 0 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.3)"
      },
      "Italian Sausage": {
        width: "18px",
        height: "12px",
        borderRadius: "40%",
        background: "linear-gradient(45deg, #8B4513 0%, #654321 50%, #543020 100%)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.3)"
      },
      "Beef": {
        width: "16px",
        height: "10px",
        borderRadius: "20%",
        background: "linear-gradient(45deg, #654321 0%, #543020 50%, #3D2F1F 100%)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.3)"
      },
      "Bacon": {
        width: "24px",
        height: "8px",
        borderRadius: "4px",
        background: "linear-gradient(90deg, #D2691E 0%, #CD853F 30%, #D2691E 60%, #A0522D 100%)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.3)"
      },
      "Bell Peppers": {
        width: "14px",
        height: "16px",
        borderRadius: "30%",
        background: "linear-gradient(45deg, #228B22 0%, #32CD32 50%, #006400 100%)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.2)"
      },
      "Onions": {
        width: "16px",
        height: "12px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,245,220,0.9) 0%, rgba(230,230,250,0.7) 100%)",
        border: "1px solid rgba(200,200,200,0.5)",
        boxShadow: "0 1px 1px rgba(0,0,0,0.1)"
      },
      "Mushrooms": {
        width: "15px",
        height: "12px",
        borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
        background: "radial-gradient(ellipse at 30% 30%, #A0824A 0%, #8B7355 60%, #696969 100%)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.3)"
      },
      "Black Olives": {
        width: "12px",
        height: "16px",
        borderRadius: "50%",
        background: "radial-gradient(circle at 30% 30%, #4A4A4A 0%, #2F2F2F 60%, #1C1C1C 100%)",
        boxShadow: "inset 0 0 2px rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.4)"
      },
      "Banana Peppers": {
        width: "22px",
        height: "6px",
        borderRadius: "3px",
        background: "linear-gradient(90deg, #FFFF00 0%, #FFD700 50%, #DAA520 100%)",
        boxShadow: "0 1px 1px rgba(0,0,0,0.2)"
      },
      "Jalapeños": {
        width: "16px",
        height: "6px",
        borderRadius: "3px",
        background: "linear-gradient(90deg, #32CD32 0%, #228B22 50%, #006400 100%)",
        boxShadow: "0 1px 1px rgba(0,0,0,0.2)"
      }
    };

    const baseStyle = toppingStyles[toppingName] || {
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      background: "#FF6347",
      boxShadow: "0 1px 2px rgba(0,0,0,0.3)"
    };

    return (
      <div
        key={`${toppingName}-${index}`}
        style={{
          position: "absolute",
          left: `${placement.x}%`,
          top: `${placement.y}%`,
          transform: `translate(-50%, -50%) rotate(${placement.rotation}deg) scale(${placement.scale})`,
          zIndex: placement.zIndex,
          ...baseStyle
        }}
      />
    );
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Realistic Pizza Visual */}
      <div className="relative">
        <div style={getBasePizzaStyle()}>
          {/* Cheese texture overlay */}
          <div
            style={{
              position: "absolute",
              top: "15%",
              left: "15%",
              right: "15%",
              bottom: "15%",
              borderRadius: "50%",
              background: doubleCheeseSelected 
                ? "radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,248,220,0.2) 100%)"
                : "radial-gradient(circle, rgba(255,248,220,0.3) 0%, transparent 100%)",
              pointerEvents: "none"
            }}
          />
          
          {/* Cheese bubbles for texture */}
          {Array.from({length: doubleCheeseSelected ? 8 : 5}).map((_, i) => (
            <div
              key={`cheese-bubble-${i}`}
              style={{
                position: "absolute",
                width: `${4 + Math.random() * 6}px`,
                height: `${4 + Math.random() * 6}px`,
                borderRadius: "50%",
                background: doubleCheeseSelected ? "#FFD700" : "#FFFFE0",
                opacity: 0.6,
                left: `${25 + Math.random() * 50}%`,
                top: `${25 + Math.random() * 50}%`,
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 2px rgba(0,0,0,0.2)"
              }}
            />
          ))}
          
          {/* Render Toppings */}
          {Array.from(toppingPlacements.entries()).map(([toppingName, placements]) => 
            placements.map((placement, index) => 
              renderTopping(toppingName, placement, index)
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