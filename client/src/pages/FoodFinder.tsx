import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Clock, MapPin, Search, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { foodService, FoodStall } from "@/services/food";
import { aiService } from "@/services/ai";
import { toast } from "sonner";

export default function FoodFinder() {
  const [searchTerm, setSearchTerm] = useState("");
  const [foodStalls, setFoodStalls] = useState<FoodStall[]>([]);
  const [loading, setLoading] = useState(true);

  // AI State
  const [aiQuery, setAiQuery] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    async function fetchStalls() {
      try {
        const stalls = await foodService.getFoodStalls();
        setFoodStalls(stalls);
      } catch (e) {
        console.error("Failed to load food stalls:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchStalls();
  }, []);

  const handleOrder = async (stallId: number, name: string) => {
    try {
      const success = await foodService.orderFood(stallId, `Ordered Whopper/Burger from ${name}`);
      if (success) {
        toast.success(`Order placed successfully at ${name}!`);
      } else {
        toast.error("Failed to place order.");
      }
    } catch (e) {
      toast.error("Failed to place order.");
    }
  };

  const handleQueryAI = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
      const reply = await aiService.getFoodRecommendations(aiQuery);
      setAiReply(reply);
    } catch (err) {
      toast.error("Failed to fetch AI recommendations.");
    } finally {
      setAiLoading(false);
    }
  };

  const filteredStalls = foodStalls.filter(
    (stall) =>
      stall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stall.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-12 animate-slide-in-down">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Food Finder
            </h1>
            <p className="text-muted-foreground">
              Discover food stalls with real-time queue times and ratings
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8 animate-slide-in-up">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <Input
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-6 text-base"
              />
            </div>
          </div>

          {/* AI Food Recommender Card */}
          <div className="mb-8 animate-slide-in-up p-6 bg-card rounded-lg border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-indigo-600 animate-pulse" size={20} />
              <h2 className="text-lg font-semibold text-foreground">AI Food Recommender</h2>
            </div>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Ask AI for food suggestions (e.g. Vegetarian near Gate 3, shortest waiting time, vegan desserts)..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !aiLoading) handleQueryAI();
                }}
                disabled={aiLoading}
                className="bg-card"
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
              <div className="mt-4 p-4 bg-muted rounded-lg border border-border text-sm text-foreground leading-relaxed shadow-sm">
                <span className="font-semibold text-indigo-600 block mb-1">AI Recommendation:</span>
                {aiReply}
              </div>
            )}
          </div>

          {/* Food Stalls Grid */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading food stalls...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStalls.map((stall, idx) => (
                <div
                  key={stall.id}
                  style={{
                    animation: `slide-in-up 0.5s ease-out ${idx * 0.1}s both`,
                  }}
                  className="card-hover p-6 bg-card rounded-lg border border-border"
                >
                  {/* Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">
                          {stall.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{stall.category}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded">
                        <Star size={16} className="text-amber-500 fill-amber-500" />
                        <span className="text-sm font-semibold text-amber-700">
                          {stall.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="space-y-3 mb-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-cyan-600" />
                      <span className="text-sm text-foreground">
                        <span className="font-semibold">{stall.queueTime} min</span> wait
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-indigo-600" />
                      <span className="text-sm text-foreground">
                        {stall.distance} • {stall.location}
                      </span>
                    </div>
                    <div className="text-sm text-foreground">
                      <span className="font-semibold">{stall.price}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    onClick={() => handleOrder(stall.id, stall.name)}
                    className="w-full btn-press bg-indigo-600 hover:bg-indigo-700"
                  >
                    Order Now
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredStalls.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No food stalls found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
