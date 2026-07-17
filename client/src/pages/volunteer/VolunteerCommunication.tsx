import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Languages, MessageSquare, Loader2, Sparkles } from "lucide-react";
import { aiService } from "@/services/ai";
import { toast } from "sonner";

export default function VolunteerCommunication() {
  const [text, setText] = useState("");
  const [targetLang, setTargetLang] = useState("Spanish");
  const [translated, setTranslated] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      // Use existing AI helper to get translation advice
      const reply = await aiService.getAccessibilityAdvice(`Translate the following stadium directions or helper phrase to ${targetLang}: "${text}"`);
      setTranslated(reply);
    } catch (err) {
      toast.error("Failed to run AI translation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navigation />

        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-2xl">
            {/* Header */}
            <div className="mb-10 animate-slide-in-down">
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Languages className="text-indigo-600 animate-pulse-soft" />
                Communication Support
              </h1>
              <p className="text-muted-foreground">
                AI translation helper to assist international fans with directional queries and services
              </p>
            </div>

            {/* Translation card */}
            <Card className="border border-border bg-card shadow-sm animate-slide-in-up">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-1.5">
                  <Sparkles size={20} className="text-indigo-500 animate-pulse" />
                  <span>Instant AI Translator</span>
                </CardTitle>
                <CardDescription>Enter english phrases to get instant multilingual stadium guides</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleTranslate} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/90">English Phrase</label>
                    <Input
                      placeholder="e.g. Turn right after Gate 3 to find first aid, or restrooms are behind elevator 2"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      required
                      disabled={loading}
                      className="btn-press"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/90">Target Language</label>
                    <select
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 btn-press"
                    >
                      <option value="Spanish">Spanish (Español)</option>
                      <option value="French">French (Français)</option>
                      <option value="German">German (Deutsch)</option>
                      <option value="Arabic">Arabic (العربية)</option>
                      <option value="Japanese">Japanese (日本語)</option>
                      <option value="Portuguese">Portuguese (Português)</option>
                    </select>
                  </div>

                  <Button type="submit" disabled={loading || !text.trim()} className="w-full btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 mt-4">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare size={16} />}
                    {loading ? "Translating..." : "Translate Phrase"}
                  </Button>
                </form>

                {translated && (
                  <div className="p-4 bg-muted border border-border rounded-lg animate-fade-in">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">Translation Result ({targetLang})</p>
                    <p className="text-sm text-foreground font-semibold leading-relaxed whitespace-pre-wrap">{translated}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
