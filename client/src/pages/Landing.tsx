import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { FeatureCard } from "@/components/FeatureCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-0">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="animate-slide-in-up">
              <div className="mb-6">
                <StatusBadge
                  status="live"
                  label="Live at FIFA World Cup 2026"
                  className="inline-block"
                />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Navigate Smarter.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                  Experience Better.
                </span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
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
                  className="btn-press border-slate-300"
                >
                  View Live Map
                </Button>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="animate-slide-in-down hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-cyan-500/20 rounded-2xl blur-3xl" />
                <img
                  src="/hero-stadium.jpg"
                  alt="Stadium AI Assistant"
                  className="relative rounded-2xl shadow-2xl w-full h-[400px] object-cover border border-slate-100/50"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 md:px-0 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Powerful Features for Everyone
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
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
      <section className="py-20 px-4 md:px-0 bg-gradient-to-r from-indigo-50 to-cyan-50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">
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
                      <span className="text-sm text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-0 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            Ready to Transform Your Stadium Experience?
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
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
              className="btn-press border-slate-300"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 md:px-0 bg-background">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-slate-900 mb-4">StadiumIQ AI</h4>
              <p className="text-sm text-slate-600">
                Intelligent stadium assistance for FIFA World Cup 2026.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a href="#features" className="hover:text-indigo-600">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-indigo-600">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="/dashboard" className="hover:text-indigo-600">
                    Dashboard
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a href="#" className="hover:text-indigo-600">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-indigo-600">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-indigo-600">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a href="#" className="hover:text-indigo-600">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-indigo-600">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-slate-600">
            <p>&copy; 2026 StadiumIQ AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
