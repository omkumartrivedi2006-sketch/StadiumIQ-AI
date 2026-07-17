import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Globe, Users, Cpu, ShieldAlert, Award, Calendar } from "lucide-react";

export default function About() {
  const [, setLocation] = useLocation();

  const milestones = [
    { year: "2024", title: "Project Inception", desc: "Formed the initial core engineering team to design AI solutions for large public arenas." },
    { year: "2025", title: "GCP & Gemini Integration", desc: "Collaborated with advanced AI models to translate, forecast crowd density, and resolve tickets." },
    { year: "2026", title: "FIFA World Cup Deployment", desc: "Launched live pilot support systems across MetLife Stadium for international visitor guidelines." },
  ];

  const team = [
    { name: "Sophia Martinez", role: "Co-Founder & AI Lead", bio: "Former GCP Machine Learning Architect specializing in large arena crowd flow algorithms.", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop" },
    { name: "Marcus Chen", role: "Head of Infrastructure", bio: "Expert Node/Express engineer focused on low-latency Socket.io SOS routing services.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop" },
    { name: "Elena Rostova", role: "Lead Frontend Engineer", bio: "Next.js & Tailwind Specialist passionate about creating highly accessible WCAG UIs.", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop" },
  ];

  const stack = [
    { name: "React & TypeScript", desc: "High-performance components and type-safe frontends." },
    { name: "Tailwind CSS", desc: "Modern, unified Light/Dark design system with fluid animations." },
    { name: "Node.js & Express", desc: "Fast event-driven REST APIs and real-time backend structures." },
    { name: "MongoDB Atlas", desc: "Robust data store for matching tickets, users, and food queues." },
    { name: "Gemini AI API", desc: "Powering smart chat assistance, path recommendations, and translation." },
    { name: "Socket.io", desc: "Powering instant notifications and SOS emergency alerts." },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navigation />

        <div className="pt-32 pb-20 px-4 md:px-0">
          <div className="container mx-auto max-w-6xl">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto mb-16 animate-slide-in-down">
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">About StadiumIQ AI</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                StadiumIQ AI is an enterprise-grade SaaS system dedicated to improving crowd safety, navigation, and fan experience at the world's largest sporting events.
              </p>
            </div>

            {/* Mission & Vision */}
            <div className="grid md:grid-cols-2 gap-8 mb-20">
              <Card className="border border-border bg-card p-8 shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                  <Globe size={24} />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Our Mission</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  To empower event organizers, volunteers, and fans with real-time AI assistant tools that remove friction from stadium visits. We believe navigation and safety during matches should be seamless.
                </p>
              </Card>
              <Card className="border border-border bg-card p-8 shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                  <Users size={24} />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Our Vision</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  A future where smart technology automatically coordinates stadium logistics—diverting crowds dynamically, assisting guests with accessibility needs, and responding to medical alerts in milliseconds.
                </p>
              </Card>
            </div>

            {/* How AI Helps */}
            <div className="mb-20">
              <h2 className="text-3xl font-bold text-foreground text-center mb-12">How AI Helps Stadium Management</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Cpu size={18} className="text-indigo-600 dark:text-indigo-400" />
                    Intelligent Routing
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Rather than fixed map directions, our AI calculates walking speeds, current stair/elevator states, and active gate counts to route fans.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Globe size={18} className="text-indigo-600 dark:text-indigo-400" />
                    Multilingual Bridges
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    AI real-time translations allow volunteers to guide international visitors immediately, eliminating language barriers during matches.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <ShieldAlert size={18} className="text-indigo-600 dark:text-indigo-400" />
                    Emergency Safety
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    In high-stress situations, the AI helps direct fans safely to nearest fire/medical exits, providing clear step-by-step guides.
                  </p>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="mb-20">
              <h2 className="text-3xl font-bold text-foreground text-center mb-12">Technology Stack</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {stack.map((s, idx) => (
                  <Card key={idx} className="border border-border bg-card p-6 shadow-sm">
                    <h4 className="font-bold text-foreground mb-2">{s.name}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Development Team */}
            <div className="mb-20">
              <h2 className="text-3xl font-bold text-foreground text-center mb-12">Meet Our Leadership Team</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {team.map((t, idx) => (
                  <Card key={idx} className="border border-border bg-card p-6 text-center shadow-sm flex flex-col items-center">
                    <img src={t.img} alt={t.name} className="w-20 h-20 rounded-full object-cover border-2 border-indigo-200 mb-4" />
                    <h4 className="font-bold text-foreground text-lg">{t.name}</h4>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider block mt-1">{t.role}</span>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{t.bio}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-20">
              <h2 className="text-3xl font-bold text-foreground text-center mb-12">Our Journey</h2>
              <div className="relative border-l border-border md:ml-24 max-w-3xl">
                {milestones.map((m, idx) => (
                  <div key={idx} className="mb-10 ml-6 relative">
                    <div className="absolute -left-9 top-1.5 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 border-2 border-indigo-600 flex items-center justify-center">
                      <Calendar size={12} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{m.year}</span>
                    <h4 className="text-lg font-bold text-foreground mt-1">{m.title}</h4>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Call To Action */}
            <div className="text-center py-10">
              <h3 className="text-2xl font-bold text-foreground mb-4">Want to Join Us?</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
                Have inquiries about partner integrations or event operations for StadiumIQ AI? Contact our coordinators today.
              </p>
              <Button onClick={() => setLocation("/contact")} className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl">
                Contact Our Team
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
