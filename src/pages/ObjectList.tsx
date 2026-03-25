import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Plus, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RiskBadge } from "@/components/RiskBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { useModalStack } from "@/contexts/ModalStackContext";
import { ProductEvaluationModal, type ProductEvaluationStartPayload } from "@/components/ProductEvaluationModal";
import { InProgressProductModal } from "@/components/InProgressProductModal";
import { ProductCard } from "@/components/ProductCard";
import { DetectedProductCard } from "@/components/DetectedProductCard";
import { DetectedProductModal } from "@/components/DetectedProductModal";
import { getObjectsByType, ObjectType, RiskLevel, AssessmentStatus, manifestations, objects, assessmentHistory, type EvaluationStatus } from "@/data/mock";
import { detectedProducts as initialDetectedProducts, type DetectedProduct } from "@/data/detectedProducts";
import { cn } from "@/lib/utils";

const riskOptions: { value: RiskLevel | "all"; label: string }[] = [
  { value: "all", label: "Все уровни" },
  { value: "high", label: "Высокий" },
  { value: "medium", label: "Средний" },
  { value: "low", label: "Низкий" },
];

const evalStatusOptions: { value: EvaluationStatus | "all"; label: string }[] = [
  { value: "all", label: "Все статусы" },
  { value: "actual", label: "Актуально" },
  { value: "needs-review", label: "Требует проверки" },
  { value: "ai-analysis", label: "AI анализ" },
  { value: "none", label: "Нет оценки" },
];

const typeConfig: Record<ObjectType, { title: string }> = {
  product: { title: "Продукты" },
  counterparty: { title: "Контрагенты" },
  contract: { title: "Договоры" },
  "ai-agent": { title: "AI-агенты" },
};

type QuickFilter = "all" | "needs-review" | "high-risk" | "needs-action";

const quickFilters: { value: QuickFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "needs-review", label: "Требует проверки" },
  { value: "high-risk", label: "Высокий риск" },
  { value: "needs-action", label: "Требует внимания" },
];

interface InProgressProduct {
  id: string;
  name: string;
  startedAt: number;
  progress: number;
  done: boolean;
  lifecycle?: string;
  launchDate?: string;
  documents: Array<{ name: string; sizeKb: number }>;
  generatedManifestations: Array<{ riskId: string; level: RiskLevel; comment: string }>;
}

