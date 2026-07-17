import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, Plus, MapPin, ListCollapse, Loader2 } from "lucide-react";
import { apiClient } from "@/api/client";
import { toast } from "sonner";

export default function StadiumManagement() {
  const [stadiums, setStadiums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [capacity, setCapacity] = useState("");

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

  const handleCreateStadium = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !city || !capacity) {
      toast.error("Please fill in all stadium details.");
      return;
    }
    setSubmitLoading(true);
    try {
      const response = await apiClient.post("/stadiums", {
        name,
        city,
        capacity: Number(capacity),
        gates: ["Gate 1", "Gate 2", "Gate 3", "Gate 4"],
      });
      if (response.data?.success) {
        toast.success("New stadium registered successfully!");
        setName("");
        setCity("");
        setCapacity("");
        loadStadiums();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create stadium.");
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
                <Building className="text-indigo-600 animate-pulse-soft" />
                Stadium Management
              </h1>
              <p className="text-muted-foreground">
                Register new FIFA stadium arenas and configure maximum gate seating capacities
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 animate-slide-in-up">
              {/* Add stadium form */}
              <div className="md:col-span-1">
                <Card className="border border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-1.5">
                      <Plus size={18} className="text-indigo-600" />
                      <span>Register Arena</span>
                    </CardTitle>
                    <CardDescription>Add new host stadium details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateStadium} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground/90">Stadium Name</label>
                        <Input
                          placeholder="e.g. MetLife Stadium"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          disabled={submitLoading}
                          className="btn-press"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground/90">City / Region</label>
                        <Input
                          placeholder="e.g. New Jersey"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                          disabled={submitLoading}
                          className="btn-press"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground/90">Seating Capacity</label>
                        <Input
                          type="number"
                          placeholder="e.g. 82500"
                          value={capacity}
                          onChange={(e) => setCapacity(e.target.value)}
                          required
                          disabled={submitLoading}
                          className="btn-press"
                        />
                      </div>
                      <Button type="submit" disabled={submitLoading || !name || !city || !capacity} className="w-full btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2">
                        {submitLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                        Register Stadium
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Stadium list */}
              <div className="md:col-span-2">
                <Card className="border border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-1.5">
                      <ListCollapse size={18} className="text-indigo-600" />
                      <span>Registered Stadiums</span>
                    </CardTitle>
                    <CardDescription>Overview of active arenas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <div key={i} className="p-4 bg-muted h-16 rounded animate-pulse" />
                        ))}
                      </div>
                    ) : stadiums.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No stadiums registered. Create one using the form on the left.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {stadiums.map((s) => (
                          <div key={s._id} className="p-4 bg-muted border border-border rounded-lg flex justify-between items-center">
                            <div>
                              <h4 className="font-bold text-foreground text-sm flex items-center gap-1">
                                <Building size={14} className="text-indigo-600" />
                                {s.name}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                <MapPin size={12} />
                                {s.city} • Capacity: {s.capacity.toLocaleString()} seats
                              </p>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-semibold">
                              {(s.gates || []).length} gates
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
