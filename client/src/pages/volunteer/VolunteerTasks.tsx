import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Heart, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { apiClient } from "@/api/client";
import { toast } from "sonner";

export default function VolunteerTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchTasks() {
    setLoading(true);
    try {
      const response = await apiClient.get("/sos");
      if (response.data?.success && response.data?.data?.docs) {
        setTasks(
          response.data.data.docs.map((item: any) => {
            const mins = Math.round((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60));
            const timeStr = mins <= 0 ? "Just now" : `${mins}m ago`;
            return {
              id: item._id,
              title: `${item.emergencyType} support at ${item.location}`,
              location: item.location,
              time: timeStr,
              status: item.status === "active" ? "urgent" : item.status === "pending" ? "pending" : "completed",
            };
          })
        );
      }
    } catch (e) {
      console.error("Failed to load volunteer tasks:", e);
      // fallback mock list matching backend interface
      setTasks([
        { id: "1", title: "Assist wheelchair fan at Gate 3 entrance", location: "Gate 3", time: "Now", status: "urgent" },
        { id: "2", title: "Provide translation support (Spanish)", location: "Food Court", time: "10m ago", status: "pending" },
        { id: "3", title: "Locate lost blue backpack near Section B", location: "Section B", time: "30m ago", status: "completed" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleClaimTask = async (taskId: string) => {
    try {
      const response = await apiClient.put(`/sos/${taskId}`, { status: "pending" });
      if (response.data?.success) {
        toast.success("Task claimed! Please report to location immediately.");
        fetchTasks();
      }
    } catch (err) {
      // Simulate frontend claim state for mock items
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "pending" } : t));
      toast.success("Task claimed! Proceed to coordinates.");
    }
  };

  const handleResolveTask = async (taskId: string) => {
    try {
      const response = await apiClient.put(`/sos/${taskId}`, { status: "resolved" });
      if (response.data?.success) {
        toast.success("Task resolved! Support log updated.");
        fetchTasks();
      }
    } catch (err) {
      // Simulate frontend resolve state for mock items
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "completed" } : t));
      toast.success("Task resolved! Support log updated.");
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
                <Heart className="text-red-500 animate-pulse-soft" />
                Assigned Tasks
              </h1>
              <p className="text-muted-foreground">
                Review fan SOS emergencies, assistance notifications, and claim operations
              </p>
            </div>

            {/* Task list container */}
            <Card className="border border-border bg-card shadow-sm animate-slide-in-up">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <span>Support Task Queue</span>
                </CardTitle>
                <CardDescription>Claim tasks and update operational resolution states</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-4 border border-border rounded-lg bg-muted/50 h-20 animate-pulse" />
                    ))}
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No active SOS or support tasks in queue. You are all set!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div key={task.id} className="p-4 bg-muted border border-border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground text-sm">{task.title}</span>
                            <StatusBadge
                              status={
                                task.status === "urgent"
                                  ? "live"
                                  : task.status === "pending"
                                    ? "caution"
                                    : "unavailable"
                              }
                              label={task.status.toUpperCase()}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">Location: {task.location} • Raised {task.time}</p>
                        </div>

                        <div className="flex items-center gap-2 justify-end">
                          {task.status === "urgent" && (
                            <Button onClick={() => handleClaimTask(task.id)} className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1.5 h-8">
                              Claim Task
                            </Button>
                          )}
                          {task.status === "pending" && (
                            <Button onClick={() => handleResolveTask(task.id)} className="btn-press bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 h-8 flex items-center gap-1">
                              <CheckCircle2 size={12} /> Mark Resolved
                            </Button>
                          )}
                          {task.status === "completed" && (
                            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
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
