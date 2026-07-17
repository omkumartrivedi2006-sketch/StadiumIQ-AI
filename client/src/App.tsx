import { lazy, Suspense, useEffect } from "react";
import { Route, Switch, Redirect } from "wouter";
import { useAuth } from "./contexts/AuthContext";
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

// Fan Sub-Pages
const Tickets = lazy(() => import("@/pages/Tickets"));
const Schedule = lazy(() => import("@/pages/Schedule"));
const StadiumNavigation = lazy(() => import("@/pages/StadiumNavigation"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));

// Volunteer Sub-Pages
const VolunteerTasks = lazy(() => import("@/pages/volunteer/VolunteerTasks"));
const VolunteerZone = lazy(() => import("@/pages/volunteer/VolunteerZone"));
const CrowdReports = lazy(() => import("@/pages/volunteer/CrowdReports"));
const IncidentReports = lazy(() => import("@/pages/volunteer/IncidentReports"));
const VolunteerCommunication = lazy(() => import("@/pages/volunteer/VolunteerCommunication"));

// Organizer Sub-Pages
const MatchOperations = lazy(() => import("@/pages/organizer/MatchOperations"));
const StadiumOperations = lazy(() => import("@/pages/organizer/StadiumOperations"));
const VolunteerManagement = lazy(() => import("@/pages/organizer/VolunteerManagement"));
const OrganizerReports = lazy(() => import("@/pages/organizer/OrganizerReports"));

