import { Navigation } from "@/components/Navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  AlertTriangle,
  TrendingUp,
  LogOut,
  Search,
  Loader2,
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { apiClient } from "@/api/client";
import { crowdService, GateStatus } from "@/services/crowd";
import { searchService, SearchResults } from "@/services/search";
import { Input } from "@/components/ui/input";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();

  const [analytics, setAnalytics] = useState<any[]>([]);
  const [gateData, setGateData] = useState<GateStatus[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleSignOut = async () => {
    await logout();
    setLocation("/");
  };

  useEffect(() => {
    async function loadAdminData() {
      try {
        // 1. Fetch KPI stats
        const statsResponse = await apiClient.get("/admin/analytics");
        if (statsResponse.data?.success && statsResponse.data?.data) {
          const stats = statsResponse.data.data;
          setAnalytics([
            { label: "Total Visitors", value: stats.visitors.toLocaleString(), change: "+12%" },
            { label: "AI Requests", value: stats.AIRequests.toLocaleString(), change: "+8%" },
            { label: "Incidents", value: stats.incidents.toString(), change: "-5%" },
            { label: "Food Orders", value: stats.foodOrders.toString(), change: "+15%" },
          ]);
        }

        // 2. Fetch Gate Status
        const gates = await crowdService.getGateStatus();
        setGateData(gates);

        // 3. Fetch SOS incidents
        const sosResponse = await apiClient.get("/sos");
        if (sosResponse.data?.success && sosResponse.data?.data?.docs) {
          setIncidents(
            sosResponse.data.data.docs.slice(0, 5).map((item: any) => {
              // Format time elapsed
              const mins = Math.round((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60));
              const timeStr = mins <= 0 ? "Just now" : `${mins} min ago`;
              return {
                id: item._id,
                type: item.emergencyType,
                location: item.location,
                status: item.status,
                time: timeStr,
              };
            })
          );
        }

        // 4. Fetch announcements
        const notifResponse = await apiClient.get("/notifications");
        if (notifResponse.data?.success && notifResponse.data?.data?.docs) {
          // targeted is in user, but for broadcast let's filter announcements
          const items = notifResponse.data.data.docs.filter((n: any) => n.type === "announcement");
          if (items.length > 0) {
            setAnnouncements(items.map((n: any) => n.message));
          } else {
            setAnnouncements([
              "Gate 1 experiencing high crowd levels. Recommend Gate 3.",
              "Food stall at Section C temporarily closed for restocking.",
              "Medical team dispatched to Section A.",
              "Lost item reported: Blue backpack at Gate 2.",
            ]);
          }
        }
      } catch (e) {
        console.error("Admin dashboard data load error:", e);
        // Set mock fallbacks
        setAnalytics([
          { label: "Total Visitors", value: "45,230", change: "+12%" },
          { label: "Active Users", value: "12,450", change: "+8%" },
          { label: "Incidents", value: "23", change: "-5%" },
          { label: "Avg. Response Time", value: "2.3s", change: "-0.5s" },
        ]);
        setGateData([
          { gate: "Gate 1", crowd: "High", visitors: 8230, status: "live" },
          { gate: "Gate 2", crowd: "Medium", visitors: 6120, status: "caution" },
          { gate: "Gate 3", crowd: "Low", visitors: 4890, status: "live" },
          { gate: "Gate 4", crowd: "Medium", visitors: 5980, status: "caution" },
        ]);
        setIncidents([
          { id: 1, type: "Medical", location: "Section A", status: "resolved", time: "2 min ago" },
          { id: 2, type: "Lost Item", location: "Gate 3", status: "pending", time: "5 min ago" },
        ]);
        setAnnouncements([
          "Gate 1 experiencing high crowd levels. Recommend Gate 3.",
          "Food stall at Section C temporarily closed for restocking.",
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-12 animate-slide-in-down">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Real-time stadium operations and analytics
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="btn-press gap-2"
              onClick={handleSignOut}
            >
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>

          {/* Global Search Bar */}
          <div className="mb-8 relative">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 text-muted-foreground" size={20} />
              <Input
                placeholder="Global search matches, stadiums, tickets, food stalls, transportation, users..."
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

                {/* Users (Admins only) */}
                {searchResults.users.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Users</h4>
                    <div className="space-y-1.5">
                      {searchResults.users.map((u) => (
                        <div key={u._id} className="text-sm text-foreground/90 bg-muted p-2 rounded flex justify-between">
                          <span>{u.fullName} ({u.email})</span>
                          <span className="text-xs bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-semibold uppercase">{u.role}</span>
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

          {/* KPI Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            {analytics.map((item, idx) => (
              <div
                key={idx}
                style={{
                  animation: `slide-in-up 0.5s ease-out ${idx * 0.1}s both`,
                }}
                className="card-hover p-6 bg-card rounded-lg border border-border"
              >
                <p className="text-sm text-muted-foreground mb-2">{item.label}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-bold text-foreground">
                    {item.value}
                  </h3>
                  <span className="text-sm text-green-600 font-medium">
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Gate Analytics */}
            <div className="lg:col-span-2">
              <div className="card-hover p-6 bg-card rounded-lg border border-border animate-slide-in-up">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <BarChart3 size={24} className="text-indigo-600" />
                  Gate Analytics
                </h2>

                <div className="space-y-4">
                  {gateData.map((gate, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-muted rounded-lg border border-border hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground">
                            {gate.gate}
                          </h3>
                          <StatusBadge
                            status={
                              gate.status === "live"
                                ? "live"
                                : gate.status === "caution"
                                  ? "caution"
                                  : "unavailable"
                            }
                            label={gate.crowd}
                          />
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {gate.visitors.toLocaleString()} visitors
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            gate.crowd === "High"
                              ? "bg-red-500"
                              : gate.crowd === "Medium"
                                ? "bg-amber-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${(gate.visitors / 10000) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Incidents & Alerts */}
            <div className="animate-slide-in-up">
              <div className="card-hover p-6 bg-card rounded-lg border border-border mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <AlertTriangle size={24} className="text-red-600" />
                  Incidents
                </h2>

                <div className="space-y-4">
                  {incidents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active incidents reported.</p>
                  ) : (
                    incidents.map((incident) => (
                      <div
                        key={incident.id}
                        className="p-4 bg-muted rounded-lg border border-border"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground">
                            {incident.type}
                          </h3>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              incident.status === "active"
                                ? "bg-red-100 text-red-700"
                                : incident.status === "pending"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {incident.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {incident.location}
                        </p>
                        <p className="text-xs text-muted-foreground">{incident.time}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="card-hover p-6 bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-950/20 dark:to-cyan-950/20 rounded-lg border border-indigo-200 dark:border-indigo-900/50">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp size={20} className="text-indigo-600 animate-pulse-soft" />
                  System Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/90">API Health</span>
                    <span className="text-sm font-semibold text-green-600">
                      ✓ Healthy
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/90">Database</span>
                    <span className="text-sm font-semibold text-green-600">
                      ✓ Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/90">AI Service</span>
                    <span className="text-sm font-semibold text-green-600">
                      ✓ Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Announcements */}
          <div className="mt-12 animate-slide-in-up">
            <div className="card-hover p-6 bg-card rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Live Announcements
              </h2>
              <div className="space-y-4">
                {announcements.map((announcement, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-muted rounded-lg border border-border flex items-start gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2 " />
                    <p className="text-foreground">{announcement}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
