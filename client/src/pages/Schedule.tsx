import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Search, MapPin, Clock, ArrowRight, Star } from "lucide-react";
import { useLocation } from "wouter";
import { apiClient } from "@/api/client";

export default function Schedule() {
  const [, setLocation] = useLocation();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchMatches() {
      try {
        const response = await apiClient.get("/matches");
        if (response.data?.success && response.data?.data?.docs) {
          setMatches(response.data.data.docs);
        }
      } catch (err) {
        console.error("Failed to load match schedule:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, []);

  const filtered = matches.filter((m) => {
    const query = search.toLowerCase();
    return (
      m.homeTeam.toLowerCase().includes(query) ||
      m.awayTeam.toLowerCase().includes(query) ||
      m.stadiumId?.name?.toLowerCase().includes(query) ||
      m.stadiumId?.city?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navigation />

        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-in-down">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <Calendar className="text-indigo-600 animate-pulse-soft" />
                  Match Schedule
                </h1>
                <p className="text-muted-foreground">
                  Browse matches schedule, search teams, check stadium locations, and book your tickets
                </p>
              </div>
              
              <div className="relative w-full md:max-w-xs flex-shrink-0">
                <Search className="absolute left-2.5 top-2.5 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search matches or venues..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 py-1.5 text-xs bg-card"
                />
              </div>
            </div>

            <div className="space-y-4 animate-slide-in-up">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="p-6 border border-border rounded-xl bg-card/50 h-28 animate-pulse" />
                ))
              ) : filtered.length === 0 ? (
                <Card className="p-8 border border-border bg-card text-center text-muted-foreground">
                  No upcoming matches found matching your filters.
                </Card>
              ) : (
                filtered.map((m) => (
                  <Card key={m._id} className="border border-border bg-card overflow-hidden card-hover">
                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          <Star size={14} className="fill-current" />
                          <span>FIFA World Cup 2026</span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground">
                          {m.homeTeam} vs {m.awayTeam}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {new Date(m.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} />
                            Kickoff {m.kickoffTime}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} />
                            {m.stadiumId?.name || "MetLife Stadium"} ({m.stadiumId?.city || "New Jersey"})
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 flex-shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-border">
                        <div className="text-left md:text-right">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Availability</p>
                          <p className="text-xs font-semibold text-green-600 mt-0.5">{m.seatAvailability.toLocaleString()} seats left</p>
                        </div>
                        
                        <Button 
                          onClick={() => setLocation("/fan/tickets")}
                          className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                        >
                          Book Tickets <ArrowRight size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
