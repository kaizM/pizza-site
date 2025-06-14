import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import ToastContainer from "@/components/ToastContainer";
import Home from "@/pages/home";
import BuildPizzaPage from "@/pages/build-pizza";
import CheckoutPage from "@/pages/checkout";
import TrackOrderPage from "@/pages/track-order";
import EmployeePage from "@/pages/employee";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/build-pizza" component={BuildPizzaPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/track-order" component={TrackOrderPage} />
      <Route path="/employee" component={EmployeePage} />
      <Route path="/admin" component={AdminPage} />
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
