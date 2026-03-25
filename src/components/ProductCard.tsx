import { Loader2, Sparkles, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ObjectItem, manifestations } from "@/data/mock";

interface ProductCardProps {
  item?: ObjectItem;
  /** For in-progress products without a real ObjectItem */
  inProgressName?: string;
  inProgressProgress?: number;
  inProgressDone?: boolean;
  onClick: () => void;
}

export function ProductCard({ item, inProgressName, inProgressProgress = 0, inProgressDone = false, onClick }: ProductCardProps) {
  const isInProgress = !item;
  const isAnalyzing = isInProgress && !inProgressDone;
  const isReady = isInProgress && inProgressDone;

  // For real items
  const itemManifestations = item ? manifestations.filter(m => m.objectId === item.id) : [];
  const totalRisks = item ? itemManifestations.length : 0;
  const highRisks = item ? itemManifestations.filter(m => m.level === "high").length : 0;

  // Determine status
  let statusLabel: string;
  let statusClassName: string;
  let needsAttention = false;

  if (isAnalyzing) {
    statusLabel = "AI анализ";
    statusClassName = "bg-[hsl(var(--status-progress-bg))] text-[hsl(var(--status-progress))]";
  } else if (isReady) {
    statusLabel = "В работе";
    statusClassName = "bg-[hsl(var(--brand-green-bg))] text-[hsl(var(--brand-green))]";
    needsAttention = true;
  } else if (item) {
    const statusConfig: Record<string, { label: string; className: string }> = {
      actual: { label: "Актуально", className: "bg-[hsl(var(--status-active-bg))] text-[hsl(var(--status-active))]" },
      stale: { label: "Требует внимания", className: "bg-[hsl(var(--risk-medium-bg))] text-[hsl(var(--risk-medium))]" },
      progress: { label: "В работе", className: "bg-[hsl(var(--status-progress-bg))] text-[hsl(var(--status-progress))]" },
      none: { label: "Требует внимания", className: "bg-[hsl(var(--risk-medium-bg))] text-[hsl(var(--risk-medium))]" },
    };
    const s = statusConfig[item.status] || statusConfig.none;
    statusLabel = s.label;
    statusClassName = s.className;
    needsAttention = item.status === "stale" || item.status === "none" || highRisks > 0;
  } else {
    statusLabel = "";
    statusClassName = "";
  }

  // Activity hint
  let activityHint: string;
  if (isAnalyzing) {
    activityHint = "Идёт анализ документов";
  } else if (isReady) {
    activityHint = "Анализ завершён — проверьте результаты";
  } else if (item) {
    activityHint = item.status === "progress"
      ? "Анализируется"
      : highRisks > 0
        ? `Обнаружены высокие риски (${highRisks})`
        : item.status === "stale"
          ? "Оценка устарела"
          : "Оценка завершена";
  } else {
    activityHint = "";
  }

  const name = item?.name || inProgressName || "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full rounded-xl border bg-card p-4 text-left cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isAnalyzing
          ? "border-[hsl(var(--status-progress)/0.3)] opacity-90"
          : needsAttention && !isReady
            ? "border-[hsl(var(--risk-medium)/0.3)]"
            : isReady
              ? "border-[hsl(var(--brand-green)/0.3)]"
              : "border-border"
      )}
    >
      {/* Header: name + status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-[hsl(var(--brand-green))] transition-colors">
            {name}
          </h3>
        </div>
        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ml-2", statusClassName)}>
          {statusLabel}
        </span>
      </div>

      {/* Risks block */}
      {isAnalyzing ? (
        <div className="mb-3 space-y-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      ) : totalRisks > 0 || isReady ? (
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Риски:</span>
            <span className="text-xs font-semibold text-foreground">{isReady ? "—" : totalRisks}</span>
          </div>
          {highRisks > 0 && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3 text-[hsl(var(--risk-high))]" />
              <span className="text-xs font-semibold text-[hsl(var(--risk-high))]">
                Высокие: {highRisks}
              </span>
            </div>
          )}
          {item && <RiskBadge level={item.riskLevel} className="ml-auto text-[10px] px-2 py-0" />}
          {isReady && (
            <span className="text-[10px] text-muted-foreground ml-auto">Требует решения</span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-xs text-muted-foreground">Риски не обнаружены</span>
          {item && <RiskBadge level={item.riskLevel} className="ml-auto text-[10px] px-2 py-0" />}
        </div>
      )}

      {/* Progress bar for analyzing state */}
      {isAnalyzing && (
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-[hsl(var(--status-progress))] transition-all duration-700 ease-out"
              style={{ width: `${inProgressProgress}%` }}
            />
          </div>
          <span className="text-[11px] text-muted-foreground tabular-nums w-8 text-right">
            {Math.round(inProgressProgress)}%
          </span>
        </div>
      )}

      {/* Last assessment date */}
      {item?.lastAssessment && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
          <span>Оценка: {item.lastAssessment}</span>
        </div>
      )}

      {/* Footer: activity hint */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-border">
        {isAnalyzing ? (
          <Loader2 className="h-3 w-3 text-[hsl(var(--status-progress))] animate-spin shrink-0" />
        ) : highRisks > 0 ? (
          <AlertTriangle className="h-3 w-3 text-[hsl(var(--risk-high))] shrink-0" />
        ) : (item?.status === "actual" || isReady) ? (
          <CheckCircle2 className="h-3 w-3 text-[hsl(var(--status-active))] shrink-0" />
        ) : (
          <Sparkles className="h-3 w-3 text-[hsl(var(--status-progress))] shrink-0" />
        )}
        <span className="text-[11px] text-muted-foreground truncate">{activityHint}</span>
        <ArrowRight className="h-3 w-3 text-muted-foreground/50 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}

export function DiscoveredProductPill({ name, onClick }: { name: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--brand-green)/0.25)] bg-[hsl(var(--brand-green-bg))] px-3 py-2 shrink-0 hover:shadow-sm transition-all hover:border-[hsl(var(--brand-green)/0.5)]"
    >
      <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand-green))]" />
      <span className="text-xs font-medium text-foreground whitespace-nowrap">{name}</span>
      <span className="text-[10px] text-[hsl(var(--brand-green))] font-medium">Обнаружен</span>
    </button>
  );
}
