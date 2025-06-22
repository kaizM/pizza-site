import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import ToastContainer from "@/components/ToastContainer";
import Home from "@/pages/home";
import CartPage from "@/pages/cart";
import BuildPizzaPage from "@/pages/build-pizza";
import CheckoutPage from "@/pages/checkout";
import TrackOrderPage from "@/pages/track-order";
import EmployeePage from "@/pages/employee";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";
import OrderTrackingPage from "@/pages/order-tracking";
import CustomerResponse from "@/pages/CustomerResponse";
import EmployeeMobileApp from "@/components/EmployeeMobileApp";
import FirebaseEmployeeMobileApp from "@/components/FirebaseEmployeeMobileApp";
import AdvancedEmployeeDashboard from "@/components/AdvancedEmployeeDashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cart" component={CartPage} />
      <Route path="/build-pizza" component={BuildPizzaPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/track-order" component={TrackOrderPage} />
      <Route path="/order-tracking" component={OrderTrackingPage} />
      <Route path="/customer-response/:id" component={CustomerResponse} />
      <Route path="/kitchen-display-system" component={EmployeePage} />
      <Route path="/employee" component={AdvancedEmployeeDashboard} />
      <Route path="/employee-firebase" component={FirebaseEmployeeMobileApp} />
      <Route path="/employee-rest" component={EmployeeMobileApp} />
      <Route path="/management-portal" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <ToastContainer />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
