import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, User, ArrowRight, BookOpen } from "lucide-react";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = ["All", "AI Tips", "Sports Technology", "Stadium Management", "Future of Smart Stadiums"];

  const articles = [
    {
      id: 1,
      title: "How Gemini AI is Revolutionizing Stadium Crowd Management",
      summary: "Explore how neural networks and real-time LLM instructions guide fans to optimal turnstiles, avoiding bottlenecks and queues.",
      category: "AI Tips",
      author: "Dr. Sophia Martinez",
      date: "July 12, 2026",
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&h=300&fit=crop",
      featured: true,
    },
    {
      id: 2,
      title: "Low-Latency Real-Time Alerts for Emergency Systems",
      summary: "Designing robust message routing utilizing Socket.io during high-traffic FIFA World Cup events.",
      category: "Sports Technology",
      author: "Marcus Chen",
      date: "July 10, 2026",
      image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=250&fit=crop",
      featured: false,
    },
    {
      id: 3,
      title: "Improving Stadium Accessibility with AI Navigators",
      summary: "Designing sign language aids and tactile navigation maps to accommodate all sports fans.",
      category: "Stadium Management",
      author: "Elena Rostova",
      date: "July 08, 2026",
      image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&h=250&fit=crop",
      featured: false,
    },
    {
      id: 4,
      title: "The Future of Smart Arenas: Biometric Gating & Frictionless Food",
      summary: "A look into how checkout-free shops and ticketless entry will structure the future matches.",
      category: "Future of Smart Stadiums",
      author: "Sophia Martinez",
      date: "July 05, 2026",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=250&fit=crop",
      featured: false,
    },
    {
      id: 5,
      title: "Smart Water and Power Grids in Modern Sporting Arenas",
      summary: "How organizers leverage sensory systems to track energy usage and waste during large events.",
      category: "Stadium Management",
      author: "John Doe",
      date: "June 28, 2026",
      image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=250&fit=crop",
      featured: false,
    },
  ];

  // Filter articles by query and category
  const filteredArticles = articles.filter((art) => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || art.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featured = filteredArticles.find((a) => a.featured) || filteredArticles[0];
  const regularPosts = filteredArticles.filter((a) => a.id !== featured?.id);

  // Simple Pagination Logic
  const postsPerPage = 2;
  const totalPages = Math.ceil(regularPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = regularPosts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navigation />

        <div className="pt-32 pb-20 px-4 md:px-0">
          <div className="container mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-12 text-center animate-slide-in-down">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">StadiumIQ Blog</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover articles, guides, and updates on sports technology, AI crowd flow, and smart stadiums.
              </p>
            </div>

            {/* Search & Category Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-12">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 btn-press bg-card border-border"
                />
              </div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedCategory(c);
                      setCurrentPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold btn-press transition-colors ${
                      selectedCategory === c
                        ? "bg-indigo-600 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Article Section */}
            {featured && (
              <div className="mb-16 animate-fade-in">
                <h2 className="text-2xl font-bold text-foreground mb-6">Featured Post</h2>
                <div className="grid md:grid-cols-12 gap-8 items-center bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                  <div className="md:col-span-7 h-80 overflow-hidden relative">
                    <img src={featured.image} alt={featured.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-4 left-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {featured.category}
                    </span>
                  </div>
                  <div className="md:col-span-5 p-8 space-y-4">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {featured.date}</span>
                      <span className="flex items-center gap-1"><User size={14} /> {featured.author}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground leading-snug">{featured.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{featured.summary}</p>
                    <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-2">
                      Read Article <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Articles List & Sidebar */}
            <div className="grid lg:grid-cols-12 gap-8 mb-16">
              {/* Articles Grid */}
              <div className="lg:col-span-8 space-y-8">
                <h2 className="text-2xl font-bold text-foreground">Latest Articles</h2>
                
                {currentPosts.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {currentPosts.map((art) => (
                      <Card key={art.id} className="border border-border bg-card overflow-hidden shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="h-44 overflow-hidden relative">
                            <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
                            <span className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                              {art.category}
                            </span>
                          </div>
                          <CardHeader className="p-5">
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
                              <span className="flex items-center gap-1"><Calendar size={12} /> {art.date}</span>
                              <span className="flex items-center gap-1"><User size={12} /> {art.author}</span>
                            </div>
                            <CardTitle className="text-lg font-bold text-foreground leading-snug line-clamp-2">{art.title}</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                              {art.summary}
                            </CardDescription>
                          </CardHeader>
                        </div>
                        <div className="px-5 pb-5 pt-0">
                          <button className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-2">
                            Read More <ArrowRight size={12} />
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-border rounded-xl bg-card">
                    <BookOpen className="text-muted-foreground/40 mx-auto w-12 h-12 mb-2" />
                    <p className="font-bold text-foreground">No articles found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try resetting the filters or modifying your query.</p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="btn-press"
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-muted-foreground font-semibold px-2">Page {currentPage} of {totalPages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="btn-press"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>

              {/* Sidebar / Popular Posts */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="border border-border bg-card p-6 shadow-sm">
                  <h3 className="font-bold text-foreground text-lg mb-4 border-b pb-2">Popular Posts</h3>
                  <div className="space-y-4">
                    {articles.slice(0, 3).map((art) => (
                      <div key={art.id} className="space-y-1 block cursor-pointer group">
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">{art.category}</span>
                        <h4 className="font-semibold text-sm text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight line-clamp-2">
                          {art.title}
                        </h4>
                        <span className="text-[10px] text-muted-foreground block">{art.date}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
