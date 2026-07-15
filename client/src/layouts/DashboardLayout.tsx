import React from "react";
import { Navigation } from "@/components/Navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </div>
    </div>
  );
}
