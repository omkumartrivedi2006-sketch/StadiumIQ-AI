import React from "react";
import { Navigation } from "@/components/Navigation";

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
}
