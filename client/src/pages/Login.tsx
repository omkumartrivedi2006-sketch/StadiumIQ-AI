import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ManusDialog } from "@/components/ManusDialog";
import { Shield, Loader2, AlertCircle } from "lucide-react";

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
    }
  };

  const handleManusLogin = () => {
    localStorage.setItem("access_token", "mock-manus-session");
    setIsManusOpen(false);
    setLocation("/role-selection");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <div className="flex-1 flex items-center justify-center pt-24 pb-12 px-4">
        <Card className="w-full max-w-md shadow-lg border border-slate-200 bg-white">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <Shield size={24} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900">Sign In</CardTitle>
            <CardDescription className="text-slate-600">
              Access StadiumIQ AI for FIFA World Cup 2026
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="btn-press"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Password</label>
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
                  className="btn-press"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase tracking-wider">Or continue with</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsManusOpen(true)}
              disabled={loading}
              className="w-full btn-press border-slate-300 text-slate-700 font-medium hover:bg-slate-50 mb-2"
            >
              Sign In with Manus
            </Button>

            <div className="text-center text-sm text-slate-600">
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
