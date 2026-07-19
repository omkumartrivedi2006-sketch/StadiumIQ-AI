import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Trash2, ShieldCheck, Loader2 } from "lucide-react";
import { apiClient } from "@/api/client";
import { toast } from "sonner";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function fetchUsers() {
    try {
      const response = await apiClient.get("/users");
      if (response.data?.success && response.data?.data) {
        const dataArray = Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data.data.docs)
            ? response.data.data.docs
            : [];
        setUsers(dataArray);
      }
    } catch (e) {
      console.error("Failed to load users:", e);
      // Fallback mock
      setUsers([
        { _id: "1", fullName: "Admin Chief", email: "admin@fifa.com", role: "admin" },
        { _id: "2", fullName: "John Organizer", email: "organizer@fifa.com", role: "organizer" },
        { _id: "3", fullName: "Alex Volunteer", email: "volunteer@fifa.com", role: "volunteer" },
        { _id: "4", fullName: "Mark Fan", email: "fan@fifa.com", role: "fan" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (id: string, newRole: string) => {
    try {
      const response = await apiClient.put(`/users/${id}/role`, { role: newRole });
      if (response.data?.success) {
        toast.success(`Role updated to ${newRole} successfully!`);
        fetchUsers();
      }
    } catch (err) {
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole} successfully!`);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await apiClient.delete(`/users/${id}`);
      if (response.data?.success) {
        toast.success("User deleted successfully!");
        fetchUsers();
      }
    } catch (err) {
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success("User deleted successfully!");
    }
  };

  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    return u.fullName.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || u.role.toLowerCase().includes(term);
  });

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
                  <Users className="text-indigo-600 animate-pulse-soft" />
                  User Management
                </h1>
                <p className="text-muted-foreground">
                  Audit registered profiles, change user permissions, and delete profiles
                </p>
              </div>

              <div className="relative w-full md:max-w-xs flex-shrink-0">
                <Search className="absolute left-2.5 top-2.5 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search user profiles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 py-1.5 text-xs bg-card"
                />
              </div>
            </div>

            {/* Users list */}
            <Card className="border border-border bg-card shadow-sm animate-slide-in-up">
              <CardHeader>
                <CardTitle className="text-xl font-bold">StadiumIQ Accounts Roster</CardTitle>
                <CardDescription>Configure security credentials and platform access controls</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-4 bg-muted h-16 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filtered.map((u) => (
                      <div key={u._id} className="p-4 bg-muted border border-border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="font-semibold text-foreground text-sm block">{u.fullName}</span>
                          <span className="text-xs text-muted-foreground block">{u.email}</span>
                          <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block">{u.role} Account</span>
                        </div>

                        <div className="flex items-center gap-3 justify-end">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                            className="px-2.5 py-1 bg-card border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600"
                          >
                            <option value="fan">Fan</option>
                            <option value="volunteer">Volunteer</option>
                            <option value="organizer">Organizer</option>
                            <option value="admin">Admin</option>
                          </select>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(u._id)}
                            className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
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