// Admin Sub-Pages
const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));
const RoleManagement = lazy(() => import("@/pages/admin/RoleManagement"));
const StadiumManagement = lazy(() => import("@/pages/admin/StadiumManagement"));
const MatchManagement = lazy(() => import("@/pages/admin/MatchManagement"));
const AILogs = lazy(() => import("@/pages/admin/AILogs"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const SystemMonitoring = lazy(() => import("@/pages/admin/SystemMonitoring"));

// Redirect helper components for unified path management
function RoleDashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Redirect to="/login" />;
  return <Redirect to={`/${user.role}/dashboard`} />;
}

function RoleProfileRedirect() {
  const { user } = useAuth();
  if (!user) return <Redirect to="/login" />;
  return <Redirect to={`/${user.role}/profile`} />;
}

function RoleSettingsRedirect() {
  const { user } = useAuth();
  if (!user) return <Redirect to="/login" />;
  return <Redirect to={`/${user.role}/settings`} />;
}

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
        <Route path={"/support"} component={Contact} />
        <Route path={"/faq"} component={Contact} />
        <Route path={"/docs"} component={Features} />
        <Route path={"/documentation"} component={Features} />
        <Route path={"/feedback"} component={Feedback} />
        <Route path={"/unauthorized"} component={Unauthorized} />
        <Route path={"/offline"} component={Offline} />
        <Route path={"/404"} component={NotFound} />

        {/* Private Features Gated by Roles */}
        <Route path={"/chat"}><Redirect to="/fan/chat" /></Route>
        <Route path={"/food"}><Redirect to="/fan/food" /></Route>
        <Route path={"/lost-found"}><Redirect to="/fan/lost-found" /></Route>
        <Route path={"/transport"}><Redirect to="/fan/transport" /></Route>
        <Route path={"/accessibility"}><Redirect to="/fan/accessibility" /></Route>
        <Route path={"/emergency"}>
          <AuthGuard>
            <Emergency />
          </AuthGuard>
        </Route>

        {/* Protected General Routes */}
        <Route path={"/role-selection"}>
          <AuthGuard>
            <RoleSelection />
          </AuthGuard>
        </Route>
        <Route path={"/dashboard"} component={RoleDashboardRedirect} />
        <Route path={"/profile"} component={RoleProfileRedirect} />
        <Route path={"/settings"} component={RoleSettingsRedirect} />

        {/* Fan Routes */}
        <Route path={"/fan/dashboard"}>
          <AuthGuard allowedRoles={["fan"]}>
            <Dashboard />
          </AuthGuard>
        </Route>
        <Route path={"/fan/chat"}>
          <AuthGuard allowedRoles={["fan", "volunteer", "admin"]}>
            <AIChat />
          </AuthGuard>
        </Route>
        <Route path={"/fan/schedule"}>
          <AuthGuard allowedRoles={["fan"]}>
            <Schedule />
          </AuthGuard>
        </Route>
        <Route path={"/fan/tickets"}>
          <AuthGuard allowedRoles={["fan"]}>
            <Tickets />
          </AuthGuard>
        </Route>
        <Route path={"/fan/navigation"}>
          <AuthGuard allowedRoles={["fan"]}>
            <StadiumNavigation />
          </AuthGuard>
        </Route>
        <Route path={"/fan/food"}>
          <AuthGuard allowedRoles={["fan", "admin"]}>
            <FoodFinder />
          </AuthGuard>
        </Route>
        <Route path={"/fan/lost-found"}>
          <AuthGuard allowedRoles={["fan", "volunteer", "admin"]}>
            <LostFound />
          </AuthGuard>
        </Route>
        <Route path={"/fan/transport"}>
          <AuthGuard allowedRoles={["fan", "volunteer", "admin"]}>
            <Transportation />
          </AuthGuard>
        </Route>
        <Route path={"/fan/accessibility"}>
          <AuthGuard>
            <Accessibility />
          </AuthGuard>
        </Route>
        <Route path={"/fan/notifications"}>
          <AuthGuard allowedRoles={["fan"]}>
            <NotificationsPage />
          </AuthGuard>
        </Route>
        <Route path={"/fan/profile"}>
          <AuthGuard allowedRoles={["fan"]}>
            <Profile />
          </AuthGuard>
        </Route>
        <Route path={"/fan/settings"}>
          <AuthGuard allowedRoles={["fan"]}>
            <Settings />
          </AuthGuard>
        </Route>

        {/* Volunteer Routes */}
        <Route path={"/volunteer/dashboard"}>
          <AuthGuard allowedRoles={["volunteer", "admin"]}>
            <VolunteerDashboard />
          </AuthGuard>
        </Route>
        <Route path={"/volunteer/tasks"}>
          <AuthGuard allowedRoles={["volunteer"]}>
            <VolunteerTasks />
          </AuthGuard>
        </Route>
        <Route path={"/volunteer/zone"}>
          <AuthGuard allowedRoles={["volunteer"]}>
            <VolunteerZone />
          </AuthGuard>
        </Route>
        <Route path={"/volunteer/crowd-reports"}>
          <AuthGuard allowedRoles={["volunteer"]}>
            <CrowdReports />
          </AuthGuard>
        </Route>
        <Route path={"/volunteer/incident-reports"}>
          <AuthGuard allowedRoles={["volunteer"]}>
            <IncidentReports />
          </AuthGuard>
        </Route>
        <Route path={"/volunteer/navigation"}>
          <AuthGuard allowedRoles={["volunteer"]}>
            <StadiumNavigation />
          </AuthGuard>
        </Route>
        <Route path={"/volunteer/communication"}>
          <AuthGuard allowedRoles={["volunteer"]}>
            <VolunteerCommunication />
          </AuthGuard>
        </Route>
        <Route path={"/volunteer/notifications"}>
          <AuthGuard allowedRoles={["volunteer"]}>
            <NotificationsPage />
          </AuthGuard>
        </Route>
        <Route path={"/volunteer/profile"}>
          <AuthGuard allowedRoles={["volunteer"]}>
            <Profile />
          </AuthGuard>
        </Route>
        <Route path={"/volunteer/settings"}>
          <AuthGuard allowedRoles={["volunteer"]}>
            <Settings />
          </AuthGuard>
        </Route>

        {/* Organizer Routes */}
        <Route path={"/organizer/dashboard"}>
          <AuthGuard allowedRoles={["organizer", "admin"]}>
            <OrganizerDashboard />
          </AuthGuard>
        </Route>
        <Route path={"/organizer/matches"}>
          <AuthGuard allowedRoles={["organizer"]}>
            <MatchOperations />
          </AuthGuard>
        </Route>
        <Route path={"/organizer/stadiums"}>
          <AuthGuard allowedRoles={["organizer"]}>
            <StadiumOperations />
          </AuthGuard>
        </Route>
        <Route path={"/organizer/crowd-analytics"}>
          <AuthGuard allowedRoles={["organizer"]}>
            <StadiumOperations />
          </AuthGuard>
        </Route>
        <Route path={"/organizer/volunteers"}>
          <AuthGuard allowedRoles={["organizer"]}>
            <VolunteerManagement />
          </AuthGuard>
        </Route>
        <Route path={"/organizer/reports"}>
          <AuthGuard allowedRoles={["organizer"]}>
            <OrganizerReports />
          </AuthGuard>
        </Route>
        <Route path={"/organizer/notifications"}>
          <AuthGuard allowedRoles={["organizer"]}>
            <NotificationsPage />
          </AuthGuard>
        </Route>
        <Route path={"/organizer/profile"}>
          <AuthGuard allowedRoles={["organizer"]}>
            <Profile />
          </AuthGuard>
        </Route>
        <Route path={"/organizer/settings"}>
          <AuthGuard allowedRoles={["organizer"]}>
            <Settings />
          </AuthGuard>
        </Route>

        {/* Admin Routes */}
        <Route path={"/admin/dashboard"}>
          <AuthGuard allowedRoles={["admin"]}>
            <AdminDashboard />
          </AuthGuard>
        </Route>
        <Route path={"/admin/users"}>
          <AuthGuard allowedRoles={["admin"]}>
            <UserManagement />
          </AuthGuard>
        </Route>
        <Route path={"/admin/roles"}>
          <AuthGuard allowedRoles={["admin"]}>
            <RoleManagement />
          </AuthGuard>
        </Route>
        <Route path={"/admin/stadiums"}>
          <AuthGuard allowedRoles={["admin"]}>
            <StadiumManagement />
          </AuthGuard>
        </Route>
        <Route path={"/admin/matches"}>
          <AuthGuard allowedRoles={["admin"]}>
            <MatchManagement />
          </AuthGuard>
        </Route>
        <Route path={"/admin/ai-logs"}>
          <AuthGuard allowedRoles={["admin"]}>
            <AILogs />
          </AuthGuard>
        </Route>
        <Route path={"/admin/analytics"}>
          <AuthGuard allowedRoles={["admin"]}>
            <AdminAnalytics />
          </AuthGuard>
        </Route>
        <Route path={"/admin/monitoring"}>
          <AuthGuard allowedRoles={["admin"]}>
            <SystemMonitoring />
          </AuthGuard>
        </Route>
        <Route path={"/admin/notifications"}>
          <AuthGuard allowedRoles={["admin"]}>
            <NotificationsPage />
          </AuthGuard>
        </Route>
        <Route path={"/admin/profile"}>
          <AuthGuard allowedRoles={["admin"]}>
            <Profile />
          </AuthGuard>
        </Route>
        <Route path={"/admin/settings"}>
          <AuthGuard allowedRoles={["admin"]}>
            <Settings />
          </AuthGuard>
        </Route>

        {/* Fallback routes */}
        <Route path={"/volunteer"}><Redirect to="/volunteer/dashboard" /></Route>
        <Route path={"/organizer"}><Redirect to="/organizer/dashboard" /></Route>
        <Route path={"/admin"}><Redirect to="/admin/dashboard" /></Route>

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
