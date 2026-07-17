import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, AreaChart, LineChart, PieChart } from "lucide-react";

export default function AdminAnalytics() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navigation />

        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Header */}
            <div className="mb-10 animate-slide-in-down">
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
                <BarChart className="text-indigo-600 animate-pulse-soft" />
                Advanced Analytics
              </h1>
              <p className="text-muted-foreground">
                Review seat ticket sales, gate crowd density profiles, and concession order statistics
              </p>
            </div>

            {/* Analytics grids */}
            <div className="grid md:grid-cols-2 gap-6 animate-slide-in-up">
              <Card className="border border-border bg-card shadow-sm p-6">
                <h3 className="font-bold text-foreground text-sm mb-2 flex items-center gap-1.5">
                  <AreaChart size={16} className="text-indigo-600" />
                  Ticket Revenue Timeline
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Daily ticket sales value metrics for the last 30 days</p>
                <div className="h-48 bg-muted rounded border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                  [Area Chart Displaying Revenue: $4.2M Ticket Sales]
                </div>
              </Card>

              <Card className="border border-border bg-card shadow-sm p-6">
                <h3 className="font-bold text-foreground text-sm mb-2 flex items-center gap-1.5">
                  <PieChart size={16} className="text-indigo-600" />
                  Gate Traffic Allocation
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Percentage volume distribution across MetLife gates</p>
                <div className="h-48 bg-muted rounded border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                  [Pie Chart Displaying Gate Traffic: Gate 2: 45% • Gate 3: 25% • Gate 1: 15% • Gate 4: 15%]
                </div>
              </Card>

              <Card className="border border-border bg-card shadow-sm p-6 col-span-2">
                <h3 className="font-bold text-foreground text-sm mb-2 flex items-center gap-1.5">
                  <LineChart size={16} className="text-indigo-600" />
                  Live Gate Occupancy Rate
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Flow throughput and wait times during operational match days</p>
                <div className="h-48 bg-muted rounded border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                  [Line Chart Displaying Gate Wait Times: Peak Hour 1: 12 mins • Peak Hour 2: 24 mins • Post-Kickoff: 2 mins]
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
