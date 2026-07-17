import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, MapPin, Users, Info } from "lucide-react";
import { apiClient } from "@/api/client";

export default function VolunteerZone() {
  const [zone, setZone] = useState<any>({ name: "Zone B (East Entrance)", manager: "Sarah Jenkins", coverage: ["Gate 2", "Food Court Section C"] });
  const [gates, setGates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGates() {
      try {
        const response = await apiClient.get("/stadiums");
        if (response.data?.success && response.data?.data?.docs?.length > 0) {
          const stad = response.data.data.docs[0];
          setGates(
            (stad.gates || ["Gate 1", "Gate 2", "Gate 3", "Gate 4"]).map((g: string, i: number) => ({
              gate: g,
              crowd: i % 2 === 0 ? "High" : "Low",
              visitors: i % 2 === 0 ? 8230 : 2100,
            }))
          );
        }
      } catch (err) {
        setGates([
          { gate: "Gate 2 (East Entrance)", crowd: "High", visitors: 8230 },
          { gate: "Gate 3 (South Side)", crowd: "Low", visitors: 4890 },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadGates();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navigation />

        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Header */}
            <div className="mb-10 animate-slide-in-down">
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Shield className="text-indigo-600 animate-pulse-soft" />
                Assigned Zone
              </h1>
              <p className="text-muted-foreground">
                View your active area coverage, supervisor details, and zone operational crowd levels
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 animate-slide-in-up">
              {/* Zone info */}
              <div className="md:col-span-1 space-y-4">
                <Card className="border border-border bg-card p-5">
                  <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-1.5">
                    <MapPin size={16} className="text-indigo-600" />
                    Coverage Information
                  </h3>
                  <div className="space-y-3 text-xs text-muted-foreground">
                    <div>
                      <span className="font-bold text-foreground block">Active Zone</span>
                      <span>{zone.name}</span>
                    </div>
                    <div>
                      <span className="font-bold text-foreground block">Supervisor</span>
                      <span>{zone.manager}</span>
                    </div>
                    <div>
                      <span className="font-bold text-foreground block">Assigned Areas</span>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        {zone.coverage.map((c: string, idx: number) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Gate logs */}
              <div className="md:col-span-2">
                <Card className="border border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Users className="text-indigo-600" size={20} />
                      <span>Zone Crowd Levels</span>
                    </CardTitle>
                    <CardDescription>Real-time gate occupancy levels inside your sector</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <div key={i} className="p-4 bg-muted h-16 rounded animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {gates.map((g, idx) => (
                          <div key={idx} className="p-4 bg-muted rounded-lg border border-border">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-foreground text-sm">{g.gate}</span>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                g.crowd === "High" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                              }`}>
                                {g.crowd} Crowd
                              </span>
                            </div>
                            <div className="w-full bg-border rounded-full h-1.5 mt-2">
                              <div
                                className={`h-full rounded-full ${g.crowd === "High" ? "bg-red-500" : "bg-green-500"}`}
                                style={{ width: `${(g.visitors / 10000) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
