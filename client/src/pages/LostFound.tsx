import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { lostFoundService, LostItem } from "@/services/lostFound";
import { toast } from "sonner";

export default function LostFound() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    description: "",
    location: "",
    color: "",
  });

  async function loadItems() {
    try {
      const items = await lostFoundService.getLostItems();
      setLostItems(items);
    } catch (e) {
      console.error("Failed to load lost items:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.description && formData.location) {
      try {
        const success = await lostFoundService.reportLostItem(
          formData.description,
          formData.location,
          formData.color
        );
        if (success) {
          toast.success("Lost item reported successfully!");
          setFormData({ description: "", location: "", color: "" });
          setShowForm(false);
          loadItems();
        } else {
          toast.error("Failed to submit report.");
        }
      } catch (e) {
        toast.error("Failed to submit report.");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "found":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "claimed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-muted text-foreground/90";
    }
  };

  const filteredItems = lostItems.filter(
    (item) =>
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-12 animate-slide-in-down">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Lost & Found
                </h1>
                <p className="text-muted-foreground">
                  Report lost items or check found property at FIFA World Cup 2026
                </p>
              </div>
              <Button
                onClick={() => setShowForm(!showForm)}
                className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2"
              >
                <Plus size={18} />
                Report Lost Item
              </Button>
            </div>

            {/* Report Form */}
            {showForm && (
              <div className="animate-scale-in p-6 bg-card rounded-lg border border-border shadow-md mb-8 max-w-xl">
                <h3 className="font-bold text-foreground mb-4 text-lg">
                  Report Lost Property
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">
                      Description of Item
                    </label>
                    <Textarea
                      placeholder="e.g. Blue leather wallet, containing driver license and credit cards"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      required
                      className="btn-press"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground">
                        Last Known Location
                      </label>
                      <Input
                        placeholder="e.g. Gate 3 or Section B"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        required
                        className="btn-press"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground">
                        Item Color (Optional)
                      </label>
                      <Input
                        placeholder="e.g. Blue, Black"
                        value={formData.color}
                        onChange={(e) =>
                          setFormData({ ...formData, color: e.target.value })
                        }
                        className="btn-press"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="btn-press"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                    >
                      Submit Report
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-8 animate-slide-in-up">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
              <Input
                placeholder="Search lost items by description or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-6 text-base animate-pulse-soft"
              />
            </div>
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading lost & found catalog...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    animation: `slide-in-up 0.5s ease-out ${idx * 0.1}s both`,
                  }}
                  className="card-hover p-6 bg-card rounded-lg border border-border"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.reportedTime}</span>
                  </div>

                  <h3 className="font-semibold text-foreground text-lg mb-2">
                    {item.description}
                  </h3>

                  <div className="space-y-2 text-sm text-foreground mb-4 pb-4 border-b border-border">
                    <p>
                      <span className="font-medium text-muted-foreground">Location:</span>{" "}
                      {item.location}
                    </p>
                    {item.color && (
                      <p>
                        <span className="font-medium text-muted-foreground">Color:</span>{" "}
                        {item.color}
                      </p>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {item.status === "pending" && (
                      <p className="flex items-center gap-1.5 text-amber-700">
                        <AlertCircle size={14} /> Waiting for matching found item
                      </p>
                    )}
                    {item.status === "found" && (
                      <p className="text-green-700 font-semibold">
                        Ready for pickup at Information Center
                      </p>
                    )}
                    {item.status === "claimed" && (
                      <p className="text-muted-foreground">Claimed by owner</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No lost items found matching your query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
