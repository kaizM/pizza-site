import { useEffect } from "react";
import { useLocation } from "wouter";
import EmployeeDashboard from "@/components/EmployeeDashboard";
import { useSimpleAuth } from "@/components/SimpleAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, AlertCircle } from "lucide-react";

export default function EmployeePage() {
  const { user, isAuthenticated, isEmployee, isAdmin } = useSimpleAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Restricted</h1>
            <p className="text-gray-600 mb-6">Please sign in to access the employee dashboard</p>
            <Button onClick={() => setLocation('/')} className="bg-red-600 hover:bg-red-700">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isEmployee && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <ChefHat className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Employee Access Only</h1>
            <p className="text-gray-600 mb-2">This area is restricted to kitchen staff and administrators</p>
            <p className="text-sm text-gray-500 mb-6">Current user: {user?.name} ({user?.role})</p>
            <Button onClick={() => setLocation('/')} className="bg-red-600 hover:bg-red-700">
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <EmployeeDashboard />;
}