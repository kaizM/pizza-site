import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Alert
          key={toast.id}
          className={`max-w-sm border-l-4 ${
            toast.variant === "success"
              ? "border-green-500 bg-green-50"
              : toast.variant === "destructive"
              ? "border-red-500 bg-red-50"
              : "border-blue-500 bg-blue-50"
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {toast.variant === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="ml-3 flex-1">
              {toast.title && (
                <h4 className="text-sm font-medium text-gray-900">{toast.title}</h4>
              )}
              {toast.description && (
                <AlertDescription className="text-sm text-gray-700">
                  {toast.description}
                </AlertDescription>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto -mt-1 -mr-1 h-6 w-6 p-0"
              onClick={() => {
                // Toast auto-dismisses, but we can add manual dismiss here if needed
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
}
