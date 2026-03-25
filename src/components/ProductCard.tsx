import { Loader2, Sparkles, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import { cn } from "@/lib/utils";
import { ObjectItem, manifestations } from "@/data/mock";

interface InProgressProduct {
  name: string;
  startedAt: number;
  progress: number;
  done: boolean;
}

export function ProductCard({ item, onClick }: { item: ObjectItem; onClick: () => void }) {
  const itemManifestations = manifestations.filter(m => m.objectId === item.id);
  const totalRisks = itemManifestations.length;
  const highRisks = itemManifestations.filter(m => m.level === "high").length;
  const needsAttention = item.status === "stale" || item.status === "none" || highRisks > 0;

  const statusConfig: Record<string, { label: string; className: string }> = {
    actual: { label: "Актуально", className: "bg-[hsl(var(--status-active-bg))] text-[hsl(var(--status-active))]" },
    stale: { label: "Требует внимания", className: "bg-[hsl(var(--risk-medium-bg))] text-[hsl(var(--risk-medium))]" },
    progress: { label: "В работе", className: "bg-[hsl(var(--status-progress-bg))] text-[hsl(var(--status-progress))]" },
    none: { label: "Требует внимания", className: "bg-[hsl(var(--risk-medium-bg))] text-[hsl(var(--risk-medium))]" },
  };

  const s = statusConfig[item.status] || statusConfig.none;

  const activityHint = item.status === "progress"
    ? "Анализируется"
    : highRisks > 0
      ? `Обнаружены высокие риски (${highRisks})`
      : item.status === "stale"
        ? "Оценка устарела"
        : "Оценка завершена";

  return (
    <div
      onClick={onClick}
      className={cn(
        "group rounded-xl border bg-card p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        needsAttention && item.status !== "progress"
          ? "border-[hsl(var(--risk-medium)/0.3)]"
          : "border-border"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-[hsl(var(--brand-green))] transition-colors">
            {item.name}
          </h3>
        </div>
        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ml-2", s.className)}>
          {s.label}
        </span>
      </div>

      {totalRisks > 0 ? (
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Риски:</span>
            <span className="text-xs font-semibold text-foreground">{totalRisks}</span>
          </div>
          {highRisks > 0 && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3 text-[hsl(var(--risk-high))]" />
              <span className="text-xs font-semibold text-[hsl(var(--risk-high))]">
                Высокие: {highRisks}
              </span>
            </div>
          )}
          <RiskBadge level={item.riskLevel} className="ml-auto text-[10px] px-2 py-0" />
        </div>
      ) : (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-xs text-muted-foreground">Риски не обнаружены</span>
          <RiskBadge level={item.riskLevel} className="ml-auto text-[10px] px-2 py-0" />
        </div>
      )}

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
        {item.lastAssessment && (
          <span>Оценка: {item.lastAssessment}</span>
        )}
      </div>

      <div className="flex items-center gap-1.5 pt-2 border-t border-border">
        {highRisks > 0 ? (
          <AlertTriangle className="h-3 w-3 text-[hsl(var(--risk-high))] shrink-0" />
        ) : item.status === "actual" ? (
          <CheckCircle2 className="h-3 w-3 text-[hsl(var(--status-active))] shrink-0" />
        ) : (
          <Sparkles className="h-3 w-3 text-[hsl(var(--status-progress))] shrink-0" />
        )}
        <span className="text-[11px] text-muted-foreground truncate">{activityHint}</span>
        <ArrowRight className="h-3 w-3 text-muted-foreground/50 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

export function InProgressProductCard({
  product,
  onClick,
}: {
  product: InProgressProduct;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="rounded-xl border border-[hsl(var(--status-progress)/0.3)] bg-card p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[hsl(var(--status-progress-bg))] flex items-center justify-center shrink-0">
            {product.done ? (
              <Sparkles className="h-4 w-4 text-[hsl(var(--brand-green))]" />
            ) : (
              <Loader2 className="h-4 w-4 text-[hsl(var(--status-progress))] animate-spin" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">{product.name}</h3>
          </div>
        </div>
        {product.done ? (
          <span className="inline-flex items-center rounded-full bg-[hsl(var(--brand-green-bg))] text-[hsl(var(--brand-green))] px-2 py-0.5 text-[10px] font-medium shrink-0">
            Готово
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-[hsl(var(--status-progress-bg))] text-[hsl(var(--status-progress))] px-2 py-0.5 text-[10px] font-medium shrink-0">
            В работе
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        {product.done
          ? "Оценка завершена — откройте для просмотра"
          : "AI анализирует документы"}
      </p>

      {!product.done && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-[hsl(var(--status-progress))] transition-all duration-700 ease-out"
              style={{ width: `${product.progress}%` }}
            />
          </div>
          <span className="text-[11px] text-muted-foreground tabular-nums w-8 text-right">
            {Math.round(product.progress)}%
          </span>
        </div>
      )}
    </div>
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
