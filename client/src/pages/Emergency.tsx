import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  MapPin,
  Phone,
  Heart,
  Navigation as NavigationIcon,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { emergencyService } from "@/services/emergency";
import { aiService } from "@/services/ai";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Emergency() {
  const [sosActive, setSosActive] = useState(false);
  const [alertId, setAlertId] = useState<string | null>(null);
  const { user } = useAuth();

  // AI State
  const [aiQuery, setAiQuery] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleQueryAI = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
      const reply = await aiService.getEmergencyGuidance(aiQuery);
      setAiReply(reply);
    } catch (err) {
      toast.error("Failed to fetch AI safety recommendations.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    async function loadActiveAlerts() {
      try {
        const alerts = await emergencyService.getActiveAlerts();
        // Check if current user has an active alert
        const myAlert = alerts.find((a) => a.userId === user?.id);
        if (myAlert) {
          setSosActive(true);
          setAlertId(myAlert.id);
        }
      } catch (e) {
        console.error("Failed to fetch active alerts:", e);
      }
    }
    if (user) {
      loadActiveAlerts();
    }
  }, [user]);

  const handleSOSToggle = async () => {
    if (sosActive) {
      if (alertId) {
        const success = await emergencyService.resolveAlert(alertId);
        if (success) {
          toast.success("SOS Alert resolved. Thank you.");
        }
      }
      setSosActive(false);
      setAlertId(null);
    } else {
      setSosActive(true);
      try {
        const result = await emergencyService.triggerSOS("Section B - Row 12");
        setAlertId(result.id);
        toast.error("Emergency SOS triggered! Staff has been notified.");
      } catch (e) {
        toast.error("Failed to trigger SOS alert.");
        setSosActive(false);
      }
    }
  };

  const emergencyServices = [
    {
      icon: Heart,
      title: "Medical Help",
      description: "Nearest medical room and first aid",
      location: "Section C - 2 min away",
    },
    {
      icon: MapPin,
      title: "Nearest Exit",
      description: "Quick evacuation route",
      location: "Gate 3 - 1 min away",
    },
    {
      icon: Phone,
      title: "Security",
      description: "Contact stadium security",
      location: "Available 24/7",
    },
    {
      icon: NavigationIcon,
      title: "Accessibility",
      description: "Accessible routes and facilities",
      location: "Elevator - 2 min away",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* SOS Button */}
          <div className="mb-12 animate-slide-in-down">
            <h1 className="text-4xl font-bold text-foreground mb-8 text-center">
              Emergency Assistance
            </h1>

            <div className="flex justify-center mb-8">
              <button
                onClick={handleSOSToggle}
                className={`relative w-32 h-32 rounded-full font-bold text-xl transition-all duration-300 flex items-center justify-center btn-press ${
                  sosActive
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-2xl scale-110"
                    : "bg-red-500 hover:bg-red-600 text-white shadow-lg"
                }`}
              >
                {sosActive && (
                  <div className="absolute inset-0 rounded-full bg-red-600 animate-pulse opacity-75" />
                )}
                <span className="relative z-10">SOS</span>
              </button>
            </div>

            {sosActive && (
              <div className="animate-scale-in text-center mb-8 p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-red-700 font-semibold">
                  Emergency services have been alerted. Your location is being shared with
                  stadium staff.
                </p>
              </div>
            )}
          </div>

          {/* AI Emergency Assistant Card */}
          <div className="mb-8 animate-slide-in-up p-6 bg-card rounded-lg border border-red-200 dark:border-red-900">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-red-600 animate-pulse" size={20} />
              <h2 className="text-lg font-semibold text-foreground">AI Emergency Guide</h2>
            </div>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Ask emergency instructions (e.g. what to do in a fire, nearest first aid room, lost child guidance)..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !aiLoading) handleQueryAI();
                }}
                disabled={aiLoading}
                className="bg-card"
              />
              <Button
                onClick={handleQueryAI}
                disabled={aiLoading || !aiQuery.trim()}
                className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
              >
                {aiLoading ? <Loader2 size={16} className="animate-spin" /> : "Ask AI"}
              </Button>
            </div>
            {aiReply && (
              <div className="mt-4 p-4 bg-muted rounded-lg border border-border text-sm text-foreground leading-relaxed shadow-sm">
                <span className="font-semibold text-red-600 block mb-1">AI Safety Recommendation:</span>
                {aiReply}
              </div>
            )}
          </div>

          {/* Emergency Services Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {emergencyServices.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div
                  key={idx}
                  style={{
                    animation: `slide-in-up 0.5s ease-out ${idx * 0.1}s both`,
                  }}
                  className="card-hover p-6 bg-card rounded-lg border border-border"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Icon size={24} className="text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {service.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {service.description}
                      </p>
                      <p className="text-sm font-medium text-red-600">
                        {service.location}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Emergency Contacts */}
          <div className="animate-slide-in-up p-8 bg-card rounded-lg border border-border mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Emergency Contacts
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-muted rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Emergency Services</p>
                <p className="text-2xl font-bold text-foreground">911</p>
              </div>
              <div className="p-4 bg-muted rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Stadium Security</p>
                <p className="text-2xl font-bold text-foreground">+1-555-0100</p>
              </div>
              <div className="p-4 bg-muted rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Medical Assistance</p>
                <p className="text-2xl font-bold text-foreground">+1-555-0101</p>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="animate-slide-in-up p-6 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/50">
            <div className="flex gap-4">
              <AlertCircle className="text-amber-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Important Information
                </h3>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li>• Always keep your phone charged during the match</li>
                  <li>• Share your location with trusted contacts</li>
                  <li>• Know the location of nearest exits and medical facilities</li>
                  <li>• Report any suspicious activity to security immediately</li>
                  <li>• Follow all staff instructions during emergencies</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
