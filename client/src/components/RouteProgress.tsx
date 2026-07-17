import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export function RouteProgress() {
  const [location] = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(30);

    const timer1 = setTimeout(() => {
      setProgress(70);
    }, 100);

    const timer2 = setTimeout(() => {
      setProgress(100);
    }, 300);

    const timer3 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 550);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location]);

  if (!visible) return null;

  return (
    <div
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 right-0 h-1 z-[9999] bg-slate-100 overflow-hidden"
    >
      <div
        className="h-full bg-gradient-to-r from-indigo-600 to-cyan-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