const generateProductId = () => `np-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const createGeneratedManifestations = (productName: string): InProgressProduct["generatedManifestations"] => [
  {
    riskId: "br1",
    level: "high",
    comment: `В продукте «${productName}» обнаружено подключение услуги без явного согласия клиента`,
  },
  {
    riskId: "r3",
    level: "high",
    comment: `Для продукта «${productName}» выявлены признаки несоответствия регуляторным требованиям`,
  },
  {
    riskId: "br2",
    level: "medium",
    comment: `В материалах по «${productName}» недостаточно прозрачно раскрыты условия тарифа`,
  },
];

const getAggregateRiskLevel = (items: InProgressProduct["generatedManifestations"]): RiskLevel => {
  if (items.some((item) => item.level === "high")) return "high";
  if (items.some((item) => item.level === "medium")) return "medium";
  if (items.some((item) => item.level === "low")) return "low";
  return "none";
};

export default function ObjectList({ objectType }: { objectType: ObjectType }) {
  const { openObject } = useModalStack();
  const [searchParams] = useSearchParams();
  const initialRisk = (searchParams.get("risk") as RiskLevel) || "all";

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">(initialRisk);
  const [evalFilter, setEvalFilter] = useState<EvaluationStatus | "all">("all");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [inProgress, setInProgress] = useState<InProgressProduct[]>([]);
  const [activeAnalyzing, setActiveAnalyzing] = useState<InProgressProduct | null>(null);
  const [detected, setDetected] = useState<DetectedProduct[]>(initialDetectedProducts);
  const [activeDetected, setActiveDetected] = useState<DetectedProduct | null>(null);
  const finalizedProductIds = useRef<Set<string>>(new Set());

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

  const handleEvaluationStarted = (payload: ProductEvaluationStartPayload) => {
    const createdId = generateProductId();
    const productName = payload.productName;

    setInProgress((prev) => [
      ...prev,
      {
        id: createdId,
        name: productName,
        startedAt: Date.now(),
        progress: 5,
        done: false,
        lifecycle: payload.lifecycle,
        launchDate: payload.launchDate,
        documents: payload.files,
        generatedManifestations: createGeneratedManifestations(productName),
      },
    ]);
  };

  useEffect(() => {
    const completed = inProgress.filter((item) => item.done && !finalizedProductIds.current.has(item.id));
    if (completed.length === 0) return;

    const today = new Date().toISOString().slice(0, 10);

    completed.forEach((item) => {
      finalizedProductIds.current.add(item.id);
      if (!objects.some((obj) => obj.id === item.id)) {
        const aggregateLevel = getAggregateRiskLevel(item.generatedManifestations);

        objects.unshift({
          id: item.id,
          name: item.name,
          type: "product",
          riskLevel: aggregateLevel,
          status: "progress",
          lastAssessment: today,
          description: `Оценка продукта «${item.name}» завершена и ожидает подтверждения`,
          lifecycle: "active",
          evaluationStatus: "needs-review",
        });

        item.generatedManifestations.forEach((manifestation) => {
          manifestations.unshift({
            riskId: manifestation.riskId,
            objectId: item.id,
            level: manifestation.level,
            comment: manifestation.comment,
          });
        });

        assessmentHistory[item.id] = [
          { date: today, type: "AI", level: aggregateLevel },
        ];
      }
    });

    const completedIds = new Set(completed.map((item) => item.id));
    setInProgress((prev) => prev.filter((item) => !completedIds.has(item.id)));
    setActiveAnalyzing((prev) => (prev && completedIds.has(prev.id) ? null : prev));
  }, [inProgress]);

  const items = useMemo(() => {
    let list = getObjectsByType(objectType);
    if (riskFilter !== "all") list = list.filter((o) => o.riskLevel === riskFilter);
    if (evalFilter !== "all") list = list.filter((o) => o.evaluationStatus === evalFilter);
    if (search) list = list.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()));

    // Apply quick filters for products
    if (objectType === "product" && quickFilter !== "all") {
      if (quickFilter === "needs-review") {
        list = list.filter(o => o.evaluationStatus === "needs-review");
      } else if (quickFilter === "high-risk") {
        list = list.filter(o => o.riskLevel === "high");
      } else if (quickFilter === "needs-action") {
        list = list.filter(o => {
          const highManifestations = manifestations.filter(m => m.objectId === o.id && m.level === "high").length;
          return o.evaluationStatus === "needs-review" || highManifestations > 0;
        });
      }
    }

    return list;
  }, [objectType, riskFilter, evalFilter, search, quickFilter, inProgress]);

  const config = typeConfig[objectType];
  const isProductView = objectType === "product";

  // For non-product types, keep the table layout
  if (!isProductView) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between animate-fade-up">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">{config.title}</h1>
        </div>

        <div className="flex items-center gap-3 animate-fade-up stagger-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Поиск…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value as any)}
            className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            {riskOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={evalFilter} onChange={(e) => setEvalFilter(e.target.value as any)}
            className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            {evalStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

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
      </div>
    );
  }

  // Product card-based layout
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">{config.title}</h1>
        <button
          onClick={() => setShowEvalModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--brand-green))] text-[hsl(var(--brand-green-foreground))] px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Оценить продукт
        </button>
      </div>

      {/* Detected products (stories) */}
      {detected.length > 0 && (
        <div className="animate-fade-up stagger-1">
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles className="h-4 w-4 text-[hsl(var(--brand-green))]" />
            <span className="text-sm font-medium text-foreground">Обнаружены продукты</span>
          </div>
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {detected.map((dp) => (
              <DetectedProductCard
                key={dp.id}
                product={dp}
                onClick={() => setActiveDetected(dp)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick filter chips + search */}
      <div className="flex items-center gap-3 flex-wrap animate-fade-up stagger-1">
        <div className="flex items-center gap-1.5">
          {quickFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setQuickFilter(f.value)}
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                quickFilter === f.value
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Поиск…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
      </div>

      {/* All product cards in one grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-up stagger-2">
        {inProgress.map((p, i) => (
          <ProductCard
            key={p.id}
            inProgressName={p.name}
            inProgressProgress={p.progress}
            inProgressDone={p.done}
            onClick={() => {
              if (p.done) {
                openObject(p.id);
              } else {
                setActiveAnalyzing(p);
              }
            }}
          />
        ))}
        {items.map((obj) => (
          <ProductCard key={obj.id} item={obj} onClick={() => openObject(obj.id)} />
        ))}
      </div>

      {items.length === 0 && inProgress.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Ничего не найдено
        </div>
      )}

      {/* Evaluation Modal */}
      {showEvalModal && (
        <ProductEvaluationModal
          onClose={() => setShowEvalModal(false)}
          onStarted={handleEvaluationStarted}
          zIndex={60}
        />
      )}

      {/* In-progress analyzing modal */}
      {activeAnalyzing && (
        <InProgressProductModal
          product={activeAnalyzing}
          onClose={() => setActiveAnalyzing(null)}
          zIndex={60}
        />
      )}

      {/* Detected product modal */}
      {activeDetected && (
        <DetectedProductModal
          product={activeDetected}
          onClose={() => setActiveDetected(null)}
          onLinked={(detectedId, existingId) => {
            const objIdx = objects.findIndex(o => o.id === existingId);
            if (objIdx !== -1) {
              objects[objIdx].evaluationStatus = "none";
              objects[objIdx].status = "none";
              objects[objIdx].riskLevel = "none";
            }
            setDetected((prev) => prev.filter((d) => d.id !== detectedId));
            setActiveDetected(null);
            openObject(existingId);
          }}
          onContinueAsNew={(detectedId) => {
            const dp = detected.find((d) => d.id === detectedId);
            if (dp) {
              const newId = generateProductId();
              objects.unshift({
                id: newId,
                name: dp.name,
                type: "product",
                riskLevel: "none",
                status: "none",
                lastAssessment: null,
                lifecycle: dp.lifecycle,
                evaluationStatus: "none",
              });
              setDetected((prev) => prev.filter((d) => d.id !== detectedId));
              setActiveDetected(null);
              openObject(newId);
            }
          }}
          zIndex={60}
        />
      )}

      </div>
  );
}
