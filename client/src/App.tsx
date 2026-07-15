import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { Spinner } from "@/components/ui/spinner";
import { AuthGuard } from "@/middleware/authGuard";

// Lazy loaded page components
const Landing = lazy(() => import("@/pages/Landing"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AIChat = lazy(() => import("@/pages/AIChat"));
const FoodFinder = lazy(() => import("@/pages/FoodFinder"));
const LostFound = lazy(() => import("@/pages/LostFound"));
const Emergency = lazy(() => import("@/pages/Emergency"));
const Transportation = lazy(() => import("@/pages/Transportation"));
const Accessibility = lazy(() => import("@/pages/Accessibility"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Contact = lazy(() => import("@/pages/Contact"));
const Feedback = lazy(() => import("@/pages/Feedback"));
const RoleSelection = lazy(() => import("@/pages/RoleSelection"));
const VolunteerDashboard = lazy(() => import("@/pages/VolunteerDashboard"));
const OrganizerDashboard = lazy(() => import("@/pages/OrganizerDashboard"));
const Settings = lazy(() => import("@/pages/Settings"));
const Unauthorized = lazy(() => import("@/pages/Unauthorized"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Spinner className="w-10 h-10 text-indigo-600" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        {/* Public Routes */}
        <Route path={"/"} component={Landing} />
        <Route path={"/login"} component={Login} />
        <Route path={"/register"} component={Register} />
        <Route path={"/forgot-password"} component={ForgotPassword} />
        <Route path={"/reset-password"} component={ResetPassword} />
        <Route path={"/contact"} component={Contact} />
        <Route path={"/feedback"} component={Feedback} />
        <Route path={"/unauthorized"} component={Unauthorized} />
        <Route path={"/404"} component={NotFound} />

        {/* Private Features Gated by Roles */}
        <Route path={"/chat"}>
          <AuthGuard allowedRoles={["fan", "volunteer", "admin"]}>
            <AIChat />
          </AuthGuard>
        </Route>
        <Route path={"/food"}>
          <AuthGuard allowedRoles={["fan", "admin"]}>
            <FoodFinder />
          </AuthGuard>
        </Route>
        <Route path={"/lost-found"}>
          <AuthGuard allowedRoles={["fan", "volunteer", "admin"]}>
            <LostFound />
          </AuthGuard>
        </Route>
        <Route path={"/emergency"}>
          <AuthGuard>
            <Emergency />
          </AuthGuard>
        </Route>
        <Route path={"/transport"}>
          <AuthGuard allowedRoles={["fan", "volunteer", "admin"]}>
            <Transportation />
          </AuthGuard>
        </Route>
        <Route path={"/accessibility"}>
          <AuthGuard>
            <Accessibility />
          </AuthGuard>
        </Route>

        {/* Protected General Routes */}
        <Route path={"/role-selection"}>
          <AuthGuard>
            <RoleSelection />
          </AuthGuard>
        </Route>
        <Route path={"/settings"}>
          <AuthGuard>
            <Settings />
          </AuthGuard>
        </Route>

        {/* Role-Specific Protected Dashboards */}
        <Route path={"/dashboard"}>
          <AuthGuard allowedRoles={["fan", "volunteer", "organizer", "admin"]}>
            <Dashboard />
          </AuthGuard>
        </Route>
        <Route path={"/volunteer"}>
          <AuthGuard allowedRoles={["volunteer", "admin"]}>
            <VolunteerDashboard />
          </AuthGuard>
        </Route>
        <Route path={"/organizer"}>
          <AuthGuard allowedRoles={["organizer", "admin"]}>
            <OrganizerDashboard />
          </AuthGuard>
        </Route>
        <Route path={"/admin"}>
          <AuthGuard allowedRoles={["admin"]}>
            <AdminDashboard />
          </AuthGuard>
        </Route>

        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
