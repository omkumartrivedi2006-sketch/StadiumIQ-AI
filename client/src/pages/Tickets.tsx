import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { Ticket as TicketIcon, Calendar, Search, Trash2, Loader2 } from "lucide-react";
import { apiClient } from "@/api/client";
import { toast } from "sonner";

export default function Tickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [seatNumber, setSeatNumber] = useState("");
  const [gateNumber, setGateNumber] = useState("");
  const [bookingSubmit, setBookingSubmit] = useState(false);
  const [matchSearch, setMatchSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
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
      console.error("Failed to load tickets/matches, checking cache:", err);
      const cachedT = localStorage.getItem("cached_tickets");
      if (cachedT) {
        try { setTickets(JSON.parse(cachedT)); } catch (e) {}
      }
      const cachedM = localStorage.getItem("cached_matches");
      if (cachedM) {
        try { setMatches(JSON.parse(cachedM)); } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
        loadData();
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
        loadData();
      }
    } catch (err) {
      toast.error("Failed to cancel ticket.");
    }
  };

  const filteredMatches = matches.filter((m) => {
    const term = matchSearch.toLowerCase();
    return (
      m.homeTeam.toLowerCase().includes(term) ||
      m.awayTeam.toLowerCase().includes(term) ||
      m.stadiumId?.name?.toLowerCase().includes(term) ||
      m.stadiumId?.city?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navigation />

        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Header */}
            <div className="mb-10 animate-slide-in-down">
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
                <TicketIcon className="text-indigo-600" />
                My Tickets
              </h1>
              <p className="text-muted-foreground">
                Manage your match ticket reservations and book seats for upcoming events
              </p>
            </div>

            <div className="space-y-8 animate-slide-in-up">
              {/* Tickets List */}
              <div className="card-hover p-6 bg-card rounded-lg border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <TicketIcon size={24} className="text-indigo-600" />
                  Your Reservations
                </h2>
                {loading ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-4 border border-border rounded-lg space-y-3 bg-muted/50">
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-3.5 w-32" />
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

              {/* Browse Matches */}
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

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-4 border border-border rounded-lg bg-muted/50 h-24" />
                    ))}
                  </div>
                ) : filteredMatches.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">No matches scheduled.</div>
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
            </div>
          </div>
        </div>
      </div>
      <Footer />

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
  );
}
