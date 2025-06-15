import React from "react";

interface PizzaVisualizerProps {
  size: string;
  crust: string;
  selectedToppings: string[];
  extraToppings: string[];
  doubleCheeseSelected: boolean;
}

interface ToppingPosition {
  x: number;
  y: number;
  rotation: number;
}

export default function PizzaVisualizer({ 
  size, 
  crust, 
  selectedToppings, 
  extraToppings, 
  doubleCheeseSelected 
}: PizzaVisualizerProps) {
  // Generate random positions for toppings
  const generateToppingPositions = (count: number): ToppingPosition[] => {
    const positions: ToppingPosition[] = [];
    const centerX = 150;
    const centerY = 150;
    const radius = 80;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI + Math.random() * 0.5;
      const distance = 20 + Math.random() * radius;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      const rotation = Math.random() * 360;
      
      positions.push({ x, y, rotation });
    }
    return positions;
  };

  // Get topping visual representation
  const getToppingVisual = (topping: string, position: ToppingPosition, index: number) => {
    const baseProps = {
      key: `${topping}-${index}`,
      transform: `translate(${position.x}, ${position.y}) rotate(${position.rotation})`,
      transformOrigin: "center"
    };

    switch (topping) {
      case "Pepperoni":
        return (
          <circle
            {...baseProps}
            r="8"
            fill="#CC3333"
            stroke="#AA2222"
            strokeWidth="1"
          />
        );
      case "Italian Sausage":
        return (
          <ellipse
            {...baseProps}
            rx="6"
            ry="4"
            fill="#8B4513"
            stroke="#654321"
            strokeWidth="1"
          />
        );
      case "Beef":
        return (
          <polygon
            {...baseProps}
            points="-5,-3 5,-3 4,3 -4,3"
            fill="#654321"
            stroke="#543020"
            strokeWidth="1"
          />
        );
      case "Bacon":
        return (
          <rect
            {...baseProps}
            x="-6"
            y="-2"
            width="12"
            height="4"
            rx="1"
            fill="#D2691E"
            stroke="#A0522D"
            strokeWidth="1"
          />
        );
      case "Bell Peppers":
        return (
          <polygon
            {...baseProps}
            points="-4,-4 4,-4 3,4 -3,4"
            fill="#228B22"
            stroke="#006400"
            strokeWidth="1"
          />
        );
      case "Onions":
        return (
          <ellipse
            {...baseProps}
            rx="5"
            ry="3"
            fill="#F5F5DC"
            stroke="#E6E6FA"
            strokeWidth="1"
            opacity="0.8"
          />
        );
      case "Mushrooms":
        return (
          <path
            {...baseProps}
            d="M-4,2 Q-4,-2 0,-3 Q4,-2 4,2 L2,3 L-2,3 Z"
            fill="#8B7355"
            stroke="#696969"
            strokeWidth="1"
          />
        );
      case "Black Olives":
        return (
          <ellipse
            {...baseProps}
            rx="3"
            ry="4"
            fill="#2F2F2F"
            stroke="#1C1C1C"
            strokeWidth="1"
          />
        );
      case "Banana Peppers":
        return (
          <ellipse
            {...baseProps}
            rx="8"
            ry="3"
            fill="#FFFF00"
            stroke="#DAA520"
            strokeWidth="1"
          />
        );
      case "Jalapeños":
        return (
          <ellipse
            {...baseProps}
            rx="6"
            ry="2"
            fill="#32CD32"
            stroke="#228B22"
            strokeWidth="1"
          />
        );
      default:
        return (
          <circle
            {...baseProps}
            r="4"
            fill="#FF6347"
            stroke="#FF4500"
            strokeWidth="1"
          />
        );
    }
  };

  // Combine all toppings
  const allToppings = [...selectedToppings, ...extraToppings];
  const toppingPositions = generateToppingPositions(allToppings.length * 3);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Pizza Visual */}
      <div className="relative">
        <svg width="300" height="300" viewBox="0 0 300 300" className="drop-shadow-lg">
          {/* Pizza Crust */}
          <circle
            cx="150"
            cy="150"
            r="145"
            fill={crust === "Thin" ? "#DEB887" : "#CD853F"}
            stroke="#8B4513"
            strokeWidth="3"
          />
          
          {/* Pizza Base/Sauce */}
          <circle
            cx="150"
            cy="150"
            r="130"
            fill="#B22222"
          />
          
          {/* Cheese Layer */}
          <circle
            cx="150"
            cy="150"
            r="125"
            fill={doubleCheeseSelected ? "#FFD700" : "#FFFFE0"}
            opacity={doubleCheeseSelected ? "0.9" : "0.8"}
          />
          
          {/* Extra Cheese Pattern if selected */}
          {doubleCheeseSelected && (
            <>
              <circle cx="120" cy="120" r="8" fill="#FFD700" opacity="0.7" />
              <circle cx="180" cy="130" r="6" fill="#FFD700" opacity="0.7" />
              <circle cx="140" cy="180" r="7" fill="#FFD700" opacity="0.7" />
              <circle cx="170" cy="170" r="5" fill="#FFD700" opacity="0.7" />
              <circle cx="130" cy="150" r="6" fill="#FFD700" opacity="0.7" />
            </>
          )}
          
          {/* Toppings */}
          {allToppings.map((topping, index) => {
            const positions = toppingPositions.slice(index * 3, (index + 1) * 3);
            return positions.map((position, posIndex) => 
              getToppingVisual(topping, position, index * 3 + posIndex)
            );
          })}
        </svg>
      </div>

      {/* Pizza Info */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-red-700">
          {selectedToppings.length > 0 ? selectedToppings.join(" ") : "Cheese"}
        </h3>
        <p className="text-sm text-gray-600">{size} Size</p>
        <p className="text-sm text-gray-600">{crust} Crust</p>
      </div>

      {/* Toppings List */}
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-red-700">
          Your Toppings ({allToppings.length}/10 free):
        </p>
        <p className="text-sm text-gray-600">
          {allToppings.length > 0 ? allToppings.join(", ") : "Just cheese"}
        </p>
      </div>
    </div>
  );
}