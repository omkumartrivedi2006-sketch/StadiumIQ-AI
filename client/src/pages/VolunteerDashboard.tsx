import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Heart, MessageSquare, AlertCircle, Languages, LogOut, ShieldAlert, Users, Loader2, Compass } from "lucide-react";
import { MapView } from "@/components/Map";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { apiClient } from "@/api/client";
import { socketService } from "@/services/socket";
import { toast } from "sonner";

export default function VolunteerDashboard() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Crowd Report States
  const [stadiums, setStadiums] = useState<any[]>([]);
  const [selectedStadium, setSelectedStadium] = useState("");
  const [selectedGate, setSelectedGate] = useState("");
  const [crowdLevel, setCrowdLevel] = useState("Low");
  const [visitors, setVisitors] = useState(1000);
  const [reporting, setReporting] = useState(false);

  const handleSignOut = async () => {
    await logout();
    setLocation("/");
  };

  async function fetchTasks() {
    try {
      const response = await apiClient.get("/sos");
      if (response.data?.success && response.data?.data?.docs) {
        setTasks(
          response.data.data.docs.map((item: any) => {
            const mins = Math.round((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60));
            const timeStr = mins <= 0 ? "Just now" : `${mins}m ago`;
            return {
              id: item._id,
              title: `${item.emergencyType} at ${item.location}`,
              location: item.location,
              time: timeStr,
              status: item.status === "active" ? "urgent" : item.status === "pending" ? "pending" : "completed",
            };
          })
        );
      }
    } catch (e) {
      console.error("Failed to load volunteer tasks:", e);
      setTasks([
        { id: 1, title: "Assist wheelchair fan at Gate 3", location: "Gate 3", time: "Now", status: "urgent" },
        { id: 2, title: "Provide translation support (Spanish)", location: "Food Court", time: "10m ago", status: "pending" },
        { id: 3, title: "Locate lost blue backpack near Section B", location: "Section B", time: "30m ago", status: "completed" },
      ]);
    } finally {
      setLoading(false);
    }
  }

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

  useEffect(() => {
    fetchTasks();
    fetchStadiums();

    const handleNewSOS = (newSos: any) => {
      fetchTasks();
      toast.error(`🚨 URGENT: New Emergency SOS Alert (${newSos.emergencyType}) at ${newSos.location}!`);
    };

    const handleUpdateSOS = () => {
      fetchTasks();
    };

    socketService.on("new-sos", handleNewSOS);
    socketService.on("update-sos", handleUpdateSOS);

    return () => {
      socketService.off("new-sos", handleNewSOS);
      socketService.off("update-sos", handleUpdateSOS);
    };
  }, []);

  const handleClaimTask = async (taskId: string) => {
    try {
      const response = await apiClient.put(`/sos/${taskId}`, { status: "pending" });
      if (response.data?.success) {
        toast.success("Task claimed successfully!");
        fetchTasks();
      }
    } catch (e) {
      toast.error("Failed to claim task.");
    }
  };

  const handleResolveTask = async (taskId: string) => {
    try {
      const response = await apiClient.put(`/sos/${taskId}`, { status: "resolved" });
      if (response.data?.success) {
        toast.success("Task marked as completed!");
        fetchTasks();
      }
    } catch (e) {
      toast.error("Failed to complete task.");
    }
  };

  const handleCrowdReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStadium || !selectedGate || !crowdLevel) {
      toast.error("Please fill in all stadium, gate and crowd details.");
      return;
    }
    setReporting(true);
    try {
      const response = await apiClient.post("/stadiums/crowd-report", {
        stadiumId: selectedStadium,
        gate: selectedGate,
        crowdLevel,
        visitors: Number(visitors),
      });
      if (response.data?.success) {
        toast.success("Crowd report submitted successfully!");
        setSelectedGate("");
        setCrowdLevel("Low");
        setVisitors(1000);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit crowd report.");
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-12 animate-slide-in-down">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Heart className="text-indigo-600 animate-pulse-soft" />
                Volunteer Hub
              </h1>
              <p className="text-muted-foreground">
                You are logged in as a Volunteer. Help make FIFA 2026 amazing!
              </p>
            </div>
            <Button onClick={handleSignOut} variant="outline" size="sm" className="btn-press gap-2">
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Active Assignments */}
            <div className="md:col-span-2 space-y-6">
              <div className="card-hover p-6 bg-card rounded-lg border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <AlertCircle size={22} className="text-indigo-600" />
                  Your Assignments
                </h2>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading assignments...</p>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div key={task.id} className="p-4 bg-muted rounded-lg border border-border flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{task.title}</h3>
                          <p className="text-xs text-muted-foreground">{task.location} • {task.time}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge
                            status={task.status === "urgent" ? "live" : task.status === "pending" ? "caution" : "unavailable"}
                            label={task.status.toUpperCase()}
                          />
                          {task.status === "urgent" && (
                            <Button size="sm" onClick={() => handleClaimTask(task.id)} className="btn-press bg-indigo-600 text-white">
                              Claim
                            </Button>
                          )}
                          {task.status === "pending" && (
                            <Button size="sm" onClick={() => handleResolveTask(task.id)} className="btn-press bg-green-600 text-white hover:bg-green-700">
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {tasks.length === 0 && (
                      <p className="text-sm text-muted-foreground">No active assignments at this time.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Live Stadium Wayfinding Map */}
              <div className="card-hover p-6 bg-card rounded-lg border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Compass size={22} className="text-indigo-600" />
                  Live Incident Map & Indoor Wayfinding
                </h2>
                <MapView />
              </div>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="space-y-6">
              {/* Crowd Reporting Card */}
              <div className="card-hover p-6 bg-card rounded-lg border border-border">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users size={18} className="text-indigo-600" />
                  Report Crowd Density
                </h3>
                <form onSubmit={handleCrowdReport} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/90">Select Stadium</label>
                    <select
                      value={selectedStadium}
                      onChange={(e) => setSelectedStadium(e.target.value)}
                      required
                      disabled={reporting}
                      className="w-full px-2 py-1.5 bg-card border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 btn-press"
                    >
                      {stadiums.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/90">Select Gate</label>
                    <select
                      value={selectedGate}
                      onChange={(e) => setSelectedGate(e.target.value)}
                      required
                      disabled={reporting}
                      className="w-full px-2 py-1.5 bg-card border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 btn-press"
                    >
                      <option value="">-- Choose Gate --</option>
                      <option value="Gate 1">Gate 1</option>
                      <option value="Gate 2">Gate 2</option>
                      <option value="Gate 3">Gate 3</option>
                      <option value="Gate 4">Gate 4</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/90">Crowd Level</label>
                    <select
                      value={crowdLevel}
                      onChange={(e) => setCrowdLevel(e.target.value)}
                      required
                      disabled={reporting}
                      className="w-full px-2 py-1.5 bg-card border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 btn-press"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/90">Estimated Visitors</label>
                    <Input
                      type="number"
                      min={0}
                      value={visitors}
                      onChange={(e) => setVisitors(Number(e.target.value))}
                      required
                      disabled={reporting}
                      className="py-1 px-2 text-xs btn-press"
                    />
                  </div>
                  <Button type="submit" disabled={reporting || !selectedGate} className="w-full mt-2 btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1">
                    {reporting ? <Loader2 size={12} className="animate-spin" /> : null}
                    Submit Report
                  </Button>
                </form>
              </div>

              <div className="card-hover p-6 bg-card rounded-lg border border-border">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Languages size={18} className="text-indigo-600" />
                  Translation Assistant
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Quickly translate terms or questions for international fans.
                </p>
                <Button onClick={() => setLocation("/chat")} className="w-full btn-press bg-indigo-600 hover:bg-indigo-700 text-white">
                  Open Translation Chat
                </Button>
              </div>

              <div className="card-hover p-6 bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-950/20 dark:to-cyan-950/20 rounded-lg border border-indigo-200 dark:border-indigo-900/50">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MessageSquare size={18} className="text-indigo-600 animate-pulse-soft" />
                  Help Channels
                </h3>
                <p className="text-sm text-foreground/90 mb-4">
                  Connect directly with security, medical, or administrative staff.
                </p>
                <Button onClick={() => setLocation("/emergency")} variant="outline" className="w-full btn-press">
                  Emergency SOS Info
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
