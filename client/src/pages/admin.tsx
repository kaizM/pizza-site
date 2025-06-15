import { useEffect } from "react";
import { useLocation } from "wouter";
import AdminDashboard from "@/components/AdminDashboard";
import { useSimpleAuth } from "@/components/SimpleAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, AlertCircle } from "lucide-react";

export default function AdminPage() {
  const { user, isAuthenticated, isAdmin } = useSimpleAuth();
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
            <p className="text-gray-600 mb-6">Please sign in to access the admin dashboard</p>
            <Button onClick={() => setLocation('/')} className="bg-red-600 hover:bg-red-700">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Settings className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Access Only</h1>
            <p className="text-gray-600 mb-2">This area is restricted to administrators only</p>
            <p className="text-sm text-gray-500 mb-6">Current user: {user?.name} ({user?.role})</p>
            <Button onClick={() => setLocation('/')} className="bg-red-600 hover:bg-red-700">
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdminDashboard />;
}
