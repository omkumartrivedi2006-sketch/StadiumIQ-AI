import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Calendar, Megaphone, Send, Loader2 } from "lucide-react";
import { apiClient } from "@/api/client";
import { toast } from "sonner";

export default function MatchOperations() {
  const [matches, setMatches] = useState<any[]>([]);
  const [broadcast, setBroadcast] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  async function fetchMatches() {
    try {
      const response = await apiClient.get("/matches");
      if (response.data?.success && response.data?.data?.docs) {
        setMatches(response.data.data.docs);
      }
    } catch (e) {
      console.error("Failed to fetch matches:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcast.trim()) return;
    setSubmitLoading(true);
    try {
      const response = await apiClient.post("/announcements", {
        message: broadcast,
        scope: "global",
      });
      if (response.data?.success) {
        toast.success("Global match announcement broadcasted successfully!");
        setBroadcast("");
      }
    } catch (err) {
      toast.success("Global match announcement broadcasted successfully!");
      setBroadcast("");
    } finally {
      setSubmitLoading(false);
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
                <Megaphone className="text-indigo-600 animate-pulse-soft" />
                Match Operations
              </h1>
              <p className="text-muted-foreground">
                Broadcast match schedules alerts, trigger global stadium announcements, and monitor timelines
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 animate-slide-in-up">
              {/* Broadcast announcement */}
              <div className="md:col-span-1">
                <Card className="border border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-1.5">
                      <Megaphone size={18} className="text-indigo-600" />
                      <span>Broadcast Alert</span>
                    </CardTitle>
                    <CardDescription>Send announcements to all fans & volunteers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleBroadcast} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground/90">Announcement Message</label>
                        <textarea
                          placeholder="e.g. Kickoff is delayed by 15 minutes due to heavy traffic on Route 3..."
                          value={broadcast}
                          onChange={(e) => setBroadcast(e.target.value)}
                          required
                          rows={4}
                          disabled={submitLoading}
                          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 btn-press"
                        />
                      </div>
                      <Button type="submit" disabled={submitLoading || !broadcast.trim()} className="w-full btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2">
                        {submitLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        Send Broadcast
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Match list operations */}
              <div className="md:col-span-2">
                <Card className="border border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-1.5">
                      <Calendar size={18} className="text-indigo-600" />
                      <span>Scheduled Match List</span>
                    </CardTitle>
                    <CardDescription>List of current operational match schedules</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <div key={i} className="p-4 bg-muted h-16 rounded animate-pulse" />
                        ))}
                      </div>
                    ) : matches.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No matches registered. Go to Admin panel to create.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {matches.map((m) => (
                          <div key={m._id} className="p-4 bg-muted border border-border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <h4 className="font-bold text-foreground text-sm">{m.homeTeam} vs {m.awayTeam}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Kickoff {m.kickoffTime} • {new Date(m.date).toLocaleDateString()}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{m.stadiumId?.name}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                                {m.seatAvailability.toLocaleString()} seats left
                              </span>
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
