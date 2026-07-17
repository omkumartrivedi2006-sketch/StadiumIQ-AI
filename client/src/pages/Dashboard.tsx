import { Navigation } from "@/components/Navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { MapView } from "@/components/Map";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import {
  MessageSquare,
  MapPin,
  AlertCircle,
  Utensils,
  Navigation as NavigationIcon,
  LogOut,
  Ticket as TicketIcon,
  Loader2,
  Calendar,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { crowdService, GateStatus } from "@/services/crowd";
import { searchService, SearchResults } from "@/services/search";
import { apiClient } from "@/api/client";
import { toast } from "sonner";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [gates, setGates] = useState<GateStatus[]>([]);
  const [match, setMatch] = useState<any>(null);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem("recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        setRecentSearches([]);
      }
    }
  }, []);

  const addRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const clean = query.trim();
    const updated = [clean, ...recentSearches.filter((s) => s !== clean)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recent_searches");
  };

  // Debounced search trigger (300ms delay)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await searchService.search(searchQuery);
        setSearchResults(res);
        addRecentSearch(searchQuery);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-indigo-100 text-indigo-900 rounded px-0.5 font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Tickets & Matches States
  const [tickets, setTickets] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [seatNumber, setSeatNumber] = useState("");
  const [gateNumber, setGateNumber] = useState("");
  const [bookingSubmit, setBookingSubmit] = useState(false);
  const [matchSearch, setMatchSearch] = useState("");

  const handleSignOut = async () => {
    await logout();
    setLocation("/");
  };

  // Role Redirect Check
  useEffect(() => {
    if (user && user.role !== "fan") {
      setLocation(`/${user.role}/dashboard`);
    }
  }, [user, setLocation]);

  const loadTicketsAndMatches = async () => {
    setTicketsLoading(true);
    try {
      const ticketsResp = await apiClient.get("/tickets");
      if (ticketsResp.data?.success && ticketsResp.data?.data?.docs) {
        setTickets(ticketsResp.data.data.docs);
        localStorage.setItem("cached_tickets", JSON.stringify(ticketsResp.data.data.docs));
      }
      const matchesResp = await apiClient.get("/matches");
      if (matchesResp.data?.success && matchesResp.data?.data?.docs) {
        setMatches(matchesResp.data.data.docs);
        localStorage.setItem("cached_matches", JSON.stringify(matchesResp.data.data.docs));
      }
    } catch (err) {
      console.error("Failed to load tickets/matches from server, checking cache:", err);
      const cachedT = localStorage.getItem("cached_tickets");
      if (cachedT) {
        try {
          setTickets(JSON.parse(cachedT));
        } catch (e) {
          console.error("Failed to parse cached tickets", e);
        }
      }
      const cachedM = localStorage.getItem("cached_matches");
      if (cachedM) {
        try {
          setMatches(JSON.parse(cachedM));
        } catch (e) {
          console.error("Failed to parse cached matches", e);
        }
      }
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const liveGates = await crowdService.getGateStatus();
        setGates(liveGates.slice(0, 4));

        const matchResponse = await apiClient.get("/matches");
        if (matchResponse.data?.success && matchResponse.data?.data?.docs?.length > 0) {
          setMatch(matchResponse.data.data.docs[0]);
        }
      } catch (e) {
        console.error("Dashboard data load error:", e);
      }
    }
    loadData();
    loadTicketsAndMatches();
  }, []);

  const handleActionClick = (id: string) => {
    if (id === "chat") {
      setLocation("/chat");
    } else if (id === "food") {
      setLocation("/food");
    } else if (id === "emergency") {
      setLocation("/emergency");
    } else if (id === "transport") {
      setLocation("/transport");
    } else {
      setActiveSection(id);
      // Scroll down to active section content
      setTimeout(() => {
        document.getElementById("content-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleBookTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch || !seatNumber || !gateNumber) {
      toast.error("Please fill in all seat and gate details.");
      return;
    }
    setBookingSubmit(true);
    try {
      const response = await apiClient.post("/tickets", {
        matchId: selectedMatch._id,
        seatNumber,
        gate: gateNumber,
      });
      if (response.data?.success) {
        toast.success("Ticket booked successfully!");
        setBookingOpen(false);
        setSeatNumber("");
        setGateNumber("");
        setSelectedMatch(null);
        loadTicketsAndMatches();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to book ticket.");
    } finally {
      setBookingSubmit(false);
    }
  };

  const handleCancelTicket = async (id: string) => {
    try {
      const response = await apiClient.delete(`/tickets/${id}`);
      if (response.data?.success) {
        toast.success("Ticket cancelled successfully.");
        loadTicketsAndMatches();
      }
    } catch (err) {
      toast.error("Failed to cancel ticket.");
    }
  };

  const dashboardItems = [
    {
      id: "chat",
      icon: MessageSquare,
      title: "AI Assistant",
      description: "Ask me anything about the stadium",
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "map",
      icon: MapPin,
      title: "Live Map",
      description: "View stadium layout and navigate",
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "tickets",
      icon: TicketIcon,
      title: "My Tickets",
      description: "View and book match tickets",
      color: "bg-teal-100 text-teal-600",
    },
    {
      id: "food",
      icon: Utensils,
      title: "Food Finder",
      description: "Find food stalls and queue times",
      color: "bg-orange-100 text-orange-600",
    },
    {
      id: "emergency",
      icon: AlertCircle,
      title: "Emergency SOS",
      description: "Get immediate help",
      color: "bg-red-100 text-red-600",
    },
    {
      id: "transport",
      icon: NavigationIcon,
      title: "Transportation",
      description: "Post-match travel options",
      color: "bg-green-100 text-green-600",
    },
  ];

  const displayGates = gates.length > 0 ? gates : [
    { gate: "Gate 1", status: "live", crowd: "High" as const, visitors: 8230 },
    { gate: "Gate 2", status: "caution", crowd: "Medium" as const, visitors: 6120 },
    { gate: "Gate 3", status: "live", crowd: "Low" as const, visitors: 4890 },
    { gate: "Gate 4", status: "caution", crowd: "Medium" as const, visitors: 5980 },
  ];

  const occupancyPercent = match?.attendance && match?.stadiumId?.capacity 
    ? Math.round((match.attendance / match.stadiumId.capacity) * 100) + "%" 
    : "90%";

  const filteredMatches = matches.filter(
    (m) =>
      m.homeTeam.toLowerCase().includes(matchSearch.toLowerCase()) ||
      m.awayTeam.toLowerCase().includes(matchSearch.toLowerCase()) ||
      m.stadiumId?.name?.toLowerCase().includes(matchSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-12 animate-slide-in-down">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Welcome, {user?.fullName || "Fan"}
                </h1>
                <p className="text-muted-foreground">
                  Your personalized stadium assistant is ready to help
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
            <div className="mb-8 relative" onMouseLeave={() => setShowSuggestions(false)}>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 text-muted-foreground" size={20} />
                <Input
                  placeholder="Global search matches, stadiums, tickets, food stalls, transportation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-10 pr-10 py-6 text-base shadow-sm bg-card"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-10 top-4 text-muted-foreground hover:text-foreground btn-press"
                    title="Clear search"
                  >
                    <X size={18} />
                  </button>
                )}
                {searchLoading && (
                  <Loader2 className="absolute right-3 top-4 animate-spin text-muted-foreground" size={18} />
                )}
              </div>

              {/* Suggestions / Recent Searches Dropdown */}
              {showSuggestions && (
                <div className="absolute left-0 right-0 z-20 mt-1 bg-card rounded-lg border border-border shadow-lg p-4 animate-scale-in">
                  <div className="flex items-center justify-between border-b pb-2 mb-3">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Search Assistant</span>
                    <button
                      type="button"
                      onClick={() => setShowSuggestions(false)}
                      className="text-xs text-muted-foreground hover:text-foreground/90 font-semibold"
                    >
                      Close
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Recent Searches */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-foreground/90">Recent Searches</h4>
                        {recentSearches.length > 0 && (
                          <button
                            type="button"
                            onClick={clearRecentSearches}
                            className="text-[10px] text-red-500 hover:underline font-semibold"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      {recentSearches.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No recent searches</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {recentSearches.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSearchQuery(s);
                                setShowSuggestions(false);
                              }}
                              className="text-xs bg-muted hover:bg-muted text-foreground/90 px-2 py-1 rounded btn-press"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Suggestions */}
                    <div>
                      <h4 className="text-xs font-bold text-foreground/90 mb-2">Suggested Stadium Queries</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {["Gate 1", "Matches", "Food queue times", "Transport route", "SOS"].map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSearchQuery(s);
                              setShowSuggestions(false);
                            }}
                            className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2 py-1 rounded font-medium btn-press"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                            {highlightText(`${m.homeTeam} vs ${m.awayTeam}`, searchQuery)} ({m.status}) - {new Date(m.date).toLocaleDateString()}
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
                            {highlightText(s.name, searchQuery)} in {highlightText(s.city, searchQuery)} (Capacity: {s.capacity})
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
                            {highlightText(f.name, searchQuery)} ({highlightText(f.category, searchQuery)}) at {f.location} - {f.rating}★
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
                            {highlightText(t.type, searchQuery)} ({highlightText(t.routeName, searchQuery)}) to {highlightText(t.destination, searchQuery)} - Status: {t.status}
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

            {/* Live Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {displayGates.map((item, idx) => (
                <div
                  key={idx}
                  className="card-hover p-4 bg-card rounded-lg border border-border"
                >
                  <p className="text-sm text-muted-foreground mb-2">{item.gate}</p>
                  <StatusBadge
                    status={
                      item.status === "live"
                        ? "live"
                        : item.status === "caution"
                          ? "caution"
                          : "unavailable"
                    }
                    label={item.crowd}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left: Quick Actions */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Quick Access
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {dashboardItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      style={{
                        animation: `slide-in-up 0.5s ease-out ${idx * 0.1}s both`,
                      }}
                    >
                      <button
                        onClick={() => handleActionClick(item.id)}
                        className={`card-hover w-full p-6 bg-card rounded-lg border text-left transition-colors ${
                          activeSection === item.id ? "border-indigo-500 bg-indigo-50/10" : "border-border hover:border-indigo-300"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center mb-4`}
                        >
                          <Icon size={24} />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Sidebar */}
            <div>
              <div className="card-hover p-6 bg-card rounded-lg border border-border mb-6 animate-slide-in-up">
                <h3 className="font-semibold text-foreground mb-4">
                  Your Profile
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-border pb-3">
                    <img
                      src={user?.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full border border-border object-cover"
                    />
                    <div>
                      <p className="text-foreground font-bold text-sm">{user?.fullName || "John Doe"}</p>
                      <p className="text-xs text-muted-foreground font-semibold uppercase">{user?.role || "Fan"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Email
                    </p>
                    <p className="text-foreground font-medium">{user?.email || "john.doe@fifa.com"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Language
                    </p>
                    <p className="text-foreground font-medium">
                      {user?.language === "en" ? "English" : user?.language === "es" ? "Spanish" : user?.language || "English"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-hover p-6 bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-lg border border-indigo-200 animate-slide-in-up">
                <h3 className="font-semibold text-foreground mb-3">
                  Pro Tip
                </h3>
                <p className="text-sm text-foreground/90 mb-4">
                  Use the AI Assistant to ask about crowd levels and find the
                  best entry gate.
                </p>
                <Button
                  size="sm"
                  onClick={() => setLocation("/chat")}
                  className="w-full btn-press bg-indigo-600 hover:bg-indigo-700"
                >
                  Ask AI Now
                </Button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div id="content-section" className="mt-12 animate-fade-in">
            {activeSection === "overview" && (
              <div className="card-hover p-8 bg-card rounded-lg border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Stadium Overview
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">
                      Today's Match
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Home Team</span>
                        <span className="font-semibold">{match?.homeTeam || "Team A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Away Team</span>
                        <span className="font-semibold">{match?.awayTeam || "Team B"}</span>
                      </div>
                      <div className="border-t border-border pt-3">
                        <p className="text-sm text-muted-foreground">
                          Kickoff: {match?.kickoffTime || "8:00 PM"} • Stadium: {match?.stadiumId?.name || "MetLife Stadium"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">
                      Quick Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Attendance</span>
                        <span className="font-semibold">
                          {match?.attendance ? match.attendance.toLocaleString() : "45,230"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capacity</span>
                        <span className="font-semibold">
                          {match?.stadiumId?.capacity ? match.stadiumId.capacity.toLocaleString() : "50,000"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Occupancy</span>
                        <span className="font-semibold text-green-600">{occupancyPercent}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "map" && (
              <div className="card-hover p-8 bg-card rounded-lg border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Live Stadium Map
                </h2>
                <MapView />
              </div>
            )}

            {/* My Tickets Section */}
            {activeSection === "tickets" && (
              <div className="space-y-6">
                {/* Tickets list */}
                <div className="card-hover p-6 bg-card rounded-lg border border-border">
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <TicketIcon size={24} className="text-indigo-600" />
                    My Booked Tickets
                  </h2>
                  {ticketsLoading ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="p-4 border border-border rounded-lg space-y-3 bg-muted/50">
                          <div className="flex justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-3.5 w-32" />
                          <div className="flex justify-between items-center pt-2">
                            <div className="space-y-1.5">
                              <Skeleton className="h-2 w-16" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-10 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="py-8">
                      <Empty className="bg-muted/50 border-dashed border-border">
                        <EmptyHeader>
                          <EmptyMedia className="bg-indigo-50 text-indigo-600 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                            <TicketIcon size={18} />
                          </EmptyMedia>
                          <EmptyTitle className="text-sm font-bold text-foreground">No Tickets Booked</EmptyTitle>
                          <EmptyDescription className="text-xs text-muted-foreground max-w-xs mx-auto mt-1 leading-normal">
                            Browse upcoming FIFA World Cup 2026 matches below to book your seat!
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {tickets.map((t) => (
                        <div key={t._id} className="p-4 bg-muted border border-border rounded-lg flex flex-col justify-between hover:border-indigo-300 transition-colors">
                          <div className="border-b border-dashed border-border pb-3 mb-3">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                                {t.status.toUpperCase()}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                Booked {new Date(t.purchaseDate).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="font-bold text-foreground text-base">
                              {t.matchId?.homeTeam} vs {t.matchId?.awayTeam}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Kickoff: {t.matchId?.kickoffTime} • {new Date(t.matchId?.date).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t.matchId?.stadiumId?.name}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Seat Details</p>
                              <p className="text-sm font-bold text-foreground">{t.seatNumber}</p>
                              <p className="text-xs text-muted-foreground">Entrance: {t.gate}</p>
                            </div>
                            {/* Barcode/QR Code Sim */}
                            <div className="flex flex-col items-center gap-1.5 p-1 bg-card border border-border rounded">
                              <div className="h-10 w-24 bg-slate-900 flex items-center justify-center text-[8px] text-white tracking-widest font-mono select-none">
                                ||||||||||||||
                              </div>
                              <span className="text-[8px] text-muted-foreground font-mono">{t.QRCode?.split("-")?.[3] || "QR"}</span>
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t border-border flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelTicket(t._id)}
                              className="btn-press border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                            >
                              <Trash2 size={14} /> Cancel Booking
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Available Matches to book */}
                <div className="card-hover p-6 bg-card rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                      <Calendar size={24} className="text-indigo-600" />
                      Browse Scheduled Matches
                    </h2>
                    <div className="relative w-64">
                      <Search className="absolute left-2.5 top-2.5 text-muted-foreground" size={16} />
                      <Input
                        placeholder="Search team or stadium..."
                        value={matchSearch}
                        onChange={(e) => setMatchSearch(e.target.value)}
                        className="pl-8 py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  {ticketsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 border border-border rounded-lg flex flex-col md:flex-row justify-between gap-4 bg-muted/50">
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-3.5 w-32" />
                            <Skeleton className="h-3 w-40" />
                          </div>
                          <div className="flex items-center gap-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-9 w-28" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredMatches.length === 0 ? (
                    <div className="py-8">
                      <Empty className="bg-muted/50 border-dashed border-border">
                        <EmptyHeader>
                          <EmptyMedia className="bg-muted text-muted-foreground rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                            <Calendar size={18} />
                          </EmptyMedia>
                          <EmptyTitle className="text-sm font-bold text-foreground">No Matches Found</EmptyTitle>
                          <EmptyDescription className="text-xs text-muted-foreground max-w-xs mx-auto mt-1 leading-normal">
                            We couldn't find any matches matching your query. Try another team name or stadium!
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredMatches.map((m) => (
                        <div key={m._id} className="p-4 bg-muted border border-border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-foreground text-base">
                              {m.homeTeam} vs {m.awayTeam}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Date: {new Date(m.date).toLocaleDateString()} • Kickoff: {m.kickoffTime}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Stadium: {m.stadiumId?.name} ({m.stadiumId?.city})
                            </p>
                          </div>
                          <div className="flex items-center gap-4 flex-wrap justify-between md:justify-end">
                            <div className="text-right">
                              <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                {m.seatAvailability.toLocaleString()} seats left
                              </span>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedMatch(m);
                                setBookingOpen(true);
                              }}
                              className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
                              disabled={m.seatAvailability <= 0}
                            >
                              Book Ticket
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Booking dialog */}
                <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                  <DialogContent className="sm:max-w-md bg-card border border-border shadow-xl rounded-lg">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold">Book Match Ticket</DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground">
                        Select seat details for {selectedMatch?.homeTeam} vs {selectedMatch?.awayTeam}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleBookTicket} className="space-y-4 pt-2">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground/90">Seat Designation</label>
                        <Input
                          placeholder="e.g. Section B, Row 12, Seat 4"
                          value={seatNumber}
                          onChange={(e) => setSeatNumber(e.target.value)}
                          required
                          disabled={bookingSubmit}
                          className="btn-press"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground/90">Preferred Entry Gate</label>
                        <select
                          value={gateNumber}
                          onChange={(e) => setGateNumber(e.target.value)}
                          required
                          disabled={bookingSubmit}
                          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 btn-press"
                        >
                          <option value="">Select a Gate</option>
                          {(selectedMatch?.stadiumId?.gates || ["Gate 1", "Gate 2", "Gate 3", "Gate 4"]).map((gate: string) => (
                            <option key={gate} value={gate}>
                              {gate}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex justify-end gap-2 pt-3 border-t border-border">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setBookingOpen(false)}
                          disabled={bookingSubmit}
                          className="btn-press text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={bookingSubmit || !seatNumber || !gateNumber}
                          className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1"
                        >
                          {bookingSubmit ? <Loader2 size={12} className="animate-spin" /> : null}
                          Confirm Booking
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
