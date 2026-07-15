import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Loader2, AlertCircle } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const { register, loading } = useAuth();

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("fan");
  const [country, setCountry] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Validation States
  const [error, setError] = useState("");

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(pass)) return "Password must contain at least one lowercase letter";
    if (!/\d/.test(pass)) return "Password must contain at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return "Password must contain at least one special character";
    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Form checks
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passError = validatePassword(password);
    if (passError) {
      setError(passError);
      return;
    }

    if (!acceptTerms) {
      setError("You must accept the terms and conditions");
      return;
    }

    try {
      const user = await register({
        fullName,
        email,
        phone,
        password,
        confirmPassword,
        role,
        country,
        acceptTerms,
      });

      // Role-based redirects on successful registration
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
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <div className="flex-1 flex items-center justify-center pt-24 pb-12 px-4">
        <Card className="w-full max-w-lg shadow-lg border border-slate-200 bg-white">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <Users size={24} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900">Get Started</CardTitle>
            <CardDescription className="text-slate-600">
              Create an account for StadiumIQ AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                    className="btn-press"
                  />
                </div>
                <div className="space-y-1">
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
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Mobile Phone</label>
                  <Input
                    type="tel"
                    placeholder="+1555123456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={loading}
                    className="btn-press"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Country</label>
                  <Input
                    type="text"
                    placeholder="United States"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    disabled={loading}
                    className="btn-press"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Role Profile</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 btn-press"
                >
                  <option value="fan">Fan</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="organizer">Organizer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <Input
                    type="password"
                    placeholder="Min 8 chars, mixed"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="btn-press"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                  <Input
                    type="password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="btn-press"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 mt-0.5 text-indigo-600 border-slate-300 rounded btn-press"
                />
                <label htmlFor="acceptTerms" className="text-xs text-slate-600 leading-tight">
                  I accept the Terms of Service and Privacy Policy for FIFA World Cup 2026.
                </label>
              </div>

              <Button type="submit" disabled={loading} className="w-full btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              <div className="text-center text-sm text-slate-600 mt-4">
                Already have an account?{" "}
                <Link href="/login">
                  <a className="text-indigo-600 font-semibold hover:underline">Sign In</a>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
