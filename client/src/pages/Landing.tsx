import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { FeatureCard } from "@/components/FeatureCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { useLocation as useGeoLocation } from "@/contexts/LocationContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  MessageSquare,
  MapPin,
  Users,
  Utensils,
  AlertCircle,
  Accessibility,
  Navigation as NavigationIcon,
  Zap,
  BarChart3,
} from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { trackingStatus, requestPermission } = useGeoLocation();
  const [dismissed, setDismissed] = useState(false);
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.role === "admin") {
        setLocation("/admin");
      } else if (user.role === "volunteer") {
        setLocation("/volunteer");
      } else if (user.role === "organizer") {
        setLocation("/organizer");
      } else {
        setLocation("/fan/dashboard");
      }
    }
  }, [isAuthenticated, user, loading, setLocation]);

  const features = [
    {
      icon: MessageSquare,
      title: "AI Stadium Chatbot",
      description:
        "Ask anything about the stadium. Get instant, intelligent answers powered by Gemini AI.",
    },
    {
      icon: MapPin,
      title: "Smart Navigation",
      description:
        "Find the shortest route, wheelchair-accessible paths, or less crowded alternatives.",
    },
    {
      icon: Users,
      title: "Crowd Density Detection",
      description:
        "Real-time crowd levels at every gate. AI recommends the best entry point.",
    },
    {
      icon: Utensils,
      title: "Food Stall Finder",
      description:
        "Discover food options with queue times, ratings, and walking directions.",
    },
    {
      icon: AlertCircle,
      title: "Emergency SOS",
      description:
        "One-tap emergency assistance. Instant access to exits, medical rooms, and staff.",
    },
    {
      icon: Accessibility,
      title: "Accessibility Tools",
      description:
        "Wheelchair routes, elevator navigation, accessible washrooms, and sign language videos.",
    },
    {
      icon: NavigationIcon,
      title: "Transportation Assistant",
      description:
        "Post-match guidance: metro routes, taxi wait times, bus schedules, and fares.",
    },
    {
      icon: Zap,
      title: "Multilingual Support",
      description:
        "Real-time translation in English, Spanish, French, Portuguese, Hindi, and Arabic.",
    },
    {
      icon: BarChart3,
      title: "Admin Analytics",
      description:
        "Live crowd heatmaps, incident reports, visitor analytics, and operational insights.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-0 relative overflow-hidden min-h-[550px] flex items-center">
        {/* Background Image with Blended Overlays */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src="/hero-stadium.jpg"
            alt="Stadium Background"
            className="w-full h-full object-cover"
          />
          {/* Subtle multi-layer overlays for theme blending and high readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute inset-0 bg-background/10 dark:bg-background/30" />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-2xl animate-slide-in-up">
            {trackingStatus === "prompt" && !dismissed && (
              <div className="mb-6 p-5 rounded-xl border border-indigo-500/20 bg-background/80 backdrop-blur-md shadow-xl animate-fade-in">
                <p className="text-sm font-medium text-foreground mb-3 leading-relaxed">
                  Enable your live location to receive AI-powered navigation, nearby facilities, emergency assistance, crowd updates, and real-time stadium guidance.
                </p>
                <div className="flex gap-3">
                  <Button 
                    size="sm" 
                    onClick={requestPermission}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium btn-press"
                  >
                    Allow Location
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setDismissed(true)}
                    className="border-border font-medium bg-background/50 btn-press"
                  >
                    Not Now
                  </Button>
                </div>
              </div>
            )}
            <div className="mb-6">
              <StatusBadge
                status="live"
                label="Live at FIFA World Cup 2026"
                className="inline-block"
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Navigate Smarter.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">
                Experience Better.
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
              StadiumIQ AI is your intelligent stadium assistant. Ask questions, navigate
              crowds, find food, and get help—all through one powerful AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => setLocation("/chat")}
                className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Ask AI Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/dashboard")}
                className="btn-press border-border bg-background/60 backdrop-blur-sm"
              >
                View Live Map
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 md:px-0 bg-muted/30 border-y border-border">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Powerful Features for Everyone
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From fans to staff, organizers to volunteers—StadiumIQ AI has tools for
              everyone at the stadium.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  animation: `slide-in-up 0.5s ease-out ${index * 0.1}s both`,
                }}
              >
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 px-4 md:px-0 bg-gradient-to-r from-indigo-50/50 to-cyan-50/50 dark:from-indigo-950/20 dark:to-cyan-950/20">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
            Built for Everyone
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                role: "Fans",
                features: [
                  "AI Navigation",
                  "Live Announcements",
                  "Food Finder",
                  "Emergency Help",
                ],
              },
              {
                role: "Staff",
                features: [
                  "Crowd Alerts",
                  "Emergency Routing",
                  "Incident Reports",
                  "Real-time Data",
                ],
              },
              {
                role: "Volunteers",
                features: [
                  "AI Translation",
                  "Lost People Help",
                  "Accessibility Tools",
                  "Quick Support",
                ],
              },
              {
                role: "Organizers",
                features: [
                  "Live Heatmaps",
                  "Analytics Dashboard",
                  "Incident Management",
                  "Reports & Insights",
                ],
              },
            ].map((group, idx) => (
              <div
                key={idx}
                className="card-hover p-6 bg-card rounded-lg border border-border"
              >
                <h3 className="text-xl font-bold text-indigo-600 mb-4">
                  {group.role}
                </h3>
                <ul className="space-y-3">
                  {group.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-0 bg-background">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Stadium Experience?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the future of stadium management. Experience AI-powered navigation, real-time
            insights, and seamless communication for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setLocation("/role-selection")}
              className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Get Started Today
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setLocation("/login")}
              className="btn-press border-border"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
