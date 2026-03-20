import { cn } from "@/lib/utils";

type RiskLevel = "high" | "medium" | "low" | "none";

const config: Record<RiskLevel, { label: string; className: string }> = {
  high: { label: "Высокий", className: "bg-risk-high-bg text-risk-high" },
  medium: { label: "Средний", className: "bg-risk-medium-bg text-risk-medium" },
  low: { label: "Низкий", className: "bg-risk-low-bg text-risk-low" },
  none: { label: "Нет данных", className: "bg-muted text-muted-foreground" },
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  const c = config[level];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", c.className, className)}>
      {c.label}
    </span>
  );
}
