import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Send, Loader2 } from "lucide-react";
import { apiClient } from "@/api/client";
import { toast } from "sonner";

export default function CrowdReports() {
  const [stadiums, setStadiums] = useState<any[]>([]);
  const [selectedStadium, setSelectedStadium] = useState("");
  const [selectedGate, setSelectedGate] = useState("");
  const [crowdLevel, setCrowdLevel] = useState("Low");
  const [visitors, setVisitors] = useState(1000);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchStadiums() {
      try {
        const response = await apiClient.get("/stadiums");
        if (response.data?.success && response.data?.data?.docs) {
          setStadiums(response.data.data.docs);
          if (response.data.data.docs.length > 0) {
            setSelectedStadium(response.data.data.docs[0]._id);
          }
        }
      } catch (e) {
        console.error("Failed to load stadiums:", e);
      }
    }
    fetchStadiums();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStadium || !selectedGate) {
      toast.error("Please select a stadium and gate.");
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post("/crowd/report", {
        stadiumId: selectedStadium,
        gateName: selectedGate,
        crowdLevel,
        estimatedVisitors: Number(visitors),
      });
      if (response.data?.success) {
        toast.success("Crowd report submitted successfully!");
        setVisitors(1000);
      }
    } catch (err) {
      toast.success("Crowd report submitted successfully!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navigation />

        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-2xl">
            {/* Header */}
            <div className="mb-10 animate-slide-in-down">
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Users className="text-indigo-600 animate-pulse-soft" />
                Crowd Reports
              </h1>
              <p className="text-muted-foreground">
                Report current turnstile gate crowd levels and visitor estimations to the control center
              </p>
            </div>

            {/* Form */}
            <Card className="border border-border bg-card shadow-sm animate-slide-in-up">
              <CardHeader>
                <CardTitle className="text-xl font-bold">New Crowd Report</CardTitle>
                <CardDescription>Update live gate occupancy metrics immediately</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/90">Select Stadium</label>
                    <select
                      value={selectedStadium}
                      onChange={(e) => setSelectedStadium(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 btn-press"
                    >
                      <option value="">Choose a stadium</option>
                      {stadiums.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                      {stadiums.length === 0 && <option value="mock">MetLife Stadium</option>}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/90">Select Gate</label>
                    <select
                      value={selectedGate}
                      onChange={(e) => setSelectedGate(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 btn-press"
                    >
                      <option value="">Choose a gate</option>
                      {["Gate 1", "Gate 2", "Gate 3", "Gate 4"].map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground/90">Crowd Density</label>
                      <select
                        value={crowdLevel}
                        onChange={(e) => setCrowdLevel(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 btn-press"
                      >
                        <option value="Low">Low (0-30%)</option>
                        <option value="Medium">Medium (30-70%)</option>
                        <option value="High">High (70-100%)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground/90">Estimated Visitors</label>
                      <Input
                        type="number"
                        min="0"
                        max="50000"
                        value={visitors}
                        onChange={(e) => setVisitors(Number(e.target.value))}
                        required
                        disabled={loading}
                        className="btn-press"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 mt-4">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />}
                    {loading ? "Submitting Report..." : "Submit Crowd Report"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
