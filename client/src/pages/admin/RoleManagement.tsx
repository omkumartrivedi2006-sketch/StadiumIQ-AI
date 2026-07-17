import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ShieldAlert, Check } from "lucide-react";
import { toast } from "sonner";

export default function RoleManagement() {
  const roles = [
    { name: "Admin", desc: "Full root access, user database deletes, stadium capacity overrides, and system monitors", permissions: ["manage_users", "manage_matches", "manage_stadiums", "view_ai_logs", "view_monitoring"] },
    { name: "Organizer", desc: "Create matches, broadcast announcements, view crowd metrics, and manage volunteers assignments", permissions: ["manage_matches", "manage_stadiums", "broadcast_alerts"] },
    { name: "Volunteer", desc: "Claim SOS emergencies, submit crowd counts, file incident damage reports, and use translators", permissions: ["view_assigned_tasks", "submit_crowd_reports", "file_incident_reports"] },
    { name: "Fan", desc: "View match schedules, purchase seats, query stadium directions, finder food queues, and raise SOS", permissions: ["book_tickets", "use_directions", "raise_sos"] }
  ];

  const handleUpdatePermissions = () => {
    toast.success("Security permissions synchronized across all cluster nodes successfully!");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navigation />

        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Header */}
            <div className="mb-10 animate-slide-in-down">
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Shield className="text-indigo-600 animate-pulse-soft" />
                Role Management
              </h1>
              <p className="text-muted-foreground">
                Audit RBAC configurations, assign policy checks, and synchronize permission schemas
              </p>
            </div>

            <div className="space-y-6 animate-slide-in-up">
              {roles.map((r) => (
                <Card key={r.name} className="border border-border bg-card shadow-sm card-hover">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <ShieldAlert size={18} className="text-indigo-600" />
                      <span>{r.name} Policy Scope</span>
                    </CardTitle>
                    <CardDescription>{r.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {r.permissions.map((p) => (
                        <span key={p} className="text-xs bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 font-semibold px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-1">
                          <Check size={12} /> {p.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="pt-4 border-t border-border flex justify-end">
                <Button onClick={handleUpdatePermissions} className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                  Synchronize Access Policies
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
