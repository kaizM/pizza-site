import React, { useMemo } from "react";

interface WorkingPizzaVisualizerProps {
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
}

export default function WorkingPizzaVisualizer({ 
  size, 
  crust, 
  selectedToppings, 
  extraToppings, 
  doubleCheeseSelected 
}: WorkingPizzaVisualizerProps) {

  // Generate realistic topping placements using pizza slice zones
  const generateToppingPlacements = (quantity: number): ToppingPlacement[] => {
    const placements: ToppingPlacement[] = [];
    const centerX = 50;
    const centerY = 50;
    const maxRadius = 32;
    const minRadius = 15;
    
    // 8 pizza slices for natural distribution
    const slices = 8;
    const toppingsPerSlice = Math.ceil(quantity / slices);
    
    for (let slice = 0; slice < slices; slice++) {
      const sliceAngle = (slice / slices) * 2 * Math.PI;
      
      for (let i = 0; i < toppingsPerSlice && placements.length < quantity; i++) {
        const angleOffset = (Math.random() - 0.5) * (2 * Math.PI / slices * 0.7);
        const angle = sliceAngle + angleOffset;
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        const rotation = Math.random() * 360;
        const scale = 0.8 + Math.random() * 0.4;
        
        placements.push({ x, y, rotation, scale });
      }
    }
    
    return placements;
  };

  // Get CSS styles for realistic food toppings
  const getToppingStyle = (toppingName: string, placement: ToppingPlacement): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: `${placement.x}%`,
      top: `${placement.y}%`,
      transform: `translate(-50%, -50%) rotate(${placement.rotation}deg) scale(${placement.scale})`,
      borderRadius: "50%",
      boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
      zIndex: 10
    };

    switch (toppingName) {
      case "Pepperoni":
        return {
          ...baseStyle,
          width: "22px",
          height: "22px",
          background: "radial-gradient(circle at 30% 30%, #DC143C 0%, #B22222 40%, #8B0000 100%)",
          border: "1px solid #8B0000"
        };
        
      case "Italian Sausage":
        return {
          ...baseStyle,
          width: "18px",
          height: "14px",
          borderRadius: "40%",
          background: "linear-gradient(45deg, #8B4513 0%, #654321 50%, #543020 100%)",
          border: "1px solid #543020"
        };
        
      case "Beef":
        return {
          ...baseStyle,
          width: "16px",
          height: "12px",
          borderRadius: "30%",
          background: "linear-gradient(45deg, #654321 0%, #543020 50%, #3D2F1F 100%)",
          border: "1px solid #3D2F1F"
        };
        
      case "Bacon":
        return {
          ...baseStyle,
          width: "24px",
          height: "8px",
          borderRadius: "4px",
          background: "linear-gradient(90deg, #D2691E 0%, #CD853F 30%, #D2691E 60%, #A0522D 100%)",
          border: "1px solid #A0522D"
        };
        
      case "Bell Peppers":
        return {
          ...baseStyle,
          width: "16px",
          height: "14px",
          borderRadius: "30%",
          background: "linear-gradient(45deg, #228B22 0%, #32CD32 50%, #006400 100%)",
          border: "1px solid #006400"
        };
        
      case "Onions":
        return {
          ...baseStyle,
          width: "18px",
          height: "14px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,245,220,0.9) 0%, rgba(230,230,250,0.8) 100%)",
          border: "1px solid rgba(200,200,200,0.6)"
        };
        
      case "Mushrooms":
        return {
          ...baseStyle,
          width: "16px",
          height: "14px",
          borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          background: "radial-gradient(ellipse at 30% 30%, #A0824A 0%, #8B7355 60%, #696969 100%)",
          border: "1px solid #696969"
        };
        
      case "Black Olives":
        return {
          ...baseStyle,
          width: "12px",
          height: "16px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 30% 30%, #4A4A4A 0%, #2F2F2F 60%, #1C1C1C 100%)",
          border: "1px solid #1C1C1C"
        };
        
      case "Banana Peppers":
        return {
          ...baseStyle,
          width: "20px",
          height: "6px",
          borderRadius: "3px",
          background: "linear-gradient(90deg, #FFFF00 0%, #FFD700 50%, #DAA520 100%)",
          border: "1px solid #DAA520"
        };
        
      case "Jalapeños":
        return {
          ...baseStyle,
          width: "14px",
          height: "6px",
          borderRadius: "3px",
          background: "linear-gradient(90deg, #32CD32 0%, #228B22 50%, #006400 100%)",
          border: "1px solid #006400"
        };
        
      default:
        return {
          ...baseStyle,
          width: "14px",
          height: "14px",
          background: "#FF6347",
          border: "1px solid #FF4500"
        };
    }
  };

  // Generate stable topping quantities and placements
  const toppingsData = useMemo(() => {
    const data = new Map<string, ToppingPlacement[]>();
    
    // Base toppings (5-8 pieces each)
    selectedToppings.forEach(topping => {
      const quantity = 5 + Math.floor(Math.random() * 4);
      data.set(topping, generateToppingPlacements(quantity));
    });
    
    // Extra toppings (3-5 additional pieces)
    extraToppings.forEach(topping => {
      const existing = data.get(topping) || [];
      const additionalQuantity = 3 + Math.floor(Math.random() * 3);
      const additionalPlacements = generateToppingPlacements(additionalQuantity);
      data.set(topping, [...existing, ...additionalPlacements]);
    });
    
    return data;
  }, [selectedToppings.join(','), extraToppings.join(',')]);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Realistic Pizza Visual */}
      <div className="relative">
        <div
          style={{
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            position: "relative",
            // Realistic pizza base using CSS gradients
            background: `
              radial-gradient(circle at 50% 50%, 
                ${doubleCheeseSelected ? '#FFD700' : '#FFF8DC'} 0%, 
                ${doubleCheeseSelected ? '#FFD700' : '#FFF8DC'} 65%, 
                #B22222 67%, 
                #B22222 80%, 
                ${crust === "Thin" ? '#D2B48C' : '#DEB887'} 82%, 
                ${crust === "Thin" ? '#CD853F' : '#DAA520'} 100%
              )
            `,
            boxShadow: "0 8px 25px rgba(0,0,0,0.3), inset 0 0 0 3px rgba(184,134,11,0.8)"
          }}
        >
          {/* Cheese texture bubbles */}
          {Array.from({length: doubleCheeseSelected ? 12 : 8}).map((_, i) => (
            <div
              key={`cheese-bubble-${i}`}
              style={{
                position: "absolute",
                width: `${3 + Math.random() * 5}px`,
                height: `${3 + Math.random() * 5}px`,
                borderRadius: "50%",
                background: doubleCheeseSelected ? "#FFD700" : "#FFFFE0",
                opacity: 0.6,
                left: `${25 + Math.random() * 50}%`,
                top: `${25 + Math.random() * 50}%`,
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 2px rgba(0,0,0,0.2)",
                zIndex: 5
              }}
            />
          ))}
          
          {/* Render Food Toppings */}
          {Array.from(toppingsData.entries()).map(([toppingName, placements]) => 
            placements.map((placement, index) => (
              <div
                key={`${toppingName}-${index}`}
                style={getToppingStyle(toppingName, placement)}
              />
            ))
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