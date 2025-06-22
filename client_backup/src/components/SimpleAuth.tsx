import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, User, Lock, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  role: "customer" | "employee" | "admin";
  name: string;
}

interface SimpleAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

// Default test accounts
const testAccounts = [
  { id: "1", username: "customer", password: "customer123", role: "customer" as const, name: "Test Customer" },
  { id: "2", username: "employee", password: "employee123", role: "employee" as const, name: "Kitchen Staff" },
  { id: "3", username: "admin", password: "admin123", role: "admin" as const, name: "Manager" },
  { id: "4", username: "demo", password: "demo", role: "customer" as const, name: "Demo User" }
];

export default function SimpleAuth({ isOpen, onClose, onLogin }: SimpleAuthProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const account = testAccounts.find(
      acc => acc.username === username && acc.password === password
    );

    if (account) {
      const user: User = {
        id: account.id,
        username: account.username,
        role: account.role,
        name: account.name
      };
      
      // Store in localStorage for persistence
      localStorage.setItem("currentUser", JSON.stringify(user));
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${account.name}!`,
        variant: "success",
      });
      
      onLogin(user);
      onClose();
      
      // Clear form
      setUsername("");
      setPassword("");
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const quickLogin = (account: typeof testAccounts[0]) => {
    setUsername(account.username);
    setPassword(account.password);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Sign In
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Test Accounts Info */}
          <Alert>
            <AlertDescription>
              <div className="text-sm">
                <strong>Test Accounts:</strong>
                <div className="mt-2 space-y-1">
                  {testAccounts.map((account) => (
                    <div key={account.id} className="flex justify-between items-center">
                      <span className="text-xs">
                        {account.username} / {account.password} ({account.role})
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => quickLogin(account)}
                        className="text-xs h-6 px-2"
                      >
                        Use
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  Sign In
                </div>
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Auth Context Hook
export function useSimpleAuth() {
  const [user, setUser] = useState<User | null>(() => {
    // Check localStorage on initialization
    try {
      const stored = localStorage.getItem("currentUser");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn("Failed to parse user data from localStorage:", error);
      localStorage.removeItem("currentUser");
      return null;
    }
  });

  const login = (userData: User) => {
    setUser(userData);
    try {
      localStorage.setItem("currentUser", JSON.stringify(userData));
    } catch (error) {
      console.warn("Failed to save user data to localStorage:", error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const isEmployee = user?.role === "employee";
  const isCustomer = user?.role === "customer";

  return {
    user,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isEmployee,
    isCustomer
  };
}