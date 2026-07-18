import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
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

  // Real-time Validation States
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "", color: "" });
  const [error, setError] = useState("");

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (!val) {
      setEmailError("");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const checkPasswordStrength = (val: string) => {
    setPassword(val);
    if (!val) {
      setPasswordStrength({ score: 0, label: "", color: "" });
      setPasswordError("");
      return;
    }

    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[a-z]/.test(val)) score++;
    if (/\d/.test(val)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(val)) score++;

    let label = "Very Weak";
    let color = "bg-red-500";
    if (score >= 5) {
      label = "Strong";
      color = "bg-green-500";
      setPasswordError("");
    } else if (score >= 3) {
      label = "Medium";
      color = "bg-amber-500";
      setPasswordError("Password must meet complexity rules (uppercase, lowercase, digit, special symbol).");
    } else {
      label = "Weak";
      color = "bg-red-500";
      setPasswordError("Password is too short or simple (minimum 8 characters).");
    }
    setPasswordStrength({ score, label, color });

    // Re-verify confirm password if it already has value
    if (confirmPassword && val !== confirmPassword) {
      setConfirmError("Passwords do not match.");
    } else {
      setConfirmError("");
    }
  };

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val);
    if (!val) {
      setConfirmError("");
      return;
    }
    if (val !== password) {
      setConfirmError("Passwords do not match.");
    } else {
      setConfirmError("");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Submit validations
    if (emailError) {
      setError("Please fix the email address error.");
      return;
    }
    if (passwordStrength.score < 3) {
      setError("Please choose a stronger password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
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

      toast.success("Welcome! Registration completed successfully."); // Trigger CI rebuild with verified toast import

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
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div className="flex-1 flex items-center justify-center pt-24 pb-12 px-4">
        <Card className="w-full max-w-lg shadow-lg border border-border bg-card">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <Users size={24} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">Get Started</CardTitle>
            <CardDescription className="text-muted-foreground">
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
                  <label className="text-sm font-medium text-foreground/90">Full Name</label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                    autoFocus
                    autoComplete="name"
                    className="btn-press focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground/90">Email Address</label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                    className={`btn-press focus:ring-2 ${emailError ? "border-red-500 focus:ring-red-500" : "focus:ring-indigo-600"}`}
                  />
                  {emailError && <p className="text-[11px] text-red-500 font-medium mt-1">{emailError}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground/90">Mobile Phone</label>
                  <Input
                    type="tel"
                    placeholder="+1555123456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="tel"
                    className="btn-press focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground/90">Country</label>
                  <Input
                    type="text"
                    placeholder="United States"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="country-name"
                    className="btn-press focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/90">Role Profile</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 btn-press"
                >
                  <option value="fan">Fan</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="organizer">Organizer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground/90">Password</label>
                  <Input
                    type="password"
                    placeholder="Min 8 chars, mixed"
                    value={password}
                    onChange={(e) => checkPasswordStrength(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    className={`btn-press focus:ring-2 ${passwordError ? "border-amber-500 focus:ring-amber-500" : "focus:ring-indigo-600"}`}
                  />
                  {passwordStrength.label && (
                    <div className="space-y-1.5 mt-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-muted-foreground uppercase">Strength:</span>
                        <span className={passwordStrength.score >= 5 ? "text-green-600" : passwordStrength.score >= 3 ? "text-amber-500" : "text-red-500"}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {passwordError && <p className="text-[10px] text-muted-foreground mt-1 leading-normal">{passwordError}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground/90">Confirm Password</label>
                  <Input
                    type="password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    className={`btn-press focus:ring-2 ${confirmError ? "border-red-500 focus:ring-red-500" : "focus:ring-indigo-600"}`}
                  />
                  {confirmError && <p className="text-[11px] text-red-500 font-medium mt-1">{confirmError}</p>}
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 mt-0.5 text-indigo-600 border-border rounded btn-press"
                />
                <label htmlFor="acceptTerms" className="text-xs text-muted-foreground leading-tight">
                  I accept the Terms of Service and Privacy Policy for FIFA World Cup 2026.
                </label>
              </div>

              <Button type="submit" disabled={loading} className="w-full btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
                  Sign In
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
