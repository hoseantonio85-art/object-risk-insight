import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Plus, Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RiskBadge } from "@/components/RiskBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { useModalStack } from "@/contexts/ModalStackContext";
import { ProductEvaluationModal } from "@/components/ProductEvaluationModal";
import { getObjectsByType, ObjectType, RiskLevel, AssessmentStatus } from "@/data/mock";

const riskOptions: { value: RiskLevel | "all"; label: string }[] = [
  { value: "all", label: "Все уровни" },
  { value: "high", label: "Высокий" },
  { value: "medium", label: "Средний" },
  { value: "low", label: "Низкий" },
];

const statusOptions: { value: AssessmentStatus | "all"; label: string }[] = [
  { value: "all", label: "Все статусы" },
  { value: "actual", label: "Актуально" },
  { value: "progress", label: "В работе" },
  { value: "stale", label: "Устарело" },
  { value: "none", label: "Нет оценки" },
];

const typeConfig: Record<ObjectType, { title: string }> = {
  product: { title: "Продукты" },
  counterparty: { title: "Контрагенты" },
  contract: { title: "Договоры" },
  "ai-agent": { title: "AI-агенты" },
};

interface InProgressProduct {
  name: string;
  startedAt: number;
  progress: number;
  done: boolean;
}

export default function ObjectList({ objectType }: { objectType: ObjectType }) {
  const { openObject } = useModalStack();
  const [searchParams] = useSearchParams();
  const initialRisk = (searchParams.get("risk") as RiskLevel) || "all";

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">(initialRisk);
  const [statusFilter, setStatusFilter] = useState<AssessmentStatus | "all">("all");
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [inProgress, setInProgress] = useState<InProgressProduct[]>([]);

  // Simulate progress
  useEffect(() => {
    const interval = setInterval(() => {
      setInProgress(prev =>
        prev.map(p => {
          if (p.done) return p;
          const next = Math.min(p.progress + Math.random() * 8 + 2, 100);
          return { ...p, progress: next, done: next >= 100 };
        })
      );
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleEvaluationStarted = (productName: string) => {
    setInProgress(prev => [...prev, { name: productName, startedAt: Date.now(), progress: 5, done: false }]);
  };

  const items = useMemo(() => {
    let list = getObjectsByType(objectType);
    if (riskFilter !== "all") list = list.filter((o) => o.riskLevel === riskFilter);
    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);
    if (search) list = list.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [objectType, riskFilter, statusFilter, search]);

  const config = typeConfig[objectType];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">{config.title}</h1>
        {objectType === "product" && (
          <button
            onClick={() => setShowEvalModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-foreground text-background px-4 py-2.5 text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Оценить продукт
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 animate-fade-up stagger-1">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Поиск…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value as any)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          {riskOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* In-progress cards */}
      {inProgress.length > 0 && (
        <div className="space-y-2 animate-fade-up stagger-2">
          {inProgress.map((p, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow cursor-default"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[hsl(270_60%_95%)] flex items-center justify-center shrink-0">
                    {p.done ? (
                      <Sparkles className="h-4 w-4 text-[hsl(270_60%_50%)]" />
                    ) : (
                      <Loader2 className="h-4 w-4 text-[hsl(var(--status-progress))] animate-spin" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.done ? "Оценка завершена — откройте для просмотра" : "AI анализирует документы"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.done ? (
                    <span className="inline-flex items-center rounded-full bg-[hsl(var(--status-active-bg))] text-[hsl(var(--status-active))] px-2.5 py-0.5 text-xs font-medium">
                      Готово
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-[hsl(var(--status-progress-bg))] text-[hsl(var(--status-progress))] px-2.5 py-0.5 text-xs font-medium">
                      Анализируется
                    </span>
                  )}
                </div>
              </div>
              {!p.done && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[hsl(var(--status-progress))] transition-all duration-700 ease-out"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">
                    {Math.round(p.progress)}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden animate-fade-up stagger-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Название</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Уровень риска</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Статус</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Последняя оценка</th>
            </tr>
          </thead>
          <tbody>
            {items.map((obj) => (
              <tr key={obj.id} onClick={() => openObject(obj.id)}
                className="border-b border-border last:border-0 cursor-pointer hover:bg-accent/50 transition-colors active:scale-[0.998]">
                <td className="px-4 py-3 font-medium text-foreground">{obj.name}</td>
                <td className="px-4 py-3"><RiskBadge level={obj.riskLevel} /></td>
                <td className="px-4 py-3"><StatusBadge status={obj.status} /></td>
                <td className="px-4 py-3 text-muted-foreground tabular-nums">{obj.lastAssessment ?? "—"}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Ничего не найдено</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Evaluation Modal */}
      {showEvalModal && (
        <ProductEvaluationModal
          onClose={() => setShowEvalModal(false)}
          onStarted={handleEvaluationStarted}
          zIndex={60}
        />
      )}
    </div>
  );
}
