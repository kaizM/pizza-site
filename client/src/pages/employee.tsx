import { useState } from "react";
import EmployeeDashboard from "@/components/EmployeeDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EmployeePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Employee credentials for testing phase
  const EMPLOYEE_CREDENTIALS = {
    username: "admin",
    password: "1234"
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (username === EMPLOYEE_CREDENTIALS.username && password === EMPLOYEE_CREDENTIALS.password) {
      setIsAuthenticated(true);
      toast({
        title: "Access Granted",
        description: "Welcome to the employee dashboard",
        variant: "default",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto h-20 w-20 bg-orange-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <User className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Employee Access</CardTitle>
            <p className="text-gray-600">Lemur Express 11 - Staff Portal</p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">Testing Credentials:</p>
              <p className="text-xs text-blue-600 mt-1">Username: admin | Password: 1234</p>
            </div>
          </CardHeader>
          <CardContent>
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
                  className="h-12"
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
                    className="h-12 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Access Dashboard
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <EmployeeDashboard />;
}