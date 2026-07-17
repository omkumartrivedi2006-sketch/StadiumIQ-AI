import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { WifiOff, Calendar, Ticket, MessageSquare, RefreshCw } from "lucide-react";

export default function Offline() {
  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.href = "/dashboard";
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <div className="flex-1 flex items-center justify-center pt-24 pb-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-6 animate-scale-in">
          {/* Visual Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center animate-pulse">
              <WifiOff size={36} />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">You're Offline</h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              We couldn't connect to StadiumIQ servers. Don't worry! You still have access to key offline features.
            </p>
          </div>

          {/* Cached Features List */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-left space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Available Offline Features
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
                <Ticket size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">Saved Tickets</p>
                <p className="text-[10px] text-slate-500">Access and view your booked seating and gates.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <MessageSquare size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">AI Assistant History</p>
                <p className="text-[10px] text-slate-500">Read previous conversations and stadium advice.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">Matches Cache</p>
                <p className="text-[10px] text-slate-500">View static match fixture updates.</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleRetry}
              className="w-full btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} className="animate-spin-slow" />
              Check Connection Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
