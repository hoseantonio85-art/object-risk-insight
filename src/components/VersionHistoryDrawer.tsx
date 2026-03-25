import { X, Clock, Target, AlertTriangle, ArrowRight } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import type { RiskLevel } from "@/data/mock";
import { cn } from "@/lib/utils";

export interface ProductVersion {
  version: number;
  date: string;
  evaluationStatus: "ai-analysis" | "needs-review" | "actual";
  riskLevel: RiskLevel;
  totalRisks: number;
  highRisks: number;
  summary: string;
  trigger: "documents" | "reassessment" | "law" | "news" | "ai";
}

const triggerLabels: Record<ProductVersion["trigger"], string> = {
  documents: "Документы",
  reassessment: "Переоценка",
  law: "Закон",
  news: "Новость",
  ai: "AI",
};

const triggerStyles: Record<ProductVersion["trigger"], string> = {
  documents: "bg-muted text-muted-foreground",
  reassessment: "bg-[hsl(var(--status-progress-bg))] text-[hsl(var(--status-progress))]",
  law: "bg-[hsl(var(--risk-medium-bg))] text-[hsl(var(--risk-medium))]",
  news: "bg-[hsl(200_80%_93%)] text-[hsl(200_80%_35%)]",
  ai: "bg-[hsl(270_60%_95%)] text-[hsl(270_60%_40%)]",
};

const evalLabels: Record<string, string> = {
  "ai-analysis": "AI анализ",
  "needs-review": "Анализ завершён",
  actual: "Подтверждена",
};

const evalStyles: Record<string, string> = {
  "ai-analysis": "text-[hsl(var(--status-progress))]",
  "needs-review": "text-[hsl(var(--risk-medium))]",
  actual: "text-[hsl(var(--status-active))]",
};

interface VersionHistoryDrawerProps {
  versions: ProductVersion[];
  currentVersion: number;
  onClose: () => void;
  onSelectVersion: (version: ProductVersion) => void;
}

export function VersionHistoryDrawer({ versions, currentVersion, onClose, onSelectVersion }: VersionHistoryDrawerProps) {
  return (
    <>
      <div
        className="absolute inset-0 z-30 bg-black/20 rounded-2xl transition-opacity duration-200"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 bottom-0 z-40 w-[460px] bg-background border-l border-border rounded-r-2xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-muted-foreground">История версий</span>
              <p className="text-sm font-semibold text-foreground mt-0.5">{versions.length} версий</p>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Version list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          {versions.map((v) => {
            const isCurrent = v.version === currentVersion;
            return (
              <div
                key={v.version}
                className={cn(
                  "rounded-xl border bg-card p-4 transition-all",
                  isCurrent
                    ? "border-[hsl(var(--primary)/0.4)] shadow-sm"
                    : "border-border hover:border-[hsl(var(--primary)/0.2)] hover:shadow-sm"
                )}
              >
                {/* Top row: version + date + current badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">v{v.version}</span>
                    {isCurrent && (
                      <span className="inline-flex items-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-1.5 py-0.5 text-[10px] font-medium">
                        Текущая
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{v.date}</span>
                </div>

                {/* Risk level + counts */}
                <div className="flex items-center gap-2 mb-2">
                  <RiskBadge level={v.riskLevel} />
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {v.totalRisks}
                    </span>
                    {v.highRisks > 0 && (
                      <span className="inline-flex items-center gap-1 text-[hsl(var(--risk-high))]">
                        <AlertTriangle className="h-3 w-3" />
                        {v.highRisks}
                      </span>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <p className="text-xs text-muted-foreground leading-relaxed mb-2.5 line-clamp-2">
                  {v.summary}
                </p>

                {/* Bottom: trigger + status + action */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", triggerStyles[v.trigger])}>
                      {triggerLabels[v.trigger]}
                    </span>
                    <span className={cn("text-[10px] font-medium", evalStyles[v.evaluationStatus])}>
                      {evalLabels[v.evaluationStatus]}
                    </span>
                  </div>
                  {!isCurrent && (
                    <button
                      onClick={() => onSelectVersion(v)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[hsl(var(--primary))] hover:underline"
                    >
                      Открыть
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
