import { Loader2, Sparkles, ArrowRight, CheckCircle2, FileText } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ObjectItem, manifestations, lifecycleLabels, type EvaluationStatus, type ProductLifecycle } from "@/data/mock";

interface ProductCardProps {
  item?: ObjectItem;
  inProgressName?: string;
  inProgressProgress?: number;
  inProgressDone?: boolean;
  onClick: () => void;
}

export function ProductCard({ item, inProgressName, inProgressProgress = 0, inProgressDone = false, onClick }: ProductCardProps) {
  const isInProgress = !item;
  const isAnalyzing = isInProgress && !inProgressDone;
  const isReady = isInProgress && inProgressDone;

  // Risks
  const totalRisks = item ? manifestations.filter(m => m.objectId === item.id).length : 0;

  // Lifecycle
  const lifecycle: ProductLifecycle = item?.lifecycle || "active";
  const lifecycleLabel = lifecycleLabels[lifecycle];

  const lifecycleStyleMap: Record<ProductLifecycle, string> = {
    planned: "bg-[hsl(var(--lifecycle-planned-bg))] text-[hsl(var(--lifecycle-planned))]",
    active: "bg-[hsl(var(--lifecycle-active-bg))] text-[hsl(var(--lifecycle-active))]",
    closed: "bg-[hsl(var(--lifecycle-closed-bg))] text-[hsl(var(--lifecycle-closed))]",
  };

  // Evaluation status
  let evalLabel: string;
  let evalIcon: React.ReactNode;

  if (isAnalyzing) {
    evalLabel = "AI анализ";
    evalIcon = <Loader2 className="h-3 w-3 text-[hsl(var(--status-progress))] animate-spin shrink-0" />;
  } else if (isReady) {
    evalLabel = "Анализ завершён";
    evalIcon = <Sparkles className="h-3 w-3 text-[hsl(var(--risk-medium))] shrink-0" />;
  } else if (item) {
    const status = item.evaluationStatus || "actual";
    const map: Record<EvaluationStatus, { label: string; icon: React.ReactNode }> = {
      "ai-analysis": {
        label: "AI анализ",
        icon: <Loader2 className="h-3 w-3 text-[hsl(var(--status-progress))] animate-spin shrink-0" />,
      },
      "needs-review": {
        label: "Анализ завершён",
        icon: <Sparkles className="h-3 w-3 text-[hsl(var(--risk-medium))] shrink-0" />,
      },
      actual: {
        label: "Оценка подтверждена",
        icon: <CheckCircle2 className="h-3 w-3 text-[hsl(var(--status-active))] shrink-0" />,
      },
      none: {
        label: "Нет оценки",
        icon: <FileText className="h-3 w-3 text-[hsl(var(--status-none))] shrink-0" />,
      },
    };
    evalLabel = map[status].label;
    evalIcon = map[status].icon;
  } else {
    evalLabel = "";
    evalIcon = null;
  }

  const name = item?.name || inProgressName || "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full rounded-xl border bg-card p-4 text-left cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isAnalyzing ? "border-[hsl(var(--status-progress)/0.3)] opacity-90" : "border-border"
      )}
    >
      {/* Row 1: lifecycle + risk level */}
      <div className="flex items-center justify-between mb-2.5">
        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", lifecycleStyleMap[lifecycle])}>
          {lifecycleLabel}
        </span>
        {item && item.riskLevel !== "none" && <RiskBadge level={item.riskLevel} className="text-[10px] px-2 py-0" />}
      </div>

      {/* Row 2: name */}
      <h3 className="text-sm font-semibold text-foreground truncate mb-2.5 group-hover:text-[hsl(var(--brand-green))] transition-colors">
        {name}
      </h3>

      {/* Row 3: risks count + date */}
      {isAnalyzing ? (
        <div className="mb-2.5 space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      ) : (
        <div className="flex items-center gap-4 mb-2.5 text-xs text-muted-foreground">
          <span>
            Риски: <span className="font-semibold text-foreground">{isReady ? "—" : totalRisks}</span>
          </span>
          {item?.lastAssessment && (
            <span className="tabular-nums">Оценка: {item.lastAssessment}</span>
          )}
        </div>
      )}

      {/* Progress bar for analyzing */}
      {isAnalyzing && (
        <div className="flex items-center gap-3 mb-2.5">
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

      {/* Row 4: evaluation status */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-border">
        {evalIcon}
        <span className="text-[11px] text-muted-foreground truncate">{evalLabel}</span>
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
