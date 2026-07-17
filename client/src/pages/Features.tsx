import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FeatureCard } from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
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
  Shield, 
  Clock, 
  ChevronRight 
} from "lucide-react";

export default function Features() {
  const [, setLocation] = useLocation();

  const coreFeatures = [
    {
      icon: MessageSquare,
      title: "AI Stadium Chatbot",
      description: "Get real-time answers about event schedules, gate openings, baggage rules, or tickets powered by Gemini AI.",
    },
    {
      icon: MapPin,
      title: "Smart Pathfinding",
      description: "Navigate complex layouts with active instructions mapping out elevator availability and wheelchair routes.",
    },
    {
      icon: Users,
      title: "Gate Density Monitors",
      description: "Receive alert notifications warning you of congested turnstiles and recommending faster alternatives.",
    },
    {
      icon: Utensils,
      title: "Food Stall Tracker",
      description: "Browse vendor menus, queue durations, wait estimations, and walking maps to minimize missed match time.",
    },
    {
      icon: AlertCircle,
      title: "Instant SOS Triggers",
      description: "Emergency buttons connecting you instantly to stadium medical dispatchers and nearby security stewards.",
    },
    {
      icon: Accessibility,
      title: "Accessibility Assistants",
      description: "Voice prompts, sign language video references, and tactile descriptions ensuring inclusion for all visitors.",
    },
  ];

  const benefits = [
    {
      title: "For Fans & Attendees",
      items: [
        "Minimize line wait times at food stalls and gates.",
        "Get instant assistance in your preferred language.",
        "Secure routes tailored to mobility constraints.",
      ]
    },
    {
      title: "For Volunteers & Staff",
      items: [
        "Translate questions instantly to guide foreign tourists.",
        "Coordinate lost & found operations efficiently.",
        "Report physical obstacles or facility incidents in real-time.",
      ]
    },
    {
      title: "For Organizers & Admins",
      items: [
        "Track crowd heatmaps to prevent stampedes.",
        "Deploy safety personnel directly via incident alerts.",
        "Gather visitor analytics to optimize match-day operations.",
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navigation />

        <div className="pt-32 pb-20 px-4 md:px-0">
          <div className="container mx-auto max-w-6xl">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto mb-16 animate-slide-in-down">
              <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6 leading-tight">
                StadiumIQ AI <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">
                  Feature Suite
                </span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                StadiumIQ AI integrates real-time positioning, smart translation, crowd density cameras, and emergency dispatch into one premium dashboard.
              </p>
            </div>

            {/* Core Features Grid */}
            <div className="mb-24">
              <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Core Features</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {coreFeatures.map((f, i) => (
                  <FeatureCard
                    key={i}
                    icon={f.icon}
                    title={f.title}
                    description={f.description}
                    gradient
                  />
                ))}
              </div>
            </div>

            {/* Visual Placeholders / Screenshots section */}
            <div className="mb-24">
              <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Dashboard Interface Preview</h2>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Real-time Data Synced</h3>
                      <p className="text-muted-foreground text-sm mt-1">Our system coordinates gate sensors, queue estimates, and transport timings every 5 seconds for complete accuracy.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Secure Emergency Gating</h3>
                      <p className="text-muted-foreground text-sm mt-1">SOS alerts bypass all standard operations queue, reaching safety staff in milliseconds with high-priority notifications.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Offline Capabilities</h3>
                      <p className="text-muted-foreground text-sm mt-1">Match tickets, offline maps, and basic guides are cached directly in your browser. Access them even with poor cell signal.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden p-4 relative">
                  <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />
                  <div className="bg-background border border-border rounded-xl h-72 flex flex-col justify-between p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">stadiumiq-dashboard.app</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
                      <BarChart3 className="text-indigo-600 dark:text-indigo-400 w-16 h-16 animate-pulse-soft" />
                      <div>
                        <p className="font-bold text-foreground">Crowd Heatmaps & Gate Flow</p>
                        <p className="text-xs text-muted-foreground mt-1">Gate A: 92% (High) | Gate B: 24% (Low) | Recommend diversion</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits section */}
            <div className="mb-24">
              <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Benefits By Role</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {benefits.map((b, i) => (
                  <Card key={i} className="border border-border bg-card p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400 mb-4">{b.title}</h3>
                    <ul className="space-y-3">
                      {b.items.map((item, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-foreground">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </div>

            {/* Call To Action */}
            <Card className="bg-gradient-to-r from-indigo-900 to-slate-900 dark:from-indigo-950 dark:to-slate-950 text-white rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden border border-indigo-800">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
              <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <h2 className="text-3xl md:text-4xl font-extrabold">Ready to Explore StadiumIQ AI?</h2>
                <p className="text-indigo-200">
                  Register today and experience real-time match insights, smart navigation guidance, and instant support during matches.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button onClick={() => setLocation("/register")} className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-6 rounded-xl">
                    Register Account <ChevronRight size={16} />
                  </Button>
                  <Button onClick={() => setLocation("/contact")} variant="outline" className="btn-press border-white/20 text-white hover:bg-white/10 font-bold px-8 py-6 rounded-xl">
                    Contact Support
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
