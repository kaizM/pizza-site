import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import OrderTracking from "@/components/OrderTracking";

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.orderId;

  if (!orderId) {
    return (
      <div className="min-h-screen bg-neutral-bg py-8">
        <div className="max-w-4xl mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Invalid Order ID</h1>
          <Link href="/">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg py-8">
      <OrderTracking orderId={orderId} />
      <div className="text-center mt-8">
        <Link href="/">
          <Button variant="outline" className="bg-red-600 hover:bg-red-700 text-white">
            Order More
          </Button>
        </Link>
      </div>
    </div>
  );
}