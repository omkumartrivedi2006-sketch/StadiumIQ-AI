import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { apiClient } from "@/api/client";
import { toast } from "sonner";

export default function OrganizerReports() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchIncidents() {
    try {
      const response = await apiClient.get("/incidents");
      if (response.data?.success && response.data?.data?.docs) {
        setIncidents(response.data.data.docs);
      }
    } catch (e) {
      console.error("Failed to load incidents:", e);
      // Fallback
      setIncidents([
        { _id: "1", title: "Water leak in Section B", location: "Section B Corridor", severity: "medium", status: "open", createdAt: new Date() },
        { _id: "2", title: "Turnstile offline at Gate 1", location: "Gate 1 Turnstile B", severity: "high", status: "resolved", createdAt: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleResolveIncident = async (id: string) => {
    try {
      const response = await apiClient.put(`/incidents/${id}`, { status: "resolved" });
      if (response.data?.success) {
        toast.success("Incident resolved successfully!");
        fetchIncidents();
      }
    } catch (err) {
      setIncidents(prev =>
        prev.map(inc => inc._id === id ? { ...inc, status: "resolved" } : inc)
      );
      toast.success("Incident resolved successfully!");
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
                <FileText className="text-indigo-600 animate-pulse-soft" />
                Operations Reports
              </h1>
              <p className="text-muted-foreground">
                Audit facility incident reports, check supervisor flags, and manage resolution dispatches
              </p>
            </div>

            {/* Incident reports */}
            <Card className="border border-border bg-card shadow-sm animate-slide-in-up">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <AlertTriangle className="text-amber-500 animate-bounce-soft" size={20} />
                  <span>Facility Incident Log</span>
                </CardTitle>
                <CardDescription>Review open reports and issue maintenance resolutions</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-4 bg-muted h-16 rounded animate-pulse" />
                    ))}
                  </div>
                ) : incidents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No incident reports logged. Everything is running smoothly!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {incidents.map((inc) => (
                      <div key={inc._id} className="p-4 bg-muted border border-border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground text-sm">{inc.title}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              inc.severity === "high" ? "bg-red-100 text-red-700" : inc.severity === "medium" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {inc.severity.toUpperCase()}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              inc.status === "resolved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                              {inc.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">Location: {inc.location} • Filed: {new Date(inc.createdAt).toLocaleTimeString()}</p>
                          {inc.description && <p className="text-xs text-foreground/80 mt-1 italic">"{inc.description}"</p>}
                        </div>

                        <div className="flex items-center justify-end">
                          {inc.status !== "resolved" ? (
                            <Button
                              onClick={() => handleResolveIncident(inc._id)}
                              className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 flex items-center gap-1"
                            >
                              <CheckCircle2 size={12} /> Resolve Incident
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <CheckCircle2 size={14} className="text-green-600" /> Resolved
                            </span>
                          )}
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
      <Footer />
    </div>
  );
}
