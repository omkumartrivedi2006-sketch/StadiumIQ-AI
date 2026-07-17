import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock } from "lucide-react";
import { toast } from "sonner";

export function InactivityHandler() {
  const { user, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(30); // 30 seconds countdown warning
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 15 minutes total: Warning starts after 14 minutes and 30 seconds
  const INACTIVITY_LIMIT = 14.5 * 60 * 1000; // 14m 30s
  const WARNING_DURATION = 30; // 30 seconds

  const resetTimers = () => {
    if (!user) return;

    // Clear existing timers
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setShowWarning(false);
    setCountdown(WARNING_DURATION);

    // Set new warning timer
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
    }, INACTIVITY_LIMIT);
  };

  const startCountdown = () => {
    // Set logout timer
    logoutTimerRef.current = setTimeout(() => {
      logoutUser();
    }, WARNING_DURATION * 1000);

    // Countdown interval
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const logoutUser = () => {
    cleanup();
    logout();
    toast.error("Logged out due to inactivity", {
      description: "Please log in again to access your dashboard.",
    });
  };

  const cleanup = () => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  useEffect(() => {
    if (!user) {
      cleanup();
      return;
    }

    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    const handleActivity = () => {
      if (!showWarning) {
        resetTimers();
      }
    };

    events.forEach((event) => window.addEventListener(event, handleActivity));
    resetTimers();

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      cleanup();
    };
  }, [user, showWarning]);

  const handleKeepSession = () => {
    resetTimers();
    toast.success("Session extended successfully!");
  };

  if (!user || !showWarning) return null;

  return (
    <Dialog open={showWarning} onOpenChange={(open) => { if (!open) handleKeepSession(); }}>
      <DialogContent className="max-w-md w-full bg-white border border-slate-200 shadow-2xl rounded-xl">
        <DialogHeader className="flex flex-row items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
            <AlertTriangle size={24} />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold text-slate-900">Inactivity Warning</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">Are you still there?</DialogDescription>
          </div>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <p className="text-sm text-slate-600 leading-normal">
            Your StadiumIQ session has been inactive. For your security, you will be automatically signed out in:
          </p>
          <div className="flex items-center gap-2 justify-center py-3 bg-slate-50 border border-slate-100 rounded-lg">
            <Clock size={20} className="text-indigo-600 animate-pulse" />
            <span className="text-2xl font-mono font-bold text-slate-800">
              00:{countdown < 10 ? `0${countdown}` : countdown}
            </span>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={logoutUser}
            className="btn-press border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Sign Out
          </Button>
          <Button
            type="button"
            onClick={handleKeepSession}
            className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            Keep Me Signed In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
