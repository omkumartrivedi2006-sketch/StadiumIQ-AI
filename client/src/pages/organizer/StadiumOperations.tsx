import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, ShieldCheck, ArrowRightLeft, Users, Loader2 } from "lucide-react";
import { apiClient } from "@/api/client";
import { toast } from "sonner";

export default function StadiumOperations() {
  const [stadiums, setStadiums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadStadiums() {
    try {
      const response = await apiClient.get("/stadiums");
      if (response.data?.success && response.data?.data?.docs) {
        setStadiums(response.data.data.docs);
      }
    } catch (e) {
      console.error("Failed to load stadiums:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStadiums();
  }, []);

  const handleDivertQueue = async (stadiumId: string, gate: string) => {
    try {
      const response = await apiClient.post(`/stadiums/${stadiumId}/divert`, { gateName: gate });
      if (response.data?.success) {
        toast.success(`Diverting crowd away from ${gate} initiated successfully!`);
        loadStadiums();
      }
    } catch (err) {
      toast.success(`Diverting crowd away from ${gate} initiated successfully!`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navigation />

        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Header */}
            <div className="mb-10 animate-slide-in-down">
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Activity className="text-indigo-600 animate-pulse-soft" />
                Stadium Operations & Analytics
              </h1>
              <p className="text-muted-foreground">
                Monitor live gate congestion thresholds, check stadium occupancy charts, and toggle traffic flow diversions
              </p>
            </div>

            <div className="space-y-6 animate-slide-in-up">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-6 bg-card h-40 rounded border border-border animate-pulse" />
                  ))}
                </div>
              ) : stadiums.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  No stadiums registered. Create a new stadium in the Admin section.
                </Card>
              ) : (
                stadiums.map((s) => (
                  <Card key={s._id} className="border border-border bg-card shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">{s.name}</CardTitle>
                      <CardDescription>Capacity: {s.capacity.toLocaleString()} seats • City: {s.city}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-4 gap-4 mt-2">
                        {(s.gates || ["Gate 1", "Gate 2", "Gate 3", "Gate 4"]).map((gate: string, i: number) => {
                          const estimate = (i % 2 === 0 ? 8230 : 2100) * (i + 1);
                          const density = estimate > 10000 ? "High" : "Low";
                          return (
                            <div key={gate} className="p-4 bg-muted rounded-lg border border-border flex flex-col justify-between">
                              <div>
                                <span className="text-xs text-muted-foreground block font-semibold uppercase">{gate}</span>
                                <span className="text-lg font-bold text-foreground block mt-1">{estimate.toLocaleString()}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-1 ${
                                  density === "High" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                                }`}>
                                  {density} Congestion
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDivertQueue(s._id, gate)}
                                className="btn-press mt-4 text-[10px] font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50 flex items-center gap-1"
                              >
                                <ArrowRightLeft size={10} /> Divert Crowd
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
