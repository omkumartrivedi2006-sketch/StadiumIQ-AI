import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Heart, Calendar, Shield } from "lucide-react";

export default function RoleSelection() {
  const [, setLocation] = useLocation();

  const roles = [
    {
      id: "fan",
      title: "Fan",
      description: "Navigate routes, find food stalls, check crowd levels, and ask the AI assistant.",
      icon: Users,
      color: "bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-400",
      path: "/dashboard",
    },
    {
      id: "volunteer",
      title: "Volunteer",
      description: "Access translations, report lost items, view accessibility maps, and assist fans.",
      icon: Heart,
      color: "bg-green-50 text-green-600 border-green-200 hover:border-green-400",
      path: "/volunteer",
    },
    {
      id: "organizer",
      title: "Organizer",
      description: "Monitor crowd heatmaps, post announcements, manage volunteers, and track security.",
      icon: Calendar,
      color: "bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-400",
      path: "/organizer",
    },
    {
      id: "admin",
      title: "Admin",
      description: "View system analytics, configure integrations, review incident reports, and system state.",
      icon: Shield,
      color: "bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-400",
      path: "/admin",
    },
  ];

  const handleRoleSelect = (roleId: string, path: string) => {
    localStorage.setItem("user_role", roleId);
    // In future modules, updates user role state in database / context.
    setLocation(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-4">
        <div className="max-w-4xl w-full text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Select Your Role</h1>
          <p className="text-slate-600 text-lg">
            Choose how you would like to experience StadiumIQ AI today.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card
                key={role.id}
                onClick={() => handleRoleSelect(role.id, role.path)}
                className={`cursor-pointer transition-all duration-200 border-2 hover:-translate-y-1 hover:shadow-md ${role.color}`}
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-lg bg-white shadow-sm flex-shrink-0">
                    <Icon size={28} />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">{role.title}</CardTitle>
                    <CardDescription className="text-slate-600 mt-1">{role.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
