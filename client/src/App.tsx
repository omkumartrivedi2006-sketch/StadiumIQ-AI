import { lazy, Suspense, useEffect } from "react";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { Spinner } from "@/components/ui/spinner";
import { AuthGuard } from "@/middleware/authGuard";
import { toast } from "sonner";
import { RouteProgress } from "@/components/RouteProgress";
import { ScrollToTop } from "@/components/ScrollToTop";
import { InactivityHandler } from "@/components/InactivityHandler";

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
const Profile = lazy(() => import("@/pages/Profile"));
const Offline = lazy(() => import("@/pages/Offline"));
const Unauthorized = lazy(() => import("@/pages/Unauthorized"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Marketing and Legal pages
const Features = lazy(() => import("@/pages/Features"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const About = lazy(() => import("@/pages/About"));
const Blog = lazy(() => import("@/pages/Blog"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background animate-fade-in">
      <div className="relative flex flex-col items-center gap-4">
        <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-600 to-cyan-500 animate-pulse-soft" style={{ width: "80%" }} />
        </div>
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold animate-bounce shadow-lg shadow-indigo-200">
          SQ
        </div>
        <div className="text-muted-foreground font-semibold text-sm tracking-wide uppercase animate-pulse-soft animate-duration-1000">
          StadiumIQ Loading...
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        {/* Public Routes */}
        <Route path={"/"} component={Landing} />
        <Route path={"/features"} component={Features} />
        <Route path={"/pricing"} component={Pricing} />
        <Route path={"/about"} component={About} />
        <Route path={"/blog"} component={Blog} />
        <Route path={"/privacy"} component={Privacy} />
        <Route path={"/terms"} component={Terms} />
        <Route path={"/login"} component={Login} />
        <Route path={"/register"} component={Register} />
        <Route path={"/forgot-password"} component={ForgotPassword} />
        <Route path={"/reset-password"} component={ResetPassword} />
        <Route path={"/contact"} component={Contact} />
        <Route path={"/feedback"} component={Feedback} />
        <Route path={"/unauthorized"} component={Unauthorized} />
        <Route path={"/offline"} component={Offline} />
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
        <Route path={"/profile"}>
          <AuthGuard>
            <Profile />
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
  useEffect(() => {
    const handleOnline = () => {
      toast.success("Internet connection restored!", {
        description: "You are back online.",
        id: "connection-toast",
      });
    };

    const handleOffline = () => {
      toast.error("You are currently offline.", {
        description: "Viewing cached offline data. Some actions may be limited.",
        id: "connection-toast",
        duration: 10000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <RouteProgress />
            <ScrollToTop />
            <InactivityHandler />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
