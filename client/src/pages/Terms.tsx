import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navigation />

        <div className="pt-32 pb-20 px-4 md:px-0">
          <div className="container mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-12 text-center animate-slide-in-down">
              <FileText className="text-indigo-600 dark:text-indigo-400 mx-auto w-16 h-16 mb-4 animate-pulse-soft" />
              <h1 className="text-4xl font-bold text-foreground mb-2">Terms & Conditions</h1>
              <p className="text-sm text-muted-foreground">Last Updated: July 16, 2026</p>
            </div>

            {/* Legal Document Content */}
            <Card className="border border-border bg-card shadow-sm overflow-hidden animate-slide-in-up">
              <CardContent className="p-8 space-y-6 text-foreground/90 text-sm leading-relaxed">
                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
                  <p>
                    By registering for, downloading, or accessing the StadiumIQ AI application, you agree to comply with and be bound by these terms. If you do not accept these terms, you may not utilize our platform features.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">2. User Accounts & Registration</h2>
                  <p>
                    You must verify accurate details when establishing profiles (e.g. valid name, current email, role categories). You are responsible for preserving credentials safety, protecting passwords, and locking sessions after event completions.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">3. User Responsibilities & Conduct</h2>
                  <p>
                    Users must execute the emergency SOS trigger exclusively during real critical incidents. Abusing safety alarms, submitting false reports, or coordinates spamming will result in immediate profile suspension and potential legal inquiries.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">4. Prohibited Activities</h2>
                  <p>
                    You may not bypass backend gate sensors, scrape crowd heatmap analytical outputs, feed mock coordinates to navigation guides, or submit abusive queries to the AI Assistant chatbots.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">5. Subscription Terms & Payments</h2>
                  <p>
                    Professional plans are billed on a recurring monthly cycle as defined at pricing checkouts. Payments are processed securely via third-party operators. StadiumIQ reserves rights to update subscription amounts with prior notice.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">6. Refund Policy</h2>
                  <p>
                    Subscribers may terminate Professional plan licenses at any point. Cancelled subscriptions remain active until the end of the current billing cycle, and no partial or retroactive refunds will be issued.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">7. Intellectual Property</h2>
                  <p>
                    StadiumIQ AI logo assets, analytics components, layout structures, neural mapping codes, and documentation are the exclusive property of StadiumIQ. No reproduction, modification, or parsing of codes is permitted without prior written consent.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">8. Limitation of Liability</h2>
                  <p>
                    StadiumIQ AI acts as an operational guidance assistant. We assume no liability for match cancellations, transport delays, emergency responder arrival delays, or poor mobile carrier coverage during events.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">9. Governing Law</h2>
                  <p>
                    These terms are governed by the laws of the State of New Jersey, United States, without regard to conflict of law principles. Any dispute arising under these terms shall be resolved in courts located in Bergen County, NJ.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">10. Contact Information</h2>
                  <p>
                    For terms clarifications or operations support inquiries, reach us at: <br />
                    <strong>Email:</strong> legal@stadiumiq.com <br />
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
