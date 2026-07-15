import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accessibility as AccessibilityIcon,
  Zap,
  Volume2,
  Eye,
  Ear,
  MapPin,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { aiService } from "@/services/ai";
import { toast } from "sonner";

interface AccessibilityFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
}

export default function Accessibility() {
  // AI State
  const [aiQuery, setAiQuery] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleQueryAI = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
      const reply = await aiService.getAccessibilityAdvice(aiQuery);
      setAiReply(reply);
    } catch (err) {
      toast.error("Failed to fetch AI accessibility suggestions.");
    } finally {
      setAiLoading(false);
    }
  };

  const features: AccessibilityFeature[] = [
    {
      icon: <AccessibilityIcon size={24} />,
      title: "Wheelchair Access",
      description: "Complete wheelchair-accessible routes and facilities",
      details: [
        "Accessible entrances at all gates",
        "Elevator access to all sections",
        "Accessible seating areas",
        "Accessible restrooms throughout stadium",
      ],
    },
    {
      icon: <Eye size={24} />,
      title: "Visual Assistance",
      description: "Tools for users with visual impairments",
      details: [
        "High contrast mode for app",
        "Text-to-speech for all content",
        "Large font options",
        "Screen reader compatible",
      ],
    },
    {
      icon: <Ear size={24} />,
      title: "Hearing Assistance",
      description: "Support for users with hearing impairments",
      details: [
        "Live captions for announcements",
        "Sign language interpreters available",
        "Visual alerts for important notifications",
        "Hearing loop systems at information desks",
      ],
    },
    {
      icon: <Volume2 size={24} />,
      title: "Audio Description",
      description: "Detailed audio descriptions of the match",
      details: [
        "Play-by-play audio commentary",
        "Stadium environment descriptions",
        "Crowd reaction audio",
        "Multiple language options",
      ],
    },
    {
      icon: <MapPin size={24} />,
      title: "Navigation Assistance",
      description: "Accessible routes and wayfinding",
      details: [
        "Tactile maps available",
        "Voice-guided navigation",
        "Accessible parking information",
        "Service animal friendly areas",
      ],
    },
    {
      icon: <Zap size={24} />,
      title: "Mobility Support",
      description: "Equipment and assistance for mobility needs",
      details: [
        "Wheelchair rental available",
        "Accessible transportation options",
        "Rest areas throughout stadium",
        "Staff assistance available",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-12 animate-slide-in-down">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Accessibility Services
            </h1>
            <p className="text-slate-600">
              We're committed to making StadiumIQ accessible to everyone
            </p>
          </div>

          {/* AI Accessibility Assistant Card */}
          <div className="mb-8 animate-slide-in-up p-6 bg-white rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50/50 to-cyan-50/50">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-indigo-600 animate-pulse" size={20} />
              <h2 className="text-lg font-semibold text-slate-900">AI Accessibility Assistant</h2>
            </div>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Ask accessibility recommendations (e.g. lift locations, wheelchair pathways, sensory rooms)..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !aiLoading) handleQueryAI();
                }}
                disabled={aiLoading}
                className="bg-white"
              />
              <Button
                onClick={handleQueryAI}
                disabled={aiLoading || !aiQuery.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex-shrink-0"
              >
                {aiLoading ? <Loader2 size={16} className="animate-spin" /> : "Ask AI"}
              </Button>
            </div>
            {aiReply && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200 text-sm text-slate-700 leading-relaxed shadow-sm">
                <span className="font-semibold text-indigo-600 block mb-1">AI Recommendation:</span>
                {aiReply}
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature, idx) => (
              <div
                key={idx}
                style={{
                  animation: `slide-in-up 0.5s ease-out ${idx * 0.1}s both`,
                }}
                className="card-hover p-6 bg-white rounded-lg border border-slate-200"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Request Assistance */}
          <div className="animate-slide-in-up p-8 bg-white rounded-lg border border-slate-200 mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Request Assistance
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">
                  Before Your Visit
                </h3>
                <p className="text-slate-700 mb-4">
                  Contact us in advance to arrange accommodations and services tailored to
                  your needs.
                </p>
                <Button className="btn-press bg-indigo-600 hover:bg-indigo-700">
                  Pre-Arrange Services
                </Button>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">
                  During Your Visit
                </h3>
                <p className="text-slate-700 mb-4">
                  Our accessibility team is available throughout the stadium to provide
                  real-time assistance.
                </p>
                <Button variant="outline" className="btn-press">
                  Request Help
                </Button>
              </div>
            </div>
          </div>

          {/* Accessibility Contact */}
          <div className="animate-slide-in-up p-8 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-lg border border-indigo-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Accessibility Support
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-2 uppercase tracking-wide font-semibold">
                  Phone
                </p>
                <p className="text-2xl font-bold text-slate-900">+1-555-0102</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2 uppercase tracking-wide font-semibold">
                  Email
                </p>
                <p className="text-lg font-bold text-slate-900">
                  access@stadiumiq.com
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2 uppercase tracking-wide font-semibold">
                  Hours
                </p>
                <p className="text-lg font-bold text-slate-900">24/7 Available</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg border border-indigo-200">
              <p className="text-sm text-slate-700">
                Our accessibility team is trained to assist with a wide range of needs. We
                welcome feedback to continuously improve our services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
