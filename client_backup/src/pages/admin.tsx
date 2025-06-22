import { useState } from "react";
import AdminDashboard from "@/components/AdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Simple admin password
  const ADMIN_PASSWORD = "admin123";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simple delay to simulate authentication
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: "Access Granted",
        description: "Welcome to the admin dashboard",
        variant: "success",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Admin Access</CardTitle>
            <p className="text-gray-600">Enter password to access management dashboard</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">Hint: admin123</p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
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

  return <AdminDashboard />;
}
