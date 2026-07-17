import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navigation />

        <div className="pt-32 pb-20 px-4 md:px-0">
          <div className="container mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-12 text-center animate-slide-in-down">
              <ShieldCheck className="text-indigo-600 dark:text-indigo-400 mx-auto w-16 h-16 mb-4 animate-pulse-soft" />
              <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground">Last Updated: July 16, 2026</p>
            </div>

            {/* Legal Document Content */}
            <Card className="border border-border bg-card shadow-sm overflow-hidden animate-slide-in-up">
              <CardContent className="p-8 space-y-6 text-foreground/90 text-sm leading-relaxed">
                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">1. Information We Collect</h2>
                  <p>
                    We collect personal information necessary to deliver our services, including registration details (e.g. name, email address, password), event routing selections, location parameters during active stadium visits, seat numbers, and user inquiries submitted to the AI assistant chatbot.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">2. How We Use Data</h2>
                  <p>
                    Your data helps optimize navigation routes, estimate queue times, translate conversation threads, and resolve safety SOS alarms. High-priority alerts dispatch local stadium safety stewards directly to coordinates provided in the emergency triggers.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">3. Cookies & Session Storage</h2>
                  <p>
                    StadiumIQ AI employs local cookies and localStorage caches to store layout settings (e.g., active light/dark theme preference), authenticated user tokens, and offline match schedules to ensure persistent access during connectivity drops.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">4. Analytics & AI Inferences</h2>
                  <p>
                    We coordinate anonymized density counts and search volumes to generate heatmaps for event managers. We transmit prompt text to Google Gemini API servers to formulate assistant answers, but no identifying profile details are forwarded.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">5. Third-party Services</h2>
                  <p>
                    Our features utilize third-party suppliers for maps, analytics reporting, and identity verification. Each integration complies with general data privacy regulations.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">6. Data Security</h2>
                  <p>
                    All API communications are encrypted using HTTPS/TLS protocols. Profile databases are protected behind firewalls, and we strictly enforce authentication tokens on dashboard endpoints.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">7. User Rights & Access</h2>
                  <p>
                    You retain rights to request copies of profile archives, update incorrect data, or restrict active telemetry tracking from your account settings interface.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">8. Account Deletion & Purging</h2>
                  <p>
                    Account profiles and match ticket records can be purged immediately by executing the 'Delete Account' option in the Settings panel. Deleted accounts are immediately anonymized in analytical heatmaps.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">9. Contact Information</h2>
                  <p>
                    For privacy compliance inquiries or data handling reviews, reach our security stewards team at: <br />
                    <strong>Email:</strong> privacy@stadiumiq.com <br />
                    <strong>Address:</strong> MetLife Stadium, East Rutherford, NJ, USA.
                  </p>
                </section>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
