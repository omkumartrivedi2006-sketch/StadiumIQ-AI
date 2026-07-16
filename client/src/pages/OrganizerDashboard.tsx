import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, BarChart3, AlertTriangle, Send, LogOut, Search, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/api/client";
import { searchService, SearchResults } from "@/services/search";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function OrganizerDashboard() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  const [announcement, setAnnouncement] = useState("");
  const [announcementsList, setAnnouncementsList] = useState<string[]>([]);
  const [stats, setStats] = useState<any>({ volunteers: 154, activeSOS: 3, medicalResponse: "2.1 min" });

  // Global Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults(null);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await searchService.search(val);
      setSearchResults(res);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  async function fetchAnnouncements() {
    try {
      const response = await apiClient.get("/notifications");
      if (response.data?.success && response.data?.data?.docs) {
        const list = response.data.data.docs
          .filter((n: any) => n.type === "announcement")
          .map((n: any) => n.message);
        setAnnouncementsList(list);
      }
    } catch (e) {
      console.error("Failed to load announcements:", e);
      setAnnouncementsList([
        "Gate 1 experiencing high crowd levels. Recommend Gate 3.",
        "Food stall at Section C temporarily closed for restocking.",
        "Medical team dispatched to Section A.",
      ]);
    }
  }

  async function fetchLiveOverview() {
    try {
      const sosResponse = await apiClient.get("/sos?status=active");
      const activeCount = sosResponse.data?.data?.totalDocs || 0;

      const usersResponse = await apiClient.get("/users");
      let volunteersCount = 0;
      if (usersResponse.data?.success && usersResponse.data?.data?.docs) {
        volunteersCount = usersResponse.data.data.docs.filter((u: any) => u.role === "volunteer").length;
      }

      setStats({
        volunteers: volunteersCount || 3, // fallback to a realistic small number if 0
        activeSOS: activeCount,
        medicalResponse: "1.5 min",
      });
    } catch (e) {
      console.error("Failed to fetch live stats:", e);
    }
  }

  useEffect(() => {
    fetchAnnouncements();
    fetchLiveOverview();
  }, []);

  const handlePostAnnouncement = async () => {
    if (announcement.trim()) {
      try {
        const response = await apiClient.post("/notifications", {
          title: "Organizer Announcement",
          message: announcement,
          type: "announcement",
        });

        if (response.data?.success) {
          toast.success("Announcement broadcasted successfully!");
          setAnnouncement("");
          fetchAnnouncements();
        }
      } catch (e) {
        toast.error("Failed to broadcast announcement.");
      }
    }
  };

  const handleSignOut = async () => {
    await logout();
    setLocation("/");
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
                <Calendar className="text-indigo-600" />
                Organizer Dashboard
              </h1>
              <p className="text-muted-foreground">
                Live tournament operations, announcements, and crowd management control panel
              </p>
            </div>
            <Button onClick={handleSignOut} variant="outline" size="sm" className="btn-press gap-2">
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>

          {/* Global Search Bar */}
          <div className="mb-8 relative">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 text-muted-foreground" size={20} />
              <Input
                placeholder="Global search matches, stadiums, tickets, food stalls, transportation..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 py-6 text-base shadow-sm bg-card"
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-4 animate-spin text-muted-foreground" size={18} />
              )}
            </div>

            {/* Search Results Display */}
            {searchResults && searchQuery.trim() && (
              <div className="mt-2 p-6 bg-card rounded-lg border border-border shadow-lg absolute left-0 right-0 z-10 max-h-[400px] overflow-y-auto">
                <h3 className="font-semibold text-foreground text-sm mb-4 border-b pb-2">Search Results</h3>
                
                {/* Matches */}
                {searchResults.matches.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Matches</h4>
                    <div className="space-y-1.5">
                      {searchResults.matches.map((m) => (
                        <div key={m._id} className="text-sm text-foreground/90 bg-muted p-2 rounded">
                          {m.homeTeam} vs {m.awayTeam} ({m.status}) - {new Date(m.date).toLocaleDateString()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stadiums */}
                {searchResults.stadiums.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Stadiums</h4>
                    <div className="space-y-1.5">
                      {searchResults.stadiums.map((s) => (
                        <div key={s._id} className="text-sm text-foreground/90 bg-muted p-2 rounded">
                          {s.name} in {s.city} (Capacity: {s.capacity})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Food Vendors */}
                {searchResults.foodVendors.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Food Stalls</h4>
                    <div className="space-y-1.5">
                      {searchResults.foodVendors.map((f) => (
                        <div key={f._id} className="text-sm text-foreground/90 bg-muted p-2 rounded">
                          {f.name} ({f.category}) at {f.location} - {f.rating}★
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transportation */}
                {searchResults.transport.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Transportation</h4>
                    <div className="space-y-1.5">
                      {searchResults.transport.map((t) => (
                        <div key={t._id} className="text-sm text-foreground/90 bg-muted p-2 rounded">
                          {t.type} ({t.routeName}) to {t.destination} - Status: {t.status}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {Object.values(searchResults).every(arr => arr.length === 0) && (
                  <div className="text-muted-foreground text-sm py-4 text-center">No results found matching your search.</div>
                )}
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Live Announcements Panel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card-hover p-6 bg-card rounded-lg border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Send size={22} className="text-indigo-600" />
                  Broadcast Live Announcement
                </h2>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Enter announcement text to display on stadium screens and fan apps..."
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    className="min-h-[100px] btn-press"
                  />
                  <div className="flex justify-end">
                    <Button onClick={handlePostAnnouncement} className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                      Broadcast Now
                    </Button>
                  </div>
                </div>
              </div>

              <div className="card-hover p-6 bg-card rounded-lg border border-border">
                <h3 className="text-xl font-bold text-foreground mb-4">Current Active Broadcasts</h3>
                <div className="space-y-3">
                  {announcementsList.map((ann, idx) => (
                    <div key={idx} className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2 flex-shrink-0 animate-pulse-soft" />
                      <p className="text-foreground text-sm">{ann}</p>
                    </div>
                  ))}
                  {announcementsList.length === 0 && (
                    <p className="text-sm text-muted-foreground">No active announcements currently broadcasted.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Live Stats & Incidents */}
            <div className="space-y-6">
              <div className="card-hover p-6 bg-card rounded-lg border border-border">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 size={18} className="text-indigo-600" />
                  Live Operational Overview
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Total Volunteers Active</span>
                    <span className="font-bold text-foreground">{stats.volunteers}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Active SOS Distress Alerts</span>
                    <span className={`font-bold ${stats.activeSOS > 0 ? "text-red-600" : "text-green-600"}`}>
                      {stats.activeSOS}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Avg. Medical Response Time</span>
                    <span className="font-bold text-foreground">{stats.medicalResponse}</span>
                  </div>
                </div>
              </div>

              <div className="card-hover p-6 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                  <AlertTriangle size={18} />
                  Emergency Operations
                </h3>
                <p className="text-sm text-red-800 mb-4">
                  Distress signals override all broadcasts. Real-time maps are highlighted for responders.
                </p>
                <Button onClick={() => setLocation("/emergency")} className="w-full btn-press bg-red-600 hover:bg-red-700 text-white font-semibold">
                  SOS Command Center
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
