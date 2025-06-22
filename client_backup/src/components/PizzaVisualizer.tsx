import React from "react";

interface PizzaVisualizerProps {
  size: string;
  crust: string;
  selectedToppings: string[];
  extraToppings: string[];
  doubleCheeseSelected: boolean;
}

interface ToppingSpot {
  x: number;
  y: number;
  rotation: number;
  size: number;
  opacity: number;
}

export default function PizzaVisualizer({ 
  size, 
  crust, 
  selectedToppings, 
  extraToppings, 
  doubleCheeseSelected 
}: PizzaVisualizerProps) {
  
  // Generate realistic topping distribution using pizza slice zones
  const generateToppingSpots = (toppingName: string, quantity: number): ToppingSpot[] => {
    const spots: ToppingSpot[] = [];
    const centerX = 150;
    const centerY = 150;
    const minRadius = 30;
    const maxRadius = 110;
    
    // Divide pizza into 8 slices for natural distribution
    const slices = 8;
    const spotsPerSlice = Math.ceil(quantity / slices);
    
    for (let slice = 0; slice < slices; slice++) {
      const sliceAngle = (slice / slices) * 2 * Math.PI;
      
      for (let spot = 0; spot < spotsPerSlice && spots.length < quantity; spot++) {
        // Random position within slice
        const angleOffset = (Math.random() - 0.5) * (2 * Math.PI / slices * 0.8);
        const angle = sliceAngle + angleOffset;
        
        // Random distance from center
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        // Natural variation
        const baseSize = getToppingSize(toppingName);
        const size = baseSize * (0.7 + Math.random() * 0.6);
        const rotation = Math.random() * 360;
        const opacity = 0.8 + Math.random() * 0.2;
        
        spots.push({ x, y, rotation, size, opacity });
      }
    }
    
    return spots;
  };

  const getToppingSize = (toppingName: string): number => {
    const sizes: Record<string, number> = {
      "Pepperoni": 10,
      "Italian Sausage": 7,
      "Beef": 8,
      "Bacon": 12,
      "Bell Peppers": 11,
      "Onions": 9,
      "Mushrooms": 8,
      "Black Olives": 6,
      "Banana Peppers": 13,
      "Jalapeños": 7
    };
    return sizes[toppingName] || 8;
  };

  const renderTopping = (toppingName: string, spot: ToppingSpot, index: number) => {
    const key = `${toppingName}-${index}`;
    
    const commonProps = {
      key,
      opacity: spot.opacity,
      style: { transformOrigin: 'center' }
    };

    switch (toppingName) {
      case "Pepperoni":
        return (
          <g {...commonProps}>
            {/* Main pepperoni circle */}
            <circle
              cx={spot.x}
              cy={spot.y}
              r={spot.size}
              fill="#B22222"
              stroke="#8B0000"
              strokeWidth="0.5"
            />
            {/* Highlight for realism */}
            <circle
              cx={spot.x - spot.size * 0.3}
              cy={spot.y - spot.size * 0.3}
              r={spot.size * 0.2}
              fill="#CD5C5C"
              opacity="0.7"
            />
          </g>
        );

      case "Italian Sausage":
        return (
          <g {...commonProps}>
            <ellipse
              cx={spot.x}
              cy={spot.y}
              rx={spot.size * 0.9}
              ry={spot.size * 0.6}
              fill="#8B4513"
              stroke="#654321"
              strokeWidth="0.5"
              transform={`rotate(${spot.rotation} ${spot.x} ${spot.y})`}
            />
          </g>
        );

      case "Beef":
        return (
          <g {...commonProps}>
            <polygon
              points={`${spot.x - spot.size * 0.7},${spot.y - spot.size * 0.4} ${spot.x + spot.size * 0.7},${spot.y - spot.size * 0.4} ${spot.x + spot.size * 0.5},${spot.y + spot.size * 0.4} ${spot.x - spot.size * 0.5},${spot.y + spot.size * 0.4}`}
              fill="#654321"
              stroke="#543020"
              strokeWidth="0.5"
              transform={`rotate(${spot.rotation} ${spot.x} ${spot.y})`}
            />
          </g>
        );

      case "Bacon":
        return (
          <g {...commonProps}>
            <rect
              x={spot.x - spot.size * 0.9}
              y={spot.y - spot.size * 0.25}
              width={spot.size * 1.8}
              height={spot.size * 0.5}
              rx={spot.size * 0.1}
              fill="#D2691E"
              stroke="#A0522D"
              strokeWidth="0.5"
              transform={`rotate(${spot.rotation} ${spot.x} ${spot.y})`}
            />
            {/* Bacon fat streaks */}
            <rect
              x={spot.x - spot.size * 0.6}
              y={spot.y - spot.size * 0.1}
              width={spot.size * 0.4}
              height={spot.size * 0.2}
              fill="#CD853F"
              opacity="0.8"
              transform={`rotate(${spot.rotation} ${spot.x} ${spot.y})`}
            />
          </g>
        );

      case "Bell Peppers":
        return (
          <g {...commonProps}>
            <polygon
              points={`${spot.x - spot.size * 0.5},${spot.y - spot.size * 0.6} ${spot.x + spot.size * 0.5},${spot.y - spot.size * 0.6} ${spot.x + spot.size * 0.4},${spot.y + spot.size * 0.6} ${spot.x - spot.size * 0.4},${spot.y + spot.size * 0.6}`}
              fill="#228B22"
              stroke="#006400"
              strokeWidth="0.5"
              transform={`rotate(${spot.rotation} ${spot.x} ${spot.y})`}
            />
          </g>
        );

      case "Onions":
        return (
          <g {...commonProps}>
            <ellipse
              cx={spot.x}
              cy={spot.y}
              rx={spot.size * 0.7}
              ry={spot.size * 0.5}
              fill="#F5F5DC"
              stroke="#E6E6FA"
              strokeWidth="0.5"
              opacity="0.85"
              transform={`rotate(${spot.rotation} ${spot.x} ${spot.y})`}
            />
          </g>
        );

      case "Mushrooms":
        return (
          <g {...commonProps}>
            {/* Mushroom cap */}
            <path
              d={`M ${spot.x - spot.size * 0.5} ${spot.y + spot.size * 0.3} 
                  Q ${spot.x - spot.size * 0.5} ${spot.y - spot.size * 0.3} 
                    ${spot.x} ${spot.y - spot.size * 0.4} 
                  Q ${spot.x + spot.size * 0.5} ${spot.y - spot.size * 0.3} 
                    ${spot.x + spot.size * 0.5} ${spot.y + spot.size * 0.3} 
                  L ${spot.x + spot.size * 0.3} ${spot.y + spot.size * 0.4} 
                  L ${spot.x - spot.size * 0.3} ${spot.y + spot.size * 0.4} Z`}
              fill="#8B7355"
              stroke="#696969"
              strokeWidth="0.5"
              transform={`rotate(${spot.rotation} ${spot.x} ${spot.y})`}
            />
          </g>
        );

      case "Black Olives":
        return (
          <g {...commonProps}>
            <ellipse
              cx={spot.x}
              cy={spot.y}
              rx={spot.size * 0.5}
              ry={spot.size * 0.7}
              fill="#2F2F2F"
              stroke="#1C1C1C"
              strokeWidth="0.5"
              transform={`rotate(${spot.rotation} ${spot.x} ${spot.y})`}
            />
            {/* Hole in center */}
            <ellipse
              cx={spot.x}
              cy={spot.y}
              rx={spot.size * 0.18}
              ry={spot.size * 0.25}
              fill="#4A4A4A"
            />
          </g>
        );

      case "Banana Peppers":
        return (
          <g {...commonProps}>
            <ellipse
              cx={spot.x}
              cy={spot.y}
              rx={spot.size * 0.9}
              ry={spot.size * 0.3}
              fill="#FFFF00"
              stroke="#DAA520"
              strokeWidth="0.5"
              transform={`rotate(${spot.rotation} ${spot.x} ${spot.y})`}
            />
          </g>
        );

      case "Jalapeños":
        return (
          <g {...commonProps}>
            <ellipse
              cx={spot.x}
              cy={spot.y}
              rx={spot.size * 0.7}
              ry={spot.size * 0.25}
              fill="#32CD32"
              stroke="#228B22"
              strokeWidth="0.5"
              transform={`rotate(${spot.rotation} ${spot.x} ${spot.y})`}
            />
          </g>
        );

      default:
        return (
          <circle
            {...commonProps}
            cx={spot.x}
            cy={spot.y}
            r={spot.size * 0.5}
            fill="#FF6347"
            stroke="#FF4500"
            strokeWidth="0.5"
          />
        );
    }
  };

  // Calculate topping quantities
  const getToppingsToRender = () => {
    const toppingsMap = new Map<string, number>();
    
    // Base toppings (6-10 pieces each)
    selectedToppings.forEach(topping => {
      toppingsMap.set(topping, 6 + Math.floor(Math.random() * 5));
    });
    
    // Extra toppings (4-6 additional pieces)
    extraToppings.forEach(topping => {
      const current = toppingsMap.get(topping) || 0;
      toppingsMap.set(topping, current + 4 + Math.floor(Math.random() * 3));
    });
    
    return toppingsMap;
  };

  const toppingsToRender = getToppingsToRender();

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Professional Pizza Visual */}
      <div className="relative">
        <svg width="300" height="300" viewBox="0 0 300 300" className="drop-shadow-lg">
          {/* Pizza Shadow */}
          <circle
            cx="152"
            cy="152"
            r="142"
            fill="rgba(0,0,0,0.15)"
          />
          
          {/* Pizza Crust */}
          <circle
            cx="150"
            cy="150"
            r="140"
            fill={crust === "Thin" ? "#D2B48C" : "#DEB887"}
            stroke="#B8860B"
            strokeWidth="2"
          />
          
          {/* Crust edge texture */}
          <circle
            cx="150"
            cy="150"
            r="138"
            fill="none"
            stroke={crust === "Thin" ? "#CD853F" : "#DAA520"}
            strokeWidth="1"
            opacity="0.6"
          />
          
          {/* Pizza Sauce Base */}
          <circle
            cx="150"
            cy="150"
            r="125"
            fill="#B22222"
          />
          
          {/* Sauce texture rings */}
          <circle
            cx="150"
            cy="150"
            r="120"
            fill="none"
            stroke="#8B0000"
            strokeWidth="0.5"
            opacity="0.4"
          />
          <circle
            cx="150"
            cy="150"
            r="115"
            fill="none"
            stroke="#8B0000"
            strokeWidth="0.3"
            opacity="0.3"
          />
          
          {/* Base Cheese Layer */}
          <circle
            cx="150"
            cy="150"
            r="120"
            fill="#FFF8DC"
            opacity="0.95"
          />
          
          {/* Cheese bubble texture */}
          {Array.from({length: 15}).map((_, i) => {
            const angle = (i / 15) * 2 * Math.PI + Math.random() * 0.5;
            const radius = 40 + Math.random() * 60;
            const x = 150 + Math.cos(angle) * radius;
            const y = 150 + Math.sin(angle) * radius;
            return (
              <circle
                key={`cheese-bubble-${i}`}
                cx={x}
                cy={y}
                r={2 + Math.random() * 3}
                fill="#FFFFE0"
                opacity="0.5"
              />
            );
          })}
          
          {/* Double Cheese Layer */}
          {doubleCheeseSelected && (
            <>
              <circle
                cx="150"
                cy="150"
                r="118"
                fill="#FFD700"
                opacity="0.4"
              />
              {Array.from({length: 10}).map((_, i) => {
                const angle = (i / 10) * 2 * Math.PI;
                const radius = 30 + Math.random() * 70;
                const x = 150 + Math.cos(angle) * radius;
                const y = 150 + Math.sin(angle) * radius;
                return (
                  <circle
                    key={`extra-cheese-${i}`}
                    cx={x}
                    cy={y}
                    r={3 + Math.random() * 4}
                    fill="#FFD700"
                    opacity="0.7"
                  />
                );
              })}
            </>
          )}
          
          {/* Render Toppings */}
          {Array.from(toppingsToRender.entries()).map(([toppingName, quantity]) => {
            const spots = generateToppingSpots(toppingName, quantity);
            return spots.map((spot, index) => renderTopping(toppingName, spot, index));
          })}
        </svg>
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