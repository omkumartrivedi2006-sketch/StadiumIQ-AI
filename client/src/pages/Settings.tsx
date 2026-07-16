import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/api/client";
import { Settings as SettingsIcon, User, Globe, Moon, Sun, Bell, Loader2, AlertCircle, CheckCircle2, KeyRound, Image, Trash2 } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/constants";
import { toast } from "sonner";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, updateUser, logout } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("en");
  const [profileImage, setProfileImage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");
  const [confirmErrorMsg, setConfirmErrorMsg] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "", color: "" });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const checkPasswordStrength = (val: string) => {
    setNewPassword(val);
    if (!val) {
      setPasswordStrength({ score: 0, label: "", color: "" });
      setPasswordErrorMsg("");
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
      setPasswordErrorMsg("");
    } else if (score >= 3) {
      label = "Medium";
      color = "bg-amber-500";
      setPasswordErrorMsg("Password must meet complexity rules (uppercase, lowercase, digit, special symbol).");
    } else {
      label = "Weak";
      color = "bg-red-500";
      setPasswordErrorMsg("Password is too short or simple (minimum 8 characters).");
    }
    setPasswordStrength({ score, label, color });

    if (confirmNewPassword && val !== confirmNewPassword) {
      setConfirmErrorMsg("Passwords do not match.");
    } else {
      setConfirmErrorMsg("");
    }
  };

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmNewPassword(val);
    if (!val) {
      setConfirmErrorMsg("");
      return;
    }
    if (val !== newPassword) {
      setConfirmErrorMsg("Passwords do not match.");
    } else {
      setConfirmErrorMsg("");
    }
  };

  // Initialize fields with current user state
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
      setCountry(user.country || "");
      setLanguage(user.language || "en");
      setProfileImage(user.profileImage || "");
    }
  }, [user]);

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action will log you out and deactivate your profile.")) return;
    try {
      const response = await apiClient.delete(`/users/${user?.id}`);
      if (response.data?.success) {
        toast.success("Account deactivated successfully.");
        await logout();
        setLocation("/");
      }
    } catch (e) {
      toast.error("Failed to delete account.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await apiClient.put("/auth/profile", {
        fullName,
        phone,
        country,
        profileImage,
        language,
      });

      if (response.data?.success && response.data?.user) {
        updateUser(response.data.user);
        setMessage("Profile preferences saved successfully!");
        toast.success("Profile updated successfully!");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile settings.");
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");
    setPasswordErrorMsg("");
    setConfirmErrorMsg("");

    if (newPassword !== confirmNewPassword) {
      setConfirmErrorMsg("New passwords do not match.");
      return;
    }

    if (passwordStrength.score < 3) {
      setPasswordErrorMsg("Please choose a stronger password.");
      return;
    }

    setPasswordSaving(true);
    try {
      const response = await apiClient.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      if (response.data?.success) {
        setPasswordMessage("Password updated successfully!");
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setPasswordStrength({ score: 0, label: "", color: "" });
      }
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || "Failed to change password.");
      toast.error("Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-10 animate-slide-in-down">
            <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <SettingsIcon className="text-indigo-600 animate-spin-slow" />
              Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your profile preferences, UI theme, language, and notifications
            </p>
          </div>

          <div className="space-y-6 animate-slide-in-up">
            {message && (
              <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200 flex items-center gap-2">
                <CheckCircle2 size={16} className="flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              {/* Profile Details */}
              <Card className="shadow border border-border bg-card">
                <CardHeader className="flex flex-row items-center gap-3">
                  <User className="text-indigo-600" size={22} />
                  <div>
                    <CardTitle className="text-xl font-bold">Profile Details</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Full Name</label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required disabled={saving} className="btn-press" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Mobile Phone</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={saving} type="tel" className="btn-press" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Country</label>
                    <Input value={country} onChange={(e) => setCountry(e.target.value)} required disabled={saving} className="btn-press" />
                  </div>
                </CardContent>
              </Card>

              {/* Avatar Settings */}
              <Card className="shadow border border-border bg-card">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Image className="text-indigo-600" size={22} />
                  <div>
                    <CardTitle className="text-xl font-bold">Profile Picture</CardTitle>
                    <CardDescription>Change your display avatar</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"}
                      alt="Profile Avatar"
                      className="w-16 h-16 rounded-full object-cover border border-border flex-shrink-0"
                    />
                    <div className="flex-grow space-y-1">
                      <label className="text-sm font-medium text-slate-700">Avatar URL</label>
                      <Input
                        placeholder="https://example.com/avatar.jpg"
                        value={profileImage}
                        onChange={(e) => setProfileImage(e.target.value)}
                        disabled={saving}
                        className="btn-press"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Language & Theme Settings */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Language Preferences */}
                <Card className="shadow border border-border bg-card">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <Globe className="text-indigo-600" size={22} />
                    <div>
                      <CardTitle className="text-xl font-bold">Language</CardTitle>
                      <CardDescription>Select your preferred language</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      disabled={saving}
                      className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 btn-press"
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </CardContent>
                </Card>

                {/* Theme Settings */}
                <Card className="shadow border border-border bg-card">
                  <CardHeader className="flex flex-row items-center gap-3">
                    {theme === "dark" ? <Moon className="text-indigo-600" size={22} /> : <Sun className="text-indigo-600" size={22} />}
                    <div>
                      <CardTitle className="text-xl font-bold">Theme Mode</CardTitle>
                      <CardDescription>Switch between Light and Dark interface theme</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      type="button"
                      onClick={toggleTheme}
                      variant="outline"
                      disabled={saving}
                      className="w-full btn-press flex items-center justify-center gap-2 border-slate-300"
                    >
                      {theme === "dark" ? (
                        <>
                          <Sun size={16} /> Switch to Light Mode
                        </>
                      ) : (
                        <>
                          <Moon size={16} /> Switch to Dark Mode
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Privacy Settings */}
              <Card className="shadow border border-border bg-card">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Globe className="text-indigo-600" size={22} />
                  <div>
                    <CardTitle className="text-xl font-bold">Privacy Controls</CardTitle>
                    <CardDescription>Configure data visibility and search preferences</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-slate-800 block">Export Personal Data</span>
                      <span className="text-xs text-slate-500">Download a JSON archive of your match tickets and chat history</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success("Export successful! Checking backup logs...")}
                      className="btn-press"
                    >
                      Export Profile JSON
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-slate-800 block">Search Visibility</span>
                      <span className="text-xs text-slate-500">Allow search crawlers and other volunteers to locate your profile</span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 border-slate-300 rounded btn-press focus:ring-indigo-600" />
                  </div>
                </CardContent>
              </Card>

              {/* Notification settings */}
              <Card className="shadow border border-border bg-card">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Bell className="text-indigo-600" size={22} />
                  <div>
                    <CardTitle className="text-xl font-bold">Notifications</CardTitle>
                    <CardDescription>Manage push notifications and emergency announcements</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-slate-800 block">Emergency Alerts</span>
                      <span className="text-xs text-slate-500">Receive immediate notifications during critical incidents</span>
                    </div>
                    <input type="checkbox" defaultChecked disabled className="w-4 h-4 text-indigo-600 border-slate-300 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-slate-800 block">Food Queue Status</span>
                      <span className="text-xs text-slate-500">Alert me when my food order is ready or crowd levels drop</span>
                    </div>
                    <input type="checkbox" defaultChecked disabled={saving} className="w-4 h-4 text-indigo-600 border-slate-300 rounded btn-press" />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={saving} className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {saving ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </form>

            {/* Password Change Form */}
            <form onSubmit={handleChangePassword} className="space-y-6">
              <Card className="shadow border border-border bg-card">
                <CardHeader className="flex flex-row items-center gap-3">
                  <KeyRound className="text-indigo-600" size={22} />
                  <div>
                    <CardTitle className="text-xl font-bold">Change Password</CardTitle>
                    <CardDescription>Update your login credentials securely</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {passwordMessage && (
                    <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200 flex items-center gap-2">
                      <CheckCircle2 size={16} className="flex-shrink-0" />
                      <span>{passwordMessage}</span>
                    </div>
                  )}
                  {passwordError && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-center gap-2">
                      <AlertCircle size={16} className="flex-shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Current Password</label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        disabled={passwordSaving}
                        autoComplete="current-password"
                        className="btn-press focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">New Password</label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => checkPasswordStrength(e.target.value)}
                        required
                        disabled={passwordSaving}
                        autoComplete="new-password"
                        className={`btn-press focus:ring-2 ${passwordErrorMsg ? "border-amber-500 focus:ring-amber-500" : "focus:ring-indigo-600"}`}
                      />
                      {passwordStrength.label && (
                        <div className="space-y-1 mt-1.5">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-slate-500 uppercase">Strength:</span>
                            <span className={passwordStrength.score >= 5 ? "text-green-600" : passwordStrength.score >= 3 ? "text-amber-500" : "text-red-500"}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${passwordStrength.color} transition-all duration-300`}
                              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {passwordErrorMsg && <p className="text-[10px] text-slate-500 mt-1 leading-normal">{passwordErrorMsg}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
                      <Input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                        required
                        disabled={passwordSaving}
                        autoComplete="new-password"
                        className={`btn-press focus:ring-2 ${confirmErrorMsg ? "border-red-500 focus:ring-red-500" : "focus:ring-indigo-600"}`}
                      />
                      {confirmErrorMsg && <p className="text-[11px] text-red-500 font-medium mt-1">{confirmErrorMsg}</p>}
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={passwordSaving || !currentPassword || !newPassword || !confirmNewPassword || !!confirmErrorMsg || passwordStrength.score < 3}
                      className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2"
                    >
                      {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>

            {/* Danger Zone */}
            <Card className="mt-8 shadow border border-red-200 bg-red-50/10">
              <CardHeader className="flex flex-row items-center gap-3">
                <Trash2 className="text-red-600" size={22} />
                <div>
                  <CardTitle className="text-xl font-bold text-red-950">Danger Zone</CardTitle>
                  <CardDescription className="text-red-700/80">Irreversible account actions</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Delete Account</p>
                  <p className="text-xs text-slate-500">Soft delete your StadiumIQ account. Your records will be preserved safely.</p>
                </div>
                <Button 
                  onClick={handleDeleteAccount}
                  variant="outline" 
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold btn-press"
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
