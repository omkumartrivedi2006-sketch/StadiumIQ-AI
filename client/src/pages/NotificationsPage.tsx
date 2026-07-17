import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, RefreshCw, MailOpen, Trash2 } from "lucide-react";
import { apiClient } from "@/api/client";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchAnnouncements() {
    setLoading(true);
    try {
      const response = await apiClient.get("/announcements");
      if (response.data?.success && response.data?.data?.docs) {
        setAlerts(
          response.data.data.docs.map((item: any) => ({
            id: item._id,
            title: "Global Stadium Alert",
            message: item.message,
            time: new Date(item.createdAt).toLocaleTimeString(),
            read: false,
          }))
        );
      }
    } catch (e) {
      console.error("Failed to load announcements:", e);
      // Fallback
      setAlerts([
        { id: "1", title: "Gates congestion warning", message: "North Entrance Gate 1 is experiencing high traffic. We advise using Gate 3 (South Side) instead.", time: "10m ago", read: false },
        { id: "2", title: "Seat reservation confirmed", message: "Your ticket booking for USA vs England has been verified successfully. Gate details: Section B, Seat 4.", time: "30m ago", read: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleMarkAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    toast.success("All notifications marked as read!");
  };

  const handleClearAll = () => {
    setAlerts([]);
    toast.success("Notifications cleared!");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navigation />

        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-3xl">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-in-down">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <Bell className="text-indigo-600 animate-pulse-soft" />
                  Notifications
                </h1>
                <p className="text-muted-foreground">
                  View stadium alerts, broadcast updates, and ticket confirmations
                </p>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="btn-press text-xs flex items-center gap-1">
                  <MailOpen size={14} /> Mark Read
                </Button>
                <Button variant="outline" size="sm" onClick={handleClearAll} className="btn-press text-xs text-red-600 border-red-100 hover:bg-red-50 flex items-center gap-1">
                  <Trash2 size={14} /> Clear All
                </Button>
              </div>
            </div>

            {/* List */}
            <Card className="border border-border bg-card shadow-sm animate-slide-in-up">
              <CardContent className="pt-6">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-4 bg-muted h-16 rounded animate-pulse" />
                    ))}
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <Bell size={20} />
                    </div>
                    <span>No notifications found. You are up to date!</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((a) => (
                      <div key={a.id} className={`p-4 rounded-lg border transition-colors ${
                        a.read ? "bg-muted border-border" : "bg-indigo-50/10 dark:bg-indigo-950/10 border-indigo-200 dark:border-indigo-800"
                      }`}>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm ${a.read ? "text-foreground/80 font-medium" : "text-foreground font-bold"}`}>{a.title}</h4>
                          <span className="text-[10px] text-muted-foreground font-mono">{a.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-1">{a.message}</p>
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
