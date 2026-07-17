import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Plus, Trophy, ListCollapse, Loader2 } from "lucide-react";
import { apiClient } from "@/api/client";
import { toast } from "sonner";

export default function MatchManagement() {
  const [matches, setMatches] = useState<any[]>([]);
  const [stadiums, setStadiums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [date, setDate] = useState("");
  const [kickoffTime, setKickoffTime] = useState("");
  const [stadiumId, setStadiumId] = useState("");
  const [seats, setSeats] = useState("50000");

  async function loadData() {
    try {
      const matchRes = await apiClient.get("/matches");
      if (matchRes.data?.success && matchRes.data?.data?.docs) {
        setMatches(matchRes.data.data.docs);
      }
      const stadiumRes = await apiClient.get("/stadiums");
      if (stadiumRes.data?.success && stadiumRes.data?.data?.docs) {
        setStadiums(stadiumRes.data.data.docs);
        if (stadiumRes.data.data.docs.length > 0) {
          setStadiumId(stadiumRes.data.data.docs[0]._id);
        }
      }
    } catch (e) {
      console.error("Failed to load match configuration parameters:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam || !awayTeam || !date || !kickoffTime || !stadiumId) {
      toast.error("Please fill in all match parameters.");
      return;
    }
    setSubmitLoading(true);
    try {
      const response = await apiClient.post("/matches", {
        homeTeam,
        awayTeam,
        date,
        kickoffTime,
        stadiumId,
        seatAvailability: Number(seats),
      });
      if (response.data?.success) {
        toast.success("Match scheduled successfully!");
        setHomeTeam("");
        setAwayTeam("");
        setDate("");
        setKickoffTime("");
        loadData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to schedule match.");
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
                <Trophy className="text-indigo-600 animate-pulse-soft" />
                Match Management
              </h1>
              <p className="text-muted-foreground">
                Schedule new FIFA group/knockout matches and allocate stadium seats availability
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 animate-slide-in-up">
              {/* Add Match Form */}
              <div className="md:col-span-1">
                <Card className="border border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-1.5">
                      <Plus size={18} className="text-indigo-600" />
                      <span>Schedule Match</span>
                    </CardTitle>
                    <CardDescription>Configure match teams and timelines</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateMatch} className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-foreground/90">Home Team</label>
                          <Input
                            placeholder="e.g. USA"
                            value={homeTeam}
                            onChange={(e) => setHomeTeam(e.target.value)}
                            required
                            disabled={submitLoading}
                            className="btn-press"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-foreground/90">Away Team</label>
                          <Input
                            placeholder="e.g. England"
                            value={awayTeam}
                            onChange={(e) => setAwayTeam(e.target.value)}
                            required
                            disabled={submitLoading}
                            className="btn-press"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground/90">Play Date</label>
                        <Input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          required
                          disabled={submitLoading}
                          className="btn-press"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground/90">Kickoff Time</label>
                        <Input
                          type="time"
                          value={kickoffTime}
                          onChange={(e) => setKickoffTime(e.target.value)}
                          required
                          disabled={submitLoading}
                          className="btn-press"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground/90">Select Venue</label>
                        <select
                          value={stadiumId}
                          onChange={(e) => setStadiumId(e.target.value)}
                          required
                          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 btn-press"
                        >
                          <option value="">Choose stadium</option>
                          {stadiums.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground/90">Allocated Seats</label>
                        <Input
                          type="number"
                          value={seats}
                          onChange={(e) => setSeats(e.target.value)}
                          required
                          disabled={submitLoading}
                          className="btn-press"
                        />
                      </div>

                      <Button type="submit" disabled={submitLoading || !homeTeam || !awayTeam || !date || !kickoffTime || !stadiumId} className="w-full btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2">
                        {submitLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                        Schedule Match
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Match List */}
              <div className="md:col-span-2">
                <Card className="border border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-1.5">
                      <ListCollapse size={18} className="text-indigo-600" />
                      <span>Scheduled Match Timeline</span>
                    </CardTitle>
                    <CardDescription>Check upcoming fixtures list</CardDescription>
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
                        No matches scheduled. Populate using the configuration form.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {matches.map((m) => (
                          <div key={m._id} className="p-4 bg-muted border border-border rounded-lg flex justify-between items-center">
                            <div>
                              <h4 className="font-bold text-foreground text-sm flex items-center gap-1">
                                <Trophy size={14} className="text-indigo-600" />
                                {m.homeTeam} vs {m.awayTeam}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Kickoff {m.kickoffTime} • {new Date(m.date).toLocaleDateString()}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{m.stadiumId?.name || "MetLife Stadium"}</p>
                            </div>
                            <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                              {m.seatAvailability.toLocaleString()} seats
                            </span>
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
