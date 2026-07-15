import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  cta?: string;
  onClick?: () => void;
  className?: string;
  gradient?: boolean;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  cta,
  onClick,
  className,
  gradient = false,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "card-hover p-6 rounded-lg border border-slate-200 bg-white",
        gradient && "bg-gradient-to-br from-slate-50 to-white",
        className
      )}
    >
      <div className="mb-4">
        <Icon className="w-8 h-8 text-indigo-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-4">{description}</p>
      {cta && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClick}
          className="btn-press"
        >
          {cta}
        </Button>
      )}
    </div>
  );
}
