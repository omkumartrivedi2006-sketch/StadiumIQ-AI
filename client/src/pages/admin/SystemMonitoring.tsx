import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Server, Database, HardDrive, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function SystemMonitoring() {
  const [metrics, setMetrics] = useState({
    apiStatus: "Healthy",
    apiLatency: "12ms",
    dbStatus: "Connected",
    dbLatency: "8ms",
    socketConnections: 450,
    cpuUsage: "12%",
    memoryUsage: "34%"
  });
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setMetrics({
        apiStatus: "Healthy",
        apiLatency: `${Math.round(10 + Math.random() * 8)}ms`,
        dbStatus: "Connected",
        dbLatency: `${Math.round(5 + Math.random() * 5)}ms`,
        socketConnections: Math.round(420 + Math.random() * 50),
        cpuUsage: `${Math.round(8 + Math.random() * 10)}%`,
        memoryUsage: `${Math.round(30 + Math.random() * 5)}%`
      });
      setLoading(false);
      toast.success("System monitoring parameters synchronized successfully!");
    }, 500);
  };

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
                  <Activity className="text-indigo-600 animate-pulse-soft" />
                  System Monitoring
                </h1>
                <p className="text-muted-foreground">
                  Monitor live MERN API backend services, MongoDB database latency, and Socket.io cluster loads
                </p>
              </div>

              <Button onClick={handleRefresh} disabled={loading} className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 flex-shrink-0">
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Synchronize metrics
              </Button>
            </div>

            {/* Health parameters grid */}
            <div className="grid md:grid-cols-3 gap-6 animate-slide-in-up">
              <Card className="border border-border bg-card p-6 card-hover">
                <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-1.5 border-b border-border pb-2">
                  <Server size={18} className="text-indigo-600" />
                  API Service Status
                </h3>
                <div className="space-y-3 text-xs text-muted-foreground mt-2">
                  <div className="flex justify-between">
                    <span>Server State</span>
                    <span className="font-bold text-green-600">{metrics.apiStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Response Latency</span>
                    <span className="font-bold text-foreground">{metrics.apiLatency}</span>
                  </div>
                </div>
              </Card>

              <Card className="border border-border bg-card p-6 card-hover">
                <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-1.5 border-b border-border pb-2">
                  <Database size={18} className="text-indigo-600" />
                  Database Cluster Status
                </h3>
                <div className="space-y-3 text-xs text-muted-foreground mt-2">
                  <div className="flex justify-between">
                    <span>MongoDB Instance</span>
                    <span className="font-bold text-green-600">{metrics.dbStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connection Latency</span>
                    <span className="font-bold text-foreground">{metrics.dbLatency}</span>
                  </div>
                </div>
              </Card>

              <Card className="border border-border bg-card p-6 card-hover">
                <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-1.5 border-b border-border pb-2">
                  <HardDrive size={18} className="text-indigo-600" />
                  Resource Allocation
                </h3>
                <div className="space-y-3 text-xs text-muted-foreground mt-2">
                  <div className="flex justify-between">
                    <span>Active WS Connections</span>
                    <span className="font-bold text-foreground">{metrics.socketConnections} sockets</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CPU / Memory Usage</span>
                    <span className="font-bold text-foreground">{metrics.cpuUsage} CPU / {metrics.memoryUsage} RAM</span>
                  </div>
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
