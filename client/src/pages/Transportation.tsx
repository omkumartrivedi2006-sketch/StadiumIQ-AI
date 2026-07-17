import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, DollarSign, Users, MapPin, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { transportService, TransportOption } from "@/services/transport";
import { aiService } from "@/services/ai";
import { toast } from "sonner";

export default function Transportation() {
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([]);
  const [loading, setLoading] = useState(true);

  // AI State
  const [aiQuery, setAiQuery] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const options = await transportService.getTransportOptions();
        setTransportOptions(options);
      } catch (e) {
        console.error("Failed to fetch transportation options:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchOptions();
  }, []);

  const handleBookRide = async (optionId: number, type: string) => {
    try {
      const success = await transportService.bookRide(optionId);
      if (success) {
        toast.success(`Ride booked successfully via ${type}!`);
      } else {
        toast.error("Failed to book ride.");
      }
    } catch (e) {
      toast.error("Failed to book ride.");
    }
  };

  const handleQueryAI = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
      const reply = await aiService.getTransportAdvice(aiQuery);
      setAiReply(reply);
    } catch (err) {
      toast.error("Failed to fetch AI transport suggestions.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-12 animate-slide-in-down">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Transportation Assistant
            </h1>
            <p className="text-slate-600">
              Post-match travel options with real-time wait times and fares
            </p>
          </div>

          {/* AI Transit Assistant Card */}
          <div className="mb-8 animate-slide-in-up p-6 bg-white rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50/50 to-cyan-50/50">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-indigo-600 animate-pulse" size={20} />
              <h2 className="text-lg font-semibold text-slate-900">AI Transit Assistant</h2>
            </div>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Ask travel recommendations (e.g. best metro route, taxi fare, nearest parking zone)..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !aiLoading) handleQueryAI();
                }}
                disabled={aiLoading}
                className="bg-white"
              />
              <Button
                onClick={handleQueryAI}
                disabled={aiLoading || !aiQuery.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex-shrink-0"
              >
                {aiLoading ? <Loader2 size={16} className="animate-spin" /> : "Ask AI"}
              </Button>
            </div>
            {aiReply && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200 text-sm text-slate-700 leading-relaxed shadow-sm">
                <span className="font-semibold text-indigo-600 block mb-1">AI Recommendation:</span>
                {aiReply}
              </div>
            )}
          </div>

          {/* Transport Options Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 bg-white rounded-lg border border-slate-200 space-y-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-6 w-32" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-44" />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-9 w-20 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : transportOptions.length === 0 ? (
            <div className="py-12 bg-white border border-slate-200 rounded-lg mb-12">
              <Empty className="max-w-md mx-auto">
                <EmptyHeader>
                  <EmptyMedia className="bg-slate-100 text-slate-500 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                    <MapPin size={18} />
                  </EmptyMedia>
                  <EmptyTitle className="text-sm font-bold text-slate-800">No Transit Data</EmptyTitle>
                  <EmptyDescription className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-normal">
                    There are no active transportation options reported at the moment. Please consult the local SOS help desk.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {transportOptions.map((option, idx) => (
                <div
                  key={option.id}
                  style={{
                    animation: `slide-in-up 0.5s ease-out ${idx * 0.1}s both`,
                  }}
                  className="card-hover p-6 bg-white rounded-lg border border-slate-200"
                >
                  <div className="text-4xl mb-4">{option.icon}</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">
                    {option.type}
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-cyan-600" />
                      <span className="text-sm text-slate-700">
                        Wait: <span className="font-semibold">{option.waitTime}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-green-600" />
                      <span className="text-sm text-slate-700">
                        Fare: <span className="font-semibold">{option.fare}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-indigo-600" />
                      <span className="text-sm text-slate-700">
                        Distance: <span className="font-semibold">{option.distance}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-slate-900">
                        {option.rating}★
                      </span>
                    </div>
                    <Button
                      onClick={() => handleBookRide(option.id, option.type)}
                      size="sm"
                      className="btn-press bg-indigo-600 hover:bg-indigo-700"
                    >
                      Book
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Travel Tips */}
          <div className="animate-slide-in-up p-8 bg-white rounded-lg border border-slate-200 mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Travel Tips
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">Peak Hours</h3>
                <p className="text-sm text-slate-700">
                  Expect longer wait times 15-30 minutes after match ends. Consider waiting
                  or using less crowded options.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Money-Saving Tips
                </h3>
                <p className="text-sm text-slate-700">
                  Use metro or bus for budget-friendly options. Ride-sharing is faster but
                  more expensive.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">Safety First</h3>
                <p className="text-sm text-slate-700">
                  Always use official taxis or ride-sharing apps. Travel with friends when
                  possible.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Accessibility Options
                </h3>
                <p className="text-sm text-slate-700">
                  All transport options have accessible vehicles. Request assistance when
                  booking.
                </p>
              </div>
            </div>
          </div>

          {/* Nearby Stations */}
          <div className="animate-slide-in-up p-8 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-lg border border-indigo-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Nearby Transit Stations
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Central Metro Station",
                  distance: "500m",
                  lines: "Red, Blue, Green",
                },
                {
                  name: "Main Bus Terminal",
                  distance: "800m",
                  lines: "Routes 1, 5, 12, 25",
                },
                {
                  name: "Taxi Stand",
                  distance: "200m",
                  lines: "Available 24/7",
                },
              ].map((station, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white rounded-lg border border-indigo-200"
                >
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {station.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-2">
                    <span className="font-medium">Distance:</span> {station.distance}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Lines:</span> {station.lines}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
