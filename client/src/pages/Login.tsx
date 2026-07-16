import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ManusDialog } from "@/components/ManusDialog";
import { Shield, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isManusOpen, setIsManusOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(email, password);
      toast.success("Welcome back! Signed in successfully.");
      // Dynamic redirection based on role
      if (user.role === "admin") {
        setLocation("/admin");
      } else if (user.role === "volunteer") {
        setLocation("/volunteer");
      } else if (user.role === "organizer") {
        setLocation("/organizer");
      } else {
        setLocation("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
      toast.error(err.message || "Invalid email or password");
    }
  };

  const handleManusLogin = () => {
    localStorage.setItem("access_token", "mock-manus-session");
    setIsManusOpen(false);
    setLocation("/role-selection");
  };

  const handleDemoLogin = async (role: "fan" | "volunteer" | "organizer" | "admin") => {
    setError("");
    try {
      const demoEmail = `${role}@demo.stadiumiq.ai`;
      const user = await login(demoEmail, "demo1234");
      toast.success(`Logged in as Demo ${role.toUpperCase()}`);
      if (user.role === "admin") {
        setLocation("/admin");
      } else if (user.role === "volunteer") {
        setLocation("/volunteer");
      } else if (user.role === "organizer") {
        setLocation("/organizer");
      } else {
        setLocation("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || `Failed to log in as demo ${role}`);
      toast.error(`Failed to log in as demo ${role}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div className="flex-1 flex items-center justify-center pt-24 pb-12 px-4">
        <Card className="w-full max-w-md shadow-lg border border-border bg-card">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <Shield size={24} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">Sign In</CardTitle>
            <CardDescription className="text-muted-foreground">
              Access StadiumIQ AI for FIFA World Cup 2026
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
                  autoComplete="email"
                  className="btn-press focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <Link href="/forgot-password">
                    <a className="text-xs text-indigo-600 hover:underline">Forgot password?</a>
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="btn-press focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase tracking-wider">Or continue with</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsManusOpen(true)}
              disabled={loading}
              className="w-full btn-press border-border text-foreground font-medium hover:bg-muted mb-2"
            >
              Sign In with Manus
            </Button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase tracking-wider">Demo Quick Login</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("fan")}
                disabled={loading}
                className="text-xs font-semibold text-foreground hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 border-border"
              >
                Fan Demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("volunteer")}
                disabled={loading}
                className="text-xs font-semibold text-foreground hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-600 border-border"
              >
                Volunteer Demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("organizer")}
                disabled={loading}
                className="text-xs font-semibold text-foreground hover:bg-amber-50 dark:hover:bg-amber-950 hover:text-amber-600 border-border"
              >
                Organizer Demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("admin")}
                disabled={loading}
                className="text-xs font-semibold text-foreground hover:bg-purple-50 dark:hover:bg-purple-950 hover:text-purple-600 border-border"
              >
                Admin Demo
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register">
                <a className="text-indigo-600 font-semibold hover:underline">Sign Up</a>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <ManusDialog
        open={isManusOpen}
        onOpenChange={setIsManusOpen}
        onLogin={handleManusLogin}
        title="StadiumIQ authentication"
      />
    </div>
  );
}
