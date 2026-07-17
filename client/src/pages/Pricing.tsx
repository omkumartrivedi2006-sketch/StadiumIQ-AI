import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, HelpCircle, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

export default function Pricing() {
  const [, setLocation] = useLocation();

  const plans = [
    {
      name: "Starter",
      description: "Essential navigation and safety tools for casual fans.",
      price: "$0",
      period: "forever free",
      features: [
        "Interactive Live Map access",
        "AI Chatbot (15 messages / day)",
        "Gate crowd density status updates",
        "SOS Emergency button connection",
        "Standard transportation routing",
      ],
      cta: "Get Started Free",
      href: "/register",
      recommended: false,
    },
    {
      name: "Professional",
      description: "Premium tools for active fans, volunteer staff, and teams.",
      price: "$19",
      period: "per user / month",
      features: [
        "Unlimited AI Assistant requests",
        "Fast-lane Food Stall Finder & Queue Alerts",
        "Offline maps & offline tickets backup",
        "Volunteer translation tool support",
        "Lost & Found advanced database posting",
        "Priority live-chat support ticket creation",
      ],
      cta: "Go Professional",
      href: "/register",
      recommended: true,
    },
    {
      name: "Enterprise",
      description: "Full dashboard suite for stadium owners and organizers.",
      price: "Custom",
      period: "tailored billing",
      features: [
        "Complete Crowd Heatmaps dashboard integration",
        "Direct safety steward dispatch console",
        "Custom API access & database export rights",
        "Multilingual translation for all staff lines",
        "Dedicated account manager",
        "SLA guaranteed response support times",
      ],
      cta: "Contact Sales",
      href: "/contact",
      recommended: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navigation />

        <div className="pt-32 pb-20 px-4 md:px-0">
          <div className="container mx-auto max-w-6xl">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 animate-slide-in-down">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h1>
              <p className="text-lg text-muted-foreground">
                Choose the plan that suits your stadium experience. Upgrade or downgrade at any time.
              </p>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-3 gap-8 items-stretch mb-20 animate-slide-in-up">
              {plans.map((p, i) => (
                <Card
                  key={i}
                  className={`flex flex-col justify-between border-2 transition-all duration-300 relative ${
                    p.recommended
                      ? "border-indigo-600 dark:border-indigo-500 shadow-xl scale-105 z-10 bg-card"
                      : "border-border bg-card shadow-sm hover:border-indigo-300 dark:hover:border-indigo-800"
                  }`}
                >
                  {p.recommended && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Most Popular
                    </span>
                  )}
                  
                  <div>
                    <CardHeader className="text-center pb-8 border-b border-border">
                      <CardTitle className="text-2xl font-bold text-foreground">{p.name}</CardTitle>
                      <CardDescription className="text-muted-foreground mt-2 min-h-[40px] text-sm">
                        {p.description}
                      </CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-extrabold text-foreground">{p.price}</span>
                        {p.price !== "Custom" && (
                          <span className="text-sm font-medium text-muted-foreground ml-1">/{p.period}</span>
                        )}
                        {p.price === "Custom" && (
                          <span className="text-sm font-medium text-muted-foreground block mt-1">{p.period}</span>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-8">
                      <ul className="space-y-4">
                        {p.features.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <Check className="text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" size={18} />
                            <span className="text-sm text-foreground/90 leading-tight">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </div>
                  
                  <CardFooter className="pt-6">
                    <Button
                      onClick={() => setLocation(p.href)}
                      className={`w-full py-6 font-bold btn-press rounded-xl ${
                        p.recommended
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                          : "bg-muted hover:bg-muted/80 text-foreground"
                      }`}
                      variant={p.recommended ? "default" : "outline"}
                    >
                      {p.cta}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Trust Banner / Features Comparison FAQ */}
            <div className="max-w-4xl mx-auto border-t border-border pt-16">
              <h3 className="text-2xl font-bold text-foreground text-center mb-8">Frequently Asked Pricing Questions</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-foreground mb-2 flex items-center gap-1.5">
                    <HelpCircle size={16} className="text-indigo-600 dark:text-indigo-400" />
                    Are there any hidden fees?
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    No, pricing is completely upfront. Professional features are billed monthly, and you can cancel anytime from your settings tab.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-2 flex items-center gap-1.5">
                    <HelpCircle size={16} className="text-indigo-600 dark:text-indigo-400" />
                    How do enterprise quotes work?
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Our sales and operations department designs a tailor-made proposal matching your stadium size, seat layout, and API traffic volume.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
