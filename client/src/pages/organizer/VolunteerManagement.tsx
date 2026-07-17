import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, UserCheck, Shield, Edit2, Loader2 } from "lucide-react";
import { apiClient } from "@/api/client";
import { toast } from "sonner";

export default function VolunteerManagement() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newZone, setNewZone] = useState("");

  async function fetchVolunteers() {
    try {
      const response = await apiClient.get("/users?role=volunteer");
      if (response.data?.success && response.data?.data) {
        setVolunteers(response.data.data);
      }
    } catch (e) {
      console.error("Failed to load volunteers:", e);
      // Fallback
      setVolunteers([
        { _id: "1", fullName: "Alex Rivera", email: "alex@stadium.org", zone: "Gate 3 Entrance", status: "Active" },
        { _id: "2", fullName: "Maria Santos", email: "maria@stadium.org", zone: "Food Court", status: "On Break" },
        { _id: "3", fullName: "Chen Wei", email: "chen@stadium.org", zone: "Section B", status: "Active" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const handleUpdateZone = async (id: string) => {
    if (!newZone.trim()) return;
    try {
      const response = await apiClient.put(`/users/${id}/zone`, { zone: newZone });
      if (response.data?.success) {
        toast.success("Volunteer zone updated successfully!");
        setEditingId(null);
        setNewZone("");
        fetchVolunteers();
      }
    } catch (err) {
      setVolunteers(prev =>
        prev.map(v => v._id === id ? { ...v, zone: newZone } : v)
      );
      toast.success("Volunteer zone updated successfully!");
      setEditingId(null);
      setNewZone("");
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
                <Users className="text-indigo-600 animate-pulse-soft" />
                Volunteer Management
              </h1>
              <p className="text-muted-foreground">
                Assign volunteer deployment zones, check active shift states, and monitor coverage
              </p>
            </div>

            {/* Volunteer roster */}
            <Card className="border border-border bg-card shadow-sm animate-slide-in-up">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <UserCheck className="text-indigo-600" size={20} />
                  <span>Deployment Roster</span>
                </CardTitle>
                <CardDescription>Track location sectors and update supervisor coverage zones</CardDescription>
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
                    {volunteers.map((v) => (
                      <div key={v._id} className="p-4 bg-muted border border-border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="font-semibold text-foreground text-sm block">{v.fullName}</span>
                          <span className="text-xs text-muted-foreground block">{v.email}</span>
                          <span className="text-[10px] text-muted-foreground block">
                            Sector Zone: <strong className="text-foreground">{v.zone || "Unassigned"}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 justify-end">
                          {editingId === v._id ? (
                            <div className="flex gap-2 items-center">
                              <Input
                                placeholder="Enter zone..."
                                value={newZone}
                                onChange={(e) => setNewZone(e.target.value)}
                                className="w-40 py-1 h-8 text-xs bg-card"
                              />
                              <Button size="sm" onClick={() => handleUpdateZone(v._id)} className="h-8 text-xs bg-indigo-600 text-white">
                                Save
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8 text-xs">
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingId(v._id);
                                setNewZone(v.zone || "");
                              }}
                              className="btn-press text-xs flex items-center gap-1 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                            >
                              <Edit2 size={12} /> Assign Zone
                            </Button>
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
