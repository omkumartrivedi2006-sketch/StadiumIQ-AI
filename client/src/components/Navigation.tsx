import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, Settings, User, Bell } from "lucide-react";
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

  const getNavItemsByRole = (role: string) => {
    switch (role) {
      case "fan":
        return [
          { label: "Dashboard", href: "/fan/dashboard" },
          { label: "AI Assistant", href: "/fan/chat" },
          { label: "Match Schedule", href: "/fan/schedule" },
          { label: "My Tickets", href: "/fan/tickets" },
          { label: "Stadium Navigation", href: "/fan/navigation" },
          { label: "Food Finder", href: "/fan/food" },
          { label: "Transportation", href: "/fan/transport" },
          { label: "Accessibility", href: "/fan/accessibility" },
        ];
      case "volunteer":
        return [
          { label: "Dashboard", href: "/volunteer/dashboard" },
          { label: "Assigned Tasks", href: "/volunteer/tasks" },
          { label: "Assigned Zone", href: "/volunteer/zone" },
          { label: "Crowd Reports", href: "/volunteer/crowd-reports" },
          { label: "Incident Reports", href: "/volunteer/incident-reports" },
          { label: "Navigation", href: "/volunteer/navigation" },
          { label: "Communication", href: "/volunteer/communication" },
        ];
      case "organizer":
        return [
          { label: "Dashboard", href: "/organizer/dashboard" },
          { label: "Match Operations", href: "/organizer/matches" },
          { label: "Stadium Operations", href: "/organizer/stadiums" },
          { label: "Crowd Analytics", href: "/organizer/crowd-analytics" },
          { label: "Volunteer Management", href: "/organizer/volunteers" },
          { label: "Reports", href: "/organizer/reports" },
        ];
      case "admin":
        return [
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "User Management", href: "/admin/users" },
          { label: "Role Management", href: "/admin/roles" },
          { label: "Stadium Management", href: "/admin/stadiums" },
          { label: "Match Management", href: "/admin/matches" },
          { label: "AI Logs", href: "/admin/ai-logs" },
          { label: "Analytics", href: "/admin/analytics" },
          { label: "System Monitoring", href: "/admin/monitoring" },
        ];
      default:
        return [{ label: "Dashboard", href: "/fan/dashboard" }];
    }
  };

  const isDashboardPage = location.startsWith("/fan/") || 
                          location.startsWith("/volunteer/") || 
                          location.startsWith("/organizer/") || 
                          location.startsWith("/admin/") || 
                          location === "/dashboard" ||
                          location === "/profile" ||
                          location === "/settings" ||
                          location === "/role-selection";

  const displayItems = isAuthenticated && user && isDashboardPage
    ? getNavItemsByRole(user.role)
    : [
        { label: "Home", href: "/" },
        { label: "Features", href: "/features" },
        { label: "Pricing", href: "/pricing" },
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Contact", href: "/contact" },
        ...(isAuthenticated ? [{ label: "Dashboard", href: getDashboardHref() }] : [])
      ];

  const checkActive = (href: string) => {
    const [path, hash] = href.split("#");
    const isPathActive = location === path;
    if (hash) {
      return isPathActive && window.location.hash === `#${hash}`;
    }
    return isPathActive;
  };

  const getHref = (href: string) => {
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3 md:py-3.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" asChild>
          <a className="flex items-center gap-2 font-bold text-xl text-indigo-600 hover:text-indigo-700 transition-colors flex-shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold animate-pulse-soft">
              SQ
            </div>
            <span>StadiumIQ</span>
          </a>
        </Link>

        {/* Desktop Navigation */}
        <div className={isAuthenticated ? "hidden xl:flex items-center justify-center flex-1 mx-4 gap-2 xl:gap-4 max-w-4xl min-w-0" : "hidden xl:flex items-center justify-center flex-1 mx-6 gap-3 xl:gap-5 max-w-5xl"}>
          {displayItems.map((item) => {
            const isActive = checkActive(item.href);
            return (
              <Link key={item.href} href={getHref(item.href)} className={`text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400 font-semibold animate-fade-in"
                  : "text-foreground/80 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <div className={isAuthenticated ? "hidden xl:flex items-center gap-2 xl:gap-3 flex-shrink-0" : "hidden xl:flex items-center gap-2 xl:gap-3 flex-shrink-0"}>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="btn-press relative overflow-hidden"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <span className={`transition-all duration-300 ${theme === 'dark' ? 'opacity-0 scale-50 absolute' : 'opacity-100 scale-100'}`}>
              <Moon size={18} className="text-foreground/70" />
            </span>
            <span className={`transition-all duration-300 ${theme === 'light' ? 'opacity-0 scale-50 absolute' : 'opacity-100 scale-100'}`}>
              <Sun size={18} className="text-amber-400" />
            </span>
          </Button>

          {isAuthenticated ? (
            <>
              <NotificationCenter />
               {user?.profileImage ? (
                 <button
                   onClick={() => setLocation(`/${user?.role}/profile`)}
                   className="w-8 h-8 rounded-full border border-indigo-200 dark:border-indigo-700 overflow-hidden btn-press cursor-pointer flex-shrink-0"
                   title="My Profile"
                 >
                   <img src={user?.profileImage} alt="User Avatar" className="w-full h-full object-cover" />
                 </button>
               ) : (
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => setLocation(`/${user?.role}/profile`)}
                   className="btn-press"
                   title="My Profile"
                 >
                   <User size={18} className="text-foreground/70" />
                 </Button>
               )}
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setLocation(`/${user?.role}/settings`)}
                 className="btn-press"
                 title="Settings"
               >
                 <Settings size={18} className="text-foreground/70" />
               </Button>
              <Button onClick={handleSignOut} variant="outline" size="sm" className="btn-press border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950">
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
          className="xl:hidden btn-press text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="xl:hidden border-t border-border bg-background/95 backdrop-blur-md animate-slide-in-down">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {displayItems.map((item) => {
              const isActive = checkActive(item.href);
              return (
                <Link key={item.href} href={getHref(item.href)}
                  className={`text-sm font-medium transition-colors py-2 border-b border-border ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-foreground/80 hover:text-indigo-600 dark:hover:text-indigo-400"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
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
                    <Sun size={16} className="text-amber-400" />
                    Light Mode
                  </>
                )}
              </Button>
              {isAuthenticated ? (
                <>
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      setLocation(`/${user?.role}/notifications`);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full btn-press gap-2 justify-center"
                  >
                    <Bell size={16} /> Notifications
                  </Button>
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      setLocation(`/${user?.role}/profile`);
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
                      setLocation(`/${user?.role}/settings`);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full btn-press gap-2 justify-center"
                  >
                    <Settings size={16} /> Settings
                  </Button>

                  <Button onClick={handleSignOut} variant="outline" size="sm" className="w-full btn-press border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950">
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
