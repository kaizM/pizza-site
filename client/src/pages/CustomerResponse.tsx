import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "wouter";

interface NotificationData {
  id: number;
  orderId: number;
  type: string;
  message: string;
  customerEmail: string;
  status: string;
  createdAt: string;
  customerResponse?: string;
  responseStatus?: string;
  respondedAt?: string;
}

export default function CustomerResponse() {
  const params = useParams();
  const notificationId = params.id;
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [response, setResponse] = useState("");
  const [responseType, setResponseType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (notificationId) {
      fetchNotification();
    }
  }, [notificationId]);

  const fetchNotification = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/notifications/${notificationId}`);
      if (response.ok) {
        const data = await response.json();
        setNotification(data);
      } else if (response.status === 404) {
        setError("This notification link is invalid or has expired.");
      } else {
        setError("Unable to load notification details.");
      }
    } catch (error) {
      console.error("Error fetching notification:", error);
      setError("Unable to load notification details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!responseType) {
      toast({
        title: "Response Required",
        description: "Please select your response to the substitution request.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", `/api/notifications/${notificationId}/respond`, {
        response: response || responseType,
        status: responseType === "approved" ? "approved" : "declined"
      });

      toast({
        title: "Response Submitted",
        description: "Thank you for your response. The restaurant has been notified.",
      });

      // Refresh notification data
      fetchNotification();
    } catch (error) {
      console.error("Error submitting response:", error);
      toast({
        title: "Submission Failed",
        description: "Unable to submit your response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full" />
              <span>Loading notification...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-red-600">Invalid Link</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasResponded = notification.customerResponse || notification.responseStatus;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Homepage
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              {hasResponded ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <Clock className="w-6 h-6 text-orange-500" />
              )}
              <div>
                <CardTitle>
                  {notification.type === "substitution_request" 
                    ? "Substitution Request" 
                    : "Order Update"}
                </CardTitle>
                <CardDescription>
                  Order #{notification.orderId} • {new Date(notification.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">Restaurant Message:</Label>
              <p className="mt-2 p-4 bg-gray-50 rounded-lg border">{notification.message}</p>
            </div>

            {hasResponded ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Response Submitted</span>
                  </div>
                  <p className="text-green-700">
                    You responded: <strong>{notification.responseStatus}</strong>
                  </p>
                  {notification.customerResponse && notification.customerResponse !== notification.responseStatus && (
                    <p className="text-green-700 mt-1">
                      Additional comments: "{notification.customerResponse}"
                    </p>
                  )}
                  <p className="text-sm text-green-600 mt-2">
                    Submitted on {new Date(notification.respondedAt!).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Your Response:</Label>
                  <RadioGroup 
                    value={responseType} 
                    onValueChange={setResponseType}
                    className="mt-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="approved" id="approve" />
                      <Label htmlFor="approve" className="cursor-pointer">
                        Approve - I accept the substitution
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="declined" id="decline" />
                      <Label htmlFor="decline" className="cursor-pointer">
                        Decline - Please cancel my order or find an alternative
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="comments" className="text-base font-medium">
                    Additional Comments (Optional)
                  </Label>
                  <Textarea
                    id="comments"
                    placeholder="Any special instructions or preferences..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleSubmitResponse}
                  disabled={isSubmitting || !responseType}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Submitting Response...
                    </>
                  ) : (
                    "Submit Response"
                  )}
                </Button>
              </div>
            )}

            <div className="text-sm text-gray-500 border-t pt-4">
              <p>
                This notification was sent to: <strong>{notification.customerEmail}</strong>
              </p>
              <p className="mt-1">
                If you did not place this order, please ignore this message.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}