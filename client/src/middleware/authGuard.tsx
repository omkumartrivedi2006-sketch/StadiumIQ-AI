import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: Array<"fan" | "volunteer" | "organizer" | "admin">;
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const [, setLocation] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        setLocation("/login");
        return;
      }

      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        setLocation("/unauthorized");
      }
    }
  }, [loading, isAuthenticated, user, allowedRoles, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner className="w-10 h-10 text-indigo-600" />
      </div>
    );
  }

  // If unauthorized, do not render content (redirect handles the view switch)
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return isAuthenticated ? <>{children}</> : null;
}
