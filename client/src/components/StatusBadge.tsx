import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "live" | "caution" | "unavailable";
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const statusColors = {
    live: "bg-green-500",
    caution: "bg-amber-500",
    unavailable: "bg-red-500",
  };

  return (
    <div className={cn("status-live", className)}>
      <div className={cn("status-dot pulse", statusColors[status])} />
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </div>
  );
}
