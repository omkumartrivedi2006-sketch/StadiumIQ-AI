import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, Settings, User } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationCenter } from "./NotificationCenter";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const getDashboardHref = () => {
    if (!user) return "/dashboard";
    if (user.role === "admin") return "/admin";
    if (user.role === "volunteer") return "/volunteer";
    if (user.role === "organizer") return "/organizer";
    return "/dashboard";
  };

  const navItems = isAuthenticated
    ? [
        { label: "Dashboard", href: getDashboardHref() },
        { label: "AI Assistant", href: "/chat" },
        { label: "Food Finder", href: "/food", roleGated: ["fan", "admin"] },
        { label: "Transport", href: "/transport" },
        { label: "SOS Help", href: "/emergency" },
        { label: "Accessibility", href: "/accessibility" },
        { label: "Lost & Found", href: "/lost-found" },
      ].filter((item) => !item.roleGated || item.roleGated.includes(user?.role || ""))
    : [
        { label: "Features", href: "#features" },
      ];

  const getHref = (href: string) => {
    if (href.startsWith("#") && location !== "/") {
      return `/${href}`;
    }
    return href;
  };

  const handleSignIn = () => {
    setLocation("/login");
  };

  const handleGetStarted = () => {
    setLocation("/register");
  };

  const handleSignOut = async () => {
    await logout();
    setIsOpen(false);
    setLocation("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-2 font-bold text-xl text-indigo-600 hover:text-indigo-700 transition-colors">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold animate-pulse-soft">
              SQ
            </div>
            <span>StadiumIQ</span>
          </a>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link key={item.href} href={getHref(item.href)}>
              <a className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
                {item.label}
              </a>
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="btn-press"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon size={18} className="text-slate-700" />
            ) : (
              <Sun size={18} className="text-slate-300" />
            )}
          </Button>

          {isAuthenticated ? (
            <>
              <NotificationCenter />
              {user?.profileImage ? (
                <button
                  onClick={() => setLocation("/profile")}
                  className="w-8 h-8 rounded-full border border-indigo-200 overflow-hidden btn-press cursor-pointer flex-shrink-0"
                  title="My Profile"
                >
                  <img src={user.profileImage} alt="User Avatar" className="w-full h-full object-cover" />
                </button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/profile")}
                  className="btn-press"
                  title="My Profile"
                >
                  <User size={18} className="text-slate-700" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/settings")}
                className="btn-press"
                title="Settings"
              >
                <Settings size={18} className="text-slate-700" />
              </Button>
              <Button onClick={handleSignOut} variant="outline" size="sm" className="btn-press border-red-200 text-red-600 hover:bg-red-50">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleSignIn} variant="outline" size="sm" className="btn-press">
                Sign In
              </Button>
              <Button onClick={handleGetStarted} size="sm" className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white">
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden btn-press"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white animate-slide-in-down">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <Link key={item.href} href={getHref(item.href)}>
                <a
                  className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors py-2 border-b border-slate-100"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="btn-press w-full gap-2 justify-center"
              >
                {theme === 'light' ? (
                  <>
                    <Moon size={16} />
                    Dark Mode
                  </>
                ) : (
                  <>
                    <Sun size={16} />
                    Light Mode
                  </>
                )}
              </Button>
              {isAuthenticated ? (
                <>
                  <div className="flex justify-between items-center px-4 py-2 border-y border-slate-100">
                    <span className="text-xs text-slate-500 font-medium">Alerts</span>
                    <NotificationCenter />
                  </div>
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      setLocation("/profile");
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full btn-press gap-2 justify-center"
                  >
                    <User size={16} /> My Profile
                  </Button>
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      setLocation("/settings");
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full btn-press gap-2 justify-center"
                  >
                    <Settings size={16} /> Settings
                  </Button>
                  <Button onClick={handleSignOut} variant="outline" size="sm" className="w-full btn-press border-red-200 text-red-600 hover:bg-red-50">
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleSignIn} variant="outline" size="sm" className="flex-1 btn-press">
                    Sign In
                  </Button>
                  <Button
                    onClick={handleGetStarted}
                    size="sm"
                    className="flex-1 btn-press bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
