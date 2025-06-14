import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import AdminDashboard from "@/components/AdminDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-neutral-text mb-4">
              Admin Access Required
            </h1>
            <p className="text-neutral-secondary mb-6">
              Please sign in to access the admin dashboard
            </p>
            <Button className="bg-red-600 hover:bg-red-700">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <AdminDashboard />
    </div>
  );
}
