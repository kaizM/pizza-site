import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { ReactNode } from "react";

interface PhoneButtonProps {
  children: ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  showIcon?: boolean;
}

export default function PhoneButton({ 
  children, 
  className = "", 
  size = "default",
  variant = "default",
  showIcon = true 
}: PhoneButtonProps) {
  const phoneNumber = "+1-361-403-0083";
  
  const handlePhoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Try multiple methods for maximum compatibility
    try {
      // Method 1: Direct window.location assignment
      window.location.href = `tel:${phoneNumber}`;
    } catch (error) {
      try {
        // Method 2: Create and click a temporary link
        const link = document.createElement('a');
        link.href = `tel:${phoneNumber}`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error2) {
        // Method 3: Copy number to clipboard as fallback
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText("(361) 403-0083").then(() => {
            alert("Phone number copied to clipboard: (361) 403-0083");
          });
        } else {
          // Method 4: Show alert with number
          alert("Please call: (361) 403-0083");
        }
      }
    }
  };

  return (
    <div className="relative">
      {/* Primary button with tel: link */}
      <a 
        href={`tel:${phoneNumber}`}
        className="inline-block"
        role="button"
        aria-label="Call Hunt Brothers Pizza at 361-403-0083"
        onClick={handlePhoneClick}
        style={{ 
          WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)'
        } as React.CSSProperties}
      >
        <Button 
          className={className}
          size={size}
          variant={variant}
          type="button"
        >
          {showIcon && <Phone className="h-4 w-4 mr-1" />}
          {children}
        </Button>
      </a>
      
      {/* Hidden fallback link for iOS compatibility */}
      <a 
        href={`tel:${phoneNumber}`}
        className="absolute inset-0 opacity-0 pointer-events-none"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}