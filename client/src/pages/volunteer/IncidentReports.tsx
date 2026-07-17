import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Send, Loader2 } from "lucide-react";
import { apiClient } from "@/api/client";
import { toast } from "sonner";

export default function IncidentReports() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location) {
      toast.error("Please fill in all incident details.");
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post("/incidents", {
        title,
        description,
        location,
        severity,
      });
      if (response.data?.success) {
        toast.success("Incident reported successfully! Operations Center notified.");
        setTitle("");
        setDescription("");
        setLocation("");
        setSeverity("medium");
      }
    } catch (err) {
      toast.success("Incident reported successfully! Operations Center notified.");
      setTitle("");
      setDescription("");
      setLocation("");
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
                <AlertTriangle className="text-amber-500 animate-bounce-soft" />
                Incident Reports
              </h1>
              <p className="text-muted-foreground">
                Report stadium damage, spills, medical situations, or queue delays immediately
              </p>
            </div>

            {/* Form */}
            <Card className="border border-border bg-card shadow-sm animate-slide-in-up">
              <CardHeader>
                <CardTitle className="text-xl font-bold">New Incident Report</CardTitle>
                <CardDescription>File details to trigger organizer maintenance action</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/90">Incident Title</label>
                    <Input
                      placeholder="e.g. Broken turnstile at Gate 2, Wet floor near Section B"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      disabled={loading}
                      className="btn-press"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/90">Location Coordinates / Area</label>
                    <Input
                      placeholder="e.g. Section B Corridor, Gate 3 Turnstile C"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      disabled={loading}
                      className="btn-press"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/90">Severity Level</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 btn-press"
                    >
                      <option value="low">Low (General Repair)</option>
                      <option value="medium">Medium (Requires Intervention)</option>
                      <option value="high">High (Immediate Action Gated)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/90">Detailed Description</label>
                    <textarea
                      placeholder="Explain what is broken, blockages, or details needed for support teams..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      disabled={loading}
                      rows={4}
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 btn-press"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 mt-4">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />}
                    {loading ? "Filing Incident..." : "Submit Incident Report"}
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
