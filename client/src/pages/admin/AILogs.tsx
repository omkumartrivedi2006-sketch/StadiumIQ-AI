import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cpu, Terminal, RefreshCw, BarChart2 } from "lucide-react";
import { toast } from "sonner";

export default function AILogs() {
  const [logs, setLogs] = useState([
    { timestamp: "14:41:02", query: "Where is the nearest wheelchair entrance?", duration: "480ms", tokens: 104, quality: "98% (Success)" },
    { timestamp: "14:40:45", query: "Show me food courts near Gate 3", duration: "550ms", tokens: 120, quality: "95% (Success)" },
    { timestamp: "14:39:12", query: "Divert crowds away from north entrance Gate 1", duration: "1200ms", tokens: 250, quality: "100% (Success)" },
    { timestamp: "14:38:05", query: "Wet floor reported in Corridor B", duration: "680ms", tokens: 145, quality: "97% (Success)" }
  ]);

  const handleRefresh = () => {
    toast.success("AI telemetry logs synchronized!");
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
                  <Cpu className="text-indigo-600 animate-pulse-soft" />
                  AI Query logs
                </h1>
                <p className="text-muted-foreground">
                  Monitor Gemini AI assistant interactions latency, response tokens count, and quality parameters
                </p>
              </div>

              <Button onClick={handleRefresh} className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 flex-shrink-0">
                <RefreshCw size={14} /> Synchronize Logs
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-slide-in-up">
              <Card className="p-4 border border-border bg-card">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Prompts</span>
                <span className="text-2xl font-bold text-foreground block mt-1">45,210</span>
              </Card>
              <Card className="p-4 border border-border bg-card">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Avg Latency</span>
                <span className="text-2xl font-bold text-foreground block mt-1">620ms</span>
              </Card>
              <Card className="p-4 border border-border bg-card">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Tokens Saved</span>
                <span className="text-2xl font-bold text-foreground block mt-1">1.8M</span>
              </Card>
              <Card className="p-4 border border-border bg-card">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Model Variant</span>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 block mt-1">Gemini 1.5 Pro</span>
              </Card>
            </div>

            {/* Console Log Cards */}
            <Card className="border border-border bg-card shadow-sm animate-slide-in-up">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-1.5">
                  <Terminal size={18} className="text-indigo-600" />
                  <span>Interaction Stream</span>
                </CardTitle>
                <CardDescription>Live telemetry data query traces</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 font-mono text-xs">
                  {logs.map((log, idx) => (
                    <div key={idx} className="p-4 bg-muted border border-border rounded-lg space-y-2">
                      <div className="flex justify-between items-center text-muted-foreground border-b border-border pb-1.5">
                        <span>[{log.timestamp}]</span>
                        <span>Latency: {log.duration} • Tokens: {log.tokens}</span>
                      </div>
                      <div className="text-foreground">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">Query:</span> {log.query}
                      </div>
                      <div className="text-green-600">
                        <span className="font-bold">Status:</span> {log.quality}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
