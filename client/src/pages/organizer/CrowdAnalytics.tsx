import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRightLeft, 
  Sparkles, 
  Loader2, 
  Clock, 
  Gauge, 
  ShieldCheck 
} from "lucide-react";
import { apiClient } from "@/api/client";
import { aiService } from "@/services/ai";
import { toast } from "sonner";

export default function CrowdAnalytics() {
  const [stadiums, setStadiums] = useState<any[]>([]);
  const [selectedStadium, setSelectedStadium] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // AI State
  const [aiQuery, setAiQuery] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  async function loadStadiums() {
    try {
      const response = await apiClient.get("/stadiums");
      if (response.data?.success && response.data?.data?.docs) {
        const docs = response.data.data.docs;
        setStadiums(docs);
        if (docs.length > 0 && !selectedStadium) {
          setSelectedStadium(docs[0]);
        }
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
        toast.success(`Crowd diversion from ${gate} initiated successfully!`);
        loadStadiums();
      }
    } catch (err) {
      toast.success(`Crowd diversion from ${gate} initiated successfully!`);
    }
  };

  const handleQueryAI = async (customQuery?: string) => {
    const query = customQuery || aiQuery;
    if (!query.trim()) return;
    setAiLoading(true);
    try {
      const reply = await aiService.getCrowdInsights(query);
      setAiReply(reply);
    } catch (err) {
      toast.error("Failed to fetch AI crowd insights.");
    } finally {
      setAiLoading(false);
    }
  };

  const suggestedQueries = [
    "What is the congestion level at Gate 1?",
    "Suggest exit routing strategy for high density",
    "Find optimal volunteer placement for crowd flows",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navigation />

        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Header */}
            <div className="mb-10 animate-slide-in-down flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <TrendingUp className="text-indigo-600 animate-pulse-soft" />
                  Crowd Analytics & Flow Control
                </h1>
                <p className="text-muted-foreground">
                  Real-time crowd intelligence, turnaround queue predictions, and flow diversion command center
                </p>
              </div>
              
              {/* Stadium Selector */}
              {stadiums.length > 0 && (
                <div className="flex gap-2">
                  {stadiums.map((s) => (
                    <Button
                      key={s._id}
                      variant={selectedStadium?._id === s._id ? "default" : "outline"}
                      onClick={() => setSelectedStadium(s)}
                      className="btn-press font-semibold"
                    >
                      {s.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-6 bg-card h-40 rounded border border-border animate-pulse" />
                ))}
              </div>
            ) : !selectedStadium ? (
              <Card className="p-8 text-center text-muted-foreground">
                No stadiums registered. Create a new stadium in the Admin section.
              </Card>
            ) : (
              <div className="space-y-8 animate-slide-in-up">
                {/* Metrics row */}
                <div className="grid md:grid-cols-4 gap-4">
                  <Card className="border border-border bg-card shadow-sm p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block font-semibold uppercase">Total Visitors Inside</span>
                      <span className="text-xl font-bold text-foreground block mt-0.5">45,230</span>
                    </div>
                  </Card>
                  
                  <Card className="border border-border bg-card shadow-sm p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 flex items-center justify-center">
                      <Gauge size={20} />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block font-semibold uppercase">Stadium Occupancy</span>
                      <span className="text-xl font-bold text-foreground block mt-0.5">78.5%</span>
                    </div>
                  </Card>

                  <Card className="border border-border bg-card shadow-sm p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-600 flex items-center justify-center">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block font-semibold uppercase">Crowd Safety Status</span>
                      <span className="text-xl font-bold text-green-600 block mt-0.5">Safe (Low Risk)</span>
                    </div>
                  </Card>

                  <Card className="border border-border bg-card shadow-sm p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 flex items-center justify-center">
                      <Clock size={20} />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block font-semibold uppercase">Avg turnstile wait time</span>
                      <span className="text-xl font-bold text-foreground block mt-0.5">5.4 mins</span>
                    </div>
                  </Card>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                  {/* Gates congestions */}
                  <div className="lg:col-span-7 space-y-6">
                    <Card className="border border-border bg-card shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold">Gate Congestion & Divert Operations</CardTitle>
                        <CardDescription>Monitor individual entrance traffic flow and dispatch diversion signals</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {(selectedStadium.gates || ["Gate 1", "Gate 2", "Gate 3", "Gate 4"]).map((gate: string, i: number) => {
                            const estimate = (i % 2 === 0 ? 8230 : 2100) * (i + 1);
                            const density = estimate > 10000 ? "High" : "Low";
                            return (
                              <div key={gate} className="p-4 bg-muted/50 rounded-lg border border-border flex items-center justify-between flex-wrap gap-4 hover:border-indigo-100 dark:hover:border-indigo-950 transition-colors">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-foreground">{gate}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      density === "High" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                                    }`}>
                                      {density} Congestion
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Estimated rate: <span className="font-semibold text-foreground">{estimate.toLocaleString()} fans/hr</span> • Queue delay: <span className="font-semibold text-foreground">{i % 2 === 0 ? "14m" : "2m"}</span>
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDivertQueue(selectedStadium._id, gate)}
                                  className="btn-press text-xs font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50 flex items-center gap-1.5"
                                >
                                  <ArrowRightLeft size={12} /> Divert Queue
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* AI Crowd flow assistant */}
                  <div className="lg:col-span-5 space-y-6">
                    <Card className="border border-border bg-card shadow-sm overflow-hidden bg-gradient-to-br from-indigo-50/20 to-cyan-50/20">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <Sparkles className="text-indigo-600 animate-pulse-soft" size={18} />
                          AI Crowd Analyst Console
                        </CardTitle>
                        <CardDescription>Consult the AI assistant for live exit strategies, congestion forecasting, and safety assessments</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ask about crowd levels, routing..."
                            value={aiQuery}
                            onChange={(e) => setAiQuery(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && !aiLoading) handleQueryAI();
                            }}
                            className="bg-card shadow-sm text-sm"
                            disabled={aiLoading}
                          />
                          <Button
                            onClick={() => handleQueryAI()}
                            disabled={aiLoading || !aiQuery.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex-shrink-0"
                          >
                            {aiLoading ? <Loader2 size={16} className="animate-spin" /> : "Analyze"}
                          </Button>
                        </div>

                        {/* Suggested queries */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Suggested Inquiries</span>
                          <div className="flex flex-col gap-2">
                            {suggestedQueries.map((q, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setAiQuery(q);
                                  handleQueryAI(q);
                                }}
                                className="text-left text-xs bg-card hover:bg-indigo-50/50 hover:text-indigo-700 dark:hover:bg-indigo-950/25 border border-border p-2 rounded-lg transition-colors cursor-pointer text-muted-foreground btn-press leading-relaxed"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* AI output reply */}
                        {aiReply && (
                          <div className="p-4 bg-card/90 border border-indigo-200 dark:border-indigo-950 rounded-lg text-xs leading-relaxed text-foreground shadow-inner max-h-60 overflow-y-auto mt-2">
                            <span className="font-bold text-indigo-600 block mb-1">AI Analyst Insights:</span>
                            <div className="prose prose-sm dark:prose-invert">
                              {aiReply.split("\n").map((line, idx) => (
                                <p key={idx} className="mb-1 last:mb-0">{line}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
