import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { MapView } from "@/components/Map";
import { MapPin, Info, ArrowUpRight } from "lucide-react";

export default function StadiumNavigation() {
  const [highlightCategory, setHighlightCategory] = useState<string>("");
  const [highlightName, setHighlightName] = useState<string>("");

  useEffect(() => {
    const cat = localStorage.getItem("highlight_category");
    const name = localStorage.getItem("highlight_name");
    if (cat && name) {
      setHighlightCategory(cat);
      setHighlightName(name);
      localStorage.removeItem("highlight_category");
      localStorage.removeItem("highlight_name");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navigation />

        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Header */}
            <div className="mb-10 animate-slide-in-down">
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
                <MapPin className="text-indigo-600 animate-pulse-soft" />
                Stadium Navigation
              </h1>
              <p className="text-muted-foreground">
                Explore MetLife Stadium layout, locate entry gates, first aid medical rooms, and accessibility paths
              </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-6 animate-slide-in-up">
              {/* Map view wrapper */}
              <div className="lg:col-span-3">
                <Card className="border border-border bg-card shadow-sm overflow-hidden h-[500px] flex flex-col justify-between">
                  <CardContent className="p-0 flex-1 relative">
                    <MapView highlightCategory={highlightCategory} highlightName={highlightName} />
                  </CardContent>
                </Card>
              </div>

              {/* Wayfinding guide & instructions */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="border border-border bg-card shadow-sm p-5">
                  <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-1.5">
                    <Info size={16} className="text-indigo-600" />
                    How to Navigate
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    Use the buttons on the map toolbar to highlight gates, medical rooms, and food courts, or to draw directions.
                  </p>
                  <ul className="space-y-3">
                    <li className="text-xs text-foreground/90 flex gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span><strong>Gates:</strong> Highlights Gate 1 (North), Gate 2 (East), Gate 3 (South), and Gate 4 (West).</span>
                    </li>
                    <li className="text-xs text-foreground/90 flex gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span><strong>Medical Aid:</strong> Displays first aid locations and emergency support stations.</span>
                    </li>
                    <li className="text-xs text-foreground/90 flex gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span><strong>Accessibility Path:</strong> Draws wheelchair-accessible entrance routes.</span>
                    </li>
                  </ul>
                </Card>

                <Card className="border border-border bg-card shadow-sm p-5 bg-gradient-to-br from-indigo-50/50 to-cyan-55/50 dark:from-indigo-950/20 dark:to-cyan-950/20">
                  <h3 className="font-semibold text-foreground text-sm mb-2">Need Live Directions?</h3>
                  <p className="text-xs text-muted-foreground leading-normal mb-3">
                    Ask the StadiumIQ AI Assistant for custom route descriptions from your coordinates to any seat!
                  </p>
                  <a href="/fan/chat" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Chat with AI Now <ArrowUpRight size={12} />
                  </a>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
