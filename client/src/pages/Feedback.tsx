import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, MessageSquare, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Feedback() {
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState("app");
  const [feedbackText, setFeedbackText] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate recording feedback
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccess(true);
      toast.success("Feedback submitted successfully. Thank you!");
      setFeedbackText("");
      setRating(5);
    } catch (err) {
      toast.error("Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <div className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="mb-10 text-center animate-slide-in-down">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Share Feedback</h1>
            <p className="text-slate-600">
              Help us improve StadiumIQ AI for FIFA World Cup 2026.
            </p>
          </div>

          <Card className="shadow border border-slate-200 bg-white animate-slide-in-up">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                <MessageSquare size={20} />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Feedback Form</CardTitle>
                <CardDescription>We value your ideas, reports, and overall rating.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Feedback Submitted!</h3>
                  <p className="text-sm text-slate-600">
                    Thank you for helping us optimize stadium management. Your comments have been recorded.
                  </p>
                  <Button onClick={() => setSuccess(false)} variant="outline" className="btn-press">
                    Submit More Feedback
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Rating Selector */}
                  <div className="space-y-2 text-center">
                    <label className="text-sm font-semibold text-slate-700 block">Overall Rating</label>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          disabled={loading}
                          className="btn-press focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            size={32}
                            className={`${
                              star <= rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={loading}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 btn-press"
                    >
                      <option value="app">App Features & AI Chatbot</option>
                      <option value="crowd">Crowd & Queue Information</option>
                      <option value="food">Food Stall Options & Ordering</option>
                      <option value="transport">Transportation Guidance</option>
                      <option value="accessibility">Accessibility Accommodations</option>
                      <option value="other">Other / Support Needed</option>
                    </select>
                  </div>

                  {/* Comments */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Your Feedback</label>
                    <Textarea
                      placeholder="Write your suggestions, report issues, or tell us what went well..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      required
                      disabled={loading}
                      className="min-h-[150px] btn-press"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {loading ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
