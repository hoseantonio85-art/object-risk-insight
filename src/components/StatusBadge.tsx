import { cn } from "@/lib/utils";

type Status = "actual" | "stale" | "progress" | "none" | "ai-analysis" | "needs-review";

const config: Record<Status, { label: string; className: string }> = {
  actual: { label: "Актуально", className: "bg-[hsl(var(--status-active-bg))] text-[hsl(var(--status-active))]" },
  stale: { label: "Устарело", className: "bg-[hsl(var(--status-stale-bg))] text-[hsl(var(--status-stale))]" },
  progress: { label: "В работе", className: "bg-[hsl(var(--status-progress-bg))] text-[hsl(var(--status-progress))]" },
  none: { label: "Нет оценки", className: "bg-[hsl(var(--status-none-bg))] text-[hsl(var(--status-none))]" },
  "ai-analysis": { label: "AI анализ", className: "bg-[hsl(var(--status-progress-bg))] text-[hsl(var(--status-progress))]" },
  "needs-review": { label: "Требует проверки", className: "bg-[hsl(var(--risk-medium-bg))] text-[hsl(var(--risk-medium))]" },
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const c = config[status] || config.none;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", c.className, className)}>
      {c.label}
    </span>
  );
}
