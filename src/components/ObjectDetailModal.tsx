import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, ChevronDown, Sparkles, Clock, Target,
  Scale, Newspaper, FileText, Bot, User, Info,
  Check, XCircle, ArrowRight, ChevronRight, ShieldAlert, Trash2, RotateCcw, CheckCircle2, Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { RiskBadge } from "@/components/RiskBadge";
import { Progress } from "@/components/ui/progress";
import { VersionHistoryDrawer, type ProductVersion } from "@/components/VersionHistoryDrawer";
import { ProductReEvaluationModal, type ReEvaluationStartPayload } from "@/components/ProductReEvaluationModal";
import {
  objects, getManifestationsForObject, assessmentHistory, typeLabels, riskTypeLabels,
  lifecycleLabels, evaluationStatusLabels, manifestations,
  type ObjectItem, type RiskLevel
} from "@/data/mock";
import { cn } from "@/lib/utils";

/* ─── Mock: AI summaries ─── */
const aiSummaries: Record<string, string> = {
  p1: "Продукт содержит 3 проявления рисков высокого уровня после изменений в законодательстве. Рекомендуется провести аудит мер защиты данных.",
  p2: "Мобильное приложение использует устаревший API. Высокий приоритет обновления протокола передачи данных.",
  p3: "Платёжный шлюз соответствует базовым требованиям. Рекомендуется улучшить SLA до 99.95%.",
  p5: "Data Lake имеет неконтролируемый доступ аналитиков к сырым данным. Необходимо внедрить ролевую модель доступа.",
  c1: "Поставщик имеет доступ к production-данным без NDA. Требуется немедленное подписание соглашения.",
  c3: "Консультант не знаком с современными фреймворками. Рекомендуется пересмотреть условия сотрудничества.",
  a2: "Скоринг-модель демонстрирует предвзятость по возрастному признаку. Требуется ретренинг на сбалансированной выборке.",
};

/* ─── Mock: Sources context ─── */
interface SourceItem {
  type: "law" | "news" | "document" | "ai-agent" | "manual";
  title: string;
  description: string;
  effect: string;
  date: string;
}

const sourceIcons: Record<SourceItem["type"], React.ElementType> = {
  law: Scale, news: Newspaper, document: FileText, "ai-agent": Bot, manual: User,
};
const sourceLabels: Record<SourceItem["type"], string> = {
  law: "Закон", news: "Новость", document: "Документ", "ai-agent": "AI агент", manual: "Ручная оценка",
};

/* ─── Mock: Product versions ─── */
const productVersions: Record<string, ProductVersion[]> = {
  p1: [
    { version: 3, date: "15.03.2026", evaluationStatus: "actual", riskLevel: "high", totalRisks: 5, highRisks: 3, summary: "Обнаружены 3 проявления рисков высокого уровня после изменений в законодательстве.", trigger: "law" },
    { version: 2, date: "10.01.2026", evaluationStatus: "actual", riskLevel: "medium", totalRisks: 3, highRisks: 1, summary: "Выявлена уязвимость в механизмах шифрования. Уровень риска повышен.", trigger: "ai" },
    { version: 1, date: "05.11.2025", evaluationStatus: "actual", riskLevel: "medium", totalRisks: 2, highRisks: 0, summary: "Первичная оценка. Базовые риски идентифицированы.", trigger: "documents" },
  ],
  p2: [
    { version: 2, date: "20.01.2026", evaluationStatus: "needs-review", riskLevel: "high", totalRisks: 4, highRisks: 2, summary: "Мобильное приложение использует устаревший API. Высокий приоритет обновления.", trigger: "news" },
    { version: 1, date: "15.09.2025", evaluationStatus: "actual", riskLevel: "high", totalRisks: 3, highRisks: 2, summary: "Критические уязвимости в протоколе передачи данных.", trigger: "documents" },
  ],
  p3: [
    { version: 2, date: "10.03.2026", evaluationStatus: "actual", riskLevel: "medium", totalRisks: 3, highRisks: 0, summary: "SLA не соответствует целевому показателю 99.95%. Рекомендуется улучшение.", trigger: "reassessment" },
    { version: 1, date: "20.12.2025", evaluationStatus: "actual", riskLevel: "medium", totalRisks: 2, highRisks: 0, summary: "Базовая оценка платёжного шлюза. Средний уровень риска.", trigger: "documents" },
  ],
  p5: [
    { version: 2, date: "28.02.2026", evaluationStatus: "needs-review", riskLevel: "high", totalRisks: 3, highRisks: 1, summary: "Неконтролируемый доступ аналитиков к сырым данным. Необходимо внедрить ролевую модель.", trigger: "ai" },
    { version: 1, date: "15.01.2026", evaluationStatus: "actual", riskLevel: "medium", totalRisks: 1, highRisks: 0, summary: "Первичная оценка рисков Data Lake.", trigger: "documents" },
  ],
};

const objectSources: Record<string, SourceItem[]> = {
  p1: [
    { type: "law", title: "Ужесточение ФЗ-152 о персональных данных", description: "Новые требования к хранению и обработке ПДн", effect: "Обнаружены 2 новых проявления рисков", date: "15.03.2026" },
    { type: "ai-agent", title: "NORM AI: автоматическая оценка", description: "Анализ выявил уязвимости в механизмах шифрования", effect: "Уровень риска повышен до высокого", date: "14.03.2026" },
  ],
  p2: [
    { type: "news", title: "Уязвимость в протоколе API v2", description: "Обнаружена критическая уязвимость в используемом API", effect: "Требуется обновление до API v3", date: "18.01.2026" },
  ],
  p5: [
    { type: "document", title: "Отчёт внутреннего аудита", description: "Выявлен неконтролируемый доступ к сырым данным", effect: "+1 проявление риска", date: "25.02.2026" },
  ],
  a2: [
    { type: "ai-agent", title: "NORM AI: bias-тест", description: "Выявлена предвзятость в возрастной когорте 18-25", effect: "Модель помечена для переобучения", date: "18.03.2026" },
    { type: "document", title: "Отчёт внешнего аудитора", description: "Подтверждена необходимость ретренинга", effect: "Уровень риска подтверждён как высокий", date: "16.03.2026" },
  ],
};

const levelLabelsRu: Record<string, string> = {
  high: "Высокий", medium: "Средний", low: "Низкий", none: "Нет данных",
};

/* ─── Accepted manifestations state ─── */
type ManifestationStatus = "pending" | "accepted" | "rejected";

/* ─── Lifecycle style map ─── */
const lifecycleStyleMap: Record<string, string> = {
  planned: "bg-[hsl(var(--lifecycle-planned-bg))] text-[hsl(var(--lifecycle-planned))]",
  active: "bg-[hsl(var(--lifecycle-active-bg))] text-[hsl(var(--lifecycle-active))]",
  closed: "bg-[hsl(var(--lifecycle-closed-bg))] text-[hsl(var(--lifecycle-closed))]",
};

/* ─── Evaluation status style map ─── */
const evalStyleMap: Record<string, { label: string; className: string }> = {
  "ai-analysis": { label: "AI анализ", className: "bg-[hsl(var(--status-progress-bg))] text-[hsl(var(--status-progress))]" },
  "needs-review": { label: "Анализ завершён", className: "bg-[hsl(var(--risk-medium-bg))] text-[hsl(var(--risk-medium))]" },
  actual: { label: "Оценка подтверждена", className: "bg-[hsl(var(--status-active-bg))] text-[hsl(var(--status-active))]" },
  none: { label: "Нет оценки", className: "bg-[hsl(var(--status-none-bg))] text-[hsl(var(--status-none))]" },
};

/* ─── Anchor nav sections ─── */
const sections = [
  { id: "overview", label: "Обзор" },
  { id: "manifestations", label: "Проявления" },
  { id: "sources", label: "Источники" },
  { id: "context", label: "Контекст" },
  { id: "history", label: "История" },
] as const;

/* ─── Main Component ─── */
interface ObjectDetailModalProps {
  objectId: string;
  onClose: () => void;
  onOpenRisk?: (riskId: string) => void;
  zIndex?: number;
}

export function ObjectDetailModal({ objectId, onClose, onOpenRisk, zIndex = 50 }: ObjectDetailModalProps) {
  const obj = objects.find((o) => o.id === objectId);
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [manifestationsExpanded, setManifestationsExpanded] = useState(false);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const [statuses, setStatuses] = useState<Record<number, ManifestationStatus>>({});
  const [drawerItem, setDrawerItem] = useState<{ index: number; data: ReturnType<typeof getManifestationsForObject>[number] } | null>(null);
  const [localEvalStatus, setLocalEvalStatus] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false);
  const [reEvalModalOpen, setReEvalModalOpen] = useState(false);
  const [localLifecycle, setLocalLifecycle] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const setSectionRef = useCallback((id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  }, []);

  // Scroll spy
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const handleScroll = () => {
      const top = container.scrollTop + 120;
      let current = "overview";
      for (const s of sections) {
        const el = sectionRefs.current[s.id];
        if (el && el.offsetTop <= top) current = s.id;
      }
      setActiveSection(current);
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (el && scrollRef.current) {
      scrollRef.current.scrollTo({ top: el.offsetTop - 100, behavior: "smooth" });
    }
  };

  if (!obj) return null;

  const manifestationsData = getManifestationsForObject(obj.id);
  const history = assessmentHistory[obj.id] || [];
  const sources = objectSources[obj.id] || [];
  const aiSummary = aiSummaries[obj.id] || `Объект ${obj.riskLevel === "high" ? "содержит критические" : obj.riskLevel === "medium" ? "содержит умеренные" : "не содержит значимых"} рисков.`;

  const versions = productVersions[obj.id] || [];
  const currentVersion = versions.length > 0 ? versions[0].version : 1;
  const acceptedCount = Object.values(statuses).filter(s => s === "accepted").length;
  const previewManifestations = manifestationsData.slice(0, 3);
  const previewSources = sources.slice(0, 2);

  const lifecycle = localLifecycle || obj.lifecycle || "active";
  const evaluationStatus = localEvalStatus || obj.evaluationStatus || "actual";
  const evalInfo = evalStyleMap[evaluationStatus] || evalStyleMap.actual;

  const isNoEvaluation = evaluationStatus === "none";
  const isAiAnalysis = evaluationStatus === "ai-analysis";
  const isNeedsReview = evaluationStatus === "needs-review";
  const isConfirmed = evaluationStatus === "actual" || accepted;

  const handleAcceptEvaluation = () => {
    setLocalEvalStatus("actual");
    setAccepted(true);
    // Update the object in mock data
    const objIndex = objects.findIndex(o => o.id === objectId);
    if (objIndex !== -1) {
      objects[objIndex].evaluationStatus = "actual";
    }
    toast({ title: "Оценка принята", description: "Оценка риска подтверждена и учтена в продукте." });
  };

  const handleDeleteEvaluation = () => {
    onClose();
  };

  const handleActivateProduct = () => {
    setLocalLifecycle("active");
    const objIndex = objects.findIndex(o => o.id === objectId);
    if (objIndex !== -1) {
      objects[objIndex].lifecycle = "active";
    }
    toast({ title: "Продукт переведён в действующие", description: "Жизненный цикл продукта обновлён." });
  };

  const handleReEvaluationStarted = (payload: ReEvaluationStartPayload) => {
    const newVersion = currentVersion + 1;
    const wasNoEvaluation = isNoEvaluation;
    const triggerMap: Record<string, ProductVersion["trigger"]> = {
      "documents": "documents",
      "product-changes": "reassessment",
      "law-news": "law",
      "manual": "reassessment",
    };

    const generatedRiskLevel: RiskLevel = wasNoEvaluation ? "high" : (obj.riskLevel === "medium" ? "high" : obj.riskLevel === "low" ? "medium" : "high");

    // Mock manifestations to generate for first-time evaluation
    const newManifestations: Array<{ riskId: string; level: RiskLevel; comment: string }> = wasNoEvaluation
      ? [
          { riskId: "br1", level: "high", comment: `В продукте «${obj.name}» обнаружено автоматическое подключение услуг без явного согласия клиента` },
          { riskId: "r1", level: "high", comment: `Продукт «${obj.name}» обрабатывает персональные данные без достаточных мер защиты` },
          { riskId: "br2", level: "medium", comment: `Условия использования продукта «${obj.name}» недостаточно прозрачно раскрыты в интерфейсе` },
          { riskId: "r4", level: "medium", comment: `SLA продукта «${obj.name}» не соответствует целевому показателю доступности` },
        ]
      : [];

    const totalRisks = wasNoEvaluation ? newManifestations.length : manifestationsData.length + Math.floor(Math.random() * 2) + 1;
    const highRisks = wasNoEvaluation ? newManifestations.filter(m => m.level === "high").length : (manifestationsData.filter(m => m.level === "high").length) + 1;

    const newVersionData: ProductVersion = {
      version: newVersion,
      date: "25.03.2026",
      evaluationStatus: "ai-analysis",
      riskLevel: generatedRiskLevel,
      totalRisks,
      highRisks,
      summary: "Анализ в процессе. Обработка загруженных документов.",
      trigger: triggerMap[payload.reason] || "documents",
    };

    if (!productVersions[obj.id]) {
      productVersions[obj.id] = [];
    }
    productVersions[obj.id].unshift(newVersionData);

    const objIndex = objects.findIndex(o => o.id === objectId);
    if (objIndex !== -1) {
      objects[objIndex].evaluationStatus = "ai-analysis";
    }
    setLocalEvalStatus("ai-analysis");
    setAccepted(false);
    setAnalysisProgress(0);

    // Animate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 600);

    toast({
      title: "Анализ запущен",
      description: `Версия v${newVersion} — анализ начался.`,
    });

    // Simulate completion after delay
    setTimeout(() => {
      clearInterval(progressInterval);
      setAnalysisProgress(100);

      const completionSummary = wasNoEvaluation
        ? `Анализ продукта «${obj.name}» выявил ${totalRisks} проявлений рисков, из них ${highRisks} высокого уровня. Обнаружены поведенческие риски, связанные с прозрачностью условий и согласием клиентов.`
        : (obj.riskLevel === "medium"
          ? "Обнаружены новые проявления рисков после анализа обновлённых документов. Уровень риска повышен."
          : "Подтверждены существующие проявления рисков. Выявлены дополнительные факторы, требующие внимания.");

      newVersionData.evaluationStatus = "needs-review";
      newVersionData.summary = completionSummary;
      if (productVersions[obj.id]?.[0]?.version === newVersion) {
        productVersions[obj.id][0] = newVersionData;
      }

      // Generate manifestations for first-time evaluation
      if (wasNoEvaluation) {
        newManifestations.forEach((m) => {
          manifestations.unshift({
            riskId: m.riskId,
            objectId: obj.id,
            level: m.level,
            comment: m.comment,
          });
        });

        // Add AI summary
        aiSummaries[obj.id] = completionSummary;

        // Add assessment history
        assessmentHistory[obj.id] = [
          { date: "2026-03-25", type: "AI", level: generatedRiskLevel },
        ];

        // Add sources
        objectSources[obj.id] = [
          { type: "document", title: "Загруженные документы", description: "Анализ документов, предоставленных пользователем", effect: `Выявлено ${totalRisks} проявлений рисков`, date: "25.03.2026" },
          { type: "ai-agent", title: "NORM AI: поведенческий анализ", description: "Автоматическая проверка на соответствие стандартам поведения", effect: "Обнаружены поведенческие риски", date: "25.03.2026" },
        ];
      }

      const idx = objects.findIndex(o => o.id === objectId);
      if (idx !== -1) {
        objects[idx].evaluationStatus = "needs-review";
        objects[idx].riskLevel = generatedRiskLevel;
        objects[idx].status = "progress";
        objects[idx].lastAssessment = "2026-03-25";
      }
      setLocalEvalStatus("needs-review");
    }, 5000);
  };

  const setManifestationStatus = (idx: number, status: ManifestationStatus) => {
    setStatuses(prev => ({ ...prev, [idx]: status }));
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center" style={{ zIndex }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-[1320px] max-h-[92vh] mt-[4vh] bg-background rounded-2xl shadow-2xl border border-border flex flex-col animate-in fade-in-0 zoom-in-95 duration-200">
        {/* ── Sticky Header ── */}
        <div className="sticky top-0 z-20 bg-background rounded-t-2xl border-b border-border px-8 py-4 shrink-0">
          {/* Row 1: Lifecycle + Evaluation status */}
          <div className="flex items-center gap-2 mb-2">
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", lifecycleStyleMap[lifecycle])}>
              {lifecycleLabels[lifecycle]}
            </span>
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", evalInfo.className)}>
              {evalInfo.label}
            </span>
          </div>

          {/* Row 2: Title + Risk badge */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-foreground">{obj.name}</h1>
            <div className="flex items-center gap-3">
              {!isNoEvaluation && !isAiAnalysis && <RiskBadge level={obj.riskLevel} />}
              <button onClick={onClose} className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Row 3: Navigation (hide when no evaluation or during analysis) */}
          {!isNoEvaluation && !isAiAnalysis && (
            <div className="flex items-center gap-1.5 -mb-1">
              {sections.map(s => (
                <button key={s.id} onClick={() => scrollToSection(s.id)}
                  className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    activeSection === s.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}>
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Scrollable Content ── */}
        <div ref={scrollRef} className="overflow-y-auto flex-1 no-scrollbar">
          {isNoEvaluation ? (
            /* ── Empty Evaluation State ── */
            <div className="flex items-center justify-center p-8 min-h-[400px]">
              <div className="max-w-md text-center space-y-4">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-[hsl(var(--brand-green)/0.1)] flex items-center justify-center">
                  <FileText className="h-7 w-7 text-[hsl(var(--brand-green))]" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-base font-semibold text-foreground">Это новая версия продукта</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Загрузите документы, чтобы провести оценку рисков.
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Продукт был обнаружен системой и привязан к существующему. Оценка рисков ещё не проводилась.
                  </p>
                </div>
                <button
                  onClick={() => setReEvalModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--brand-green))] text-[hsl(var(--brand-green-foreground))] px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-all"
                >
                  <FileText className="h-4 w-4" />
                  Загрузить документы
                </button>
              </div>
            </div>
          ) : isAiAnalysis ? (
            /* ── AI Analysis Progress State ── */
            <div className="flex items-center justify-center p-8 min-h-[400px]">
              <div className="max-w-lg w-full text-center space-y-6">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-[hsl(270_60%_95%)] flex items-center justify-center">
                  <Loader2 className="h-7 w-7 text-[hsl(270_60%_50%)] animate-spin" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-base font-semibold text-foreground">AI анализирует документы</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Система проверяет загруженные документы на соответствие требованиям и выявляет потенциальные риски.
                  </p>
                </div>
                <div className="space-y-2 max-w-sm mx-auto">
                  <Progress value={Math.min(analysisProgress, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground">{Math.min(Math.round(analysisProgress), 100)}% завершено</p>
                </div>
                <div className="space-y-3 text-left max-w-sm mx-auto">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0", analysisProgress > 20 ? "bg-[hsl(var(--status-active-bg))]" : "bg-muted")}>
                      {analysisProgress > 20 ? <Check className="h-3 w-3 text-[hsl(var(--status-active))]" /> : <Loader2 className="h-3 w-3 text-muted-foreground animate-spin" />}
                    </div>
                    <span className="text-xs text-foreground">Извлечение данных из документов</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0", analysisProgress > 50 ? "bg-[hsl(var(--status-active-bg))]" : analysisProgress > 20 ? "bg-muted" : "bg-muted/50")}>
                      {analysisProgress > 50 ? <Check className="h-3 w-3 text-[hsl(var(--status-active))]" /> : analysisProgress > 20 ? <Loader2 className="h-3 w-3 text-muted-foreground animate-spin" /> : <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />}
                    </div>
                    <span className={cn("text-xs", analysisProgress > 20 ? "text-foreground" : "text-muted-foreground")}>Анализ операционных рисков</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0", analysisProgress > 80 ? "bg-[hsl(var(--status-active-bg))]" : analysisProgress > 50 ? "bg-muted" : "bg-muted/50")}>
                      {analysisProgress > 80 ? <Check className="h-3 w-3 text-[hsl(var(--status-active))]" /> : analysisProgress > 50 ? <Loader2 className="h-3 w-3 text-muted-foreground animate-spin" /> : <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />}
                    </div>
                    <span className={cn("text-xs", analysisProgress > 50 ? "text-foreground" : "text-muted-foreground")}>Проверка поведенческих рисков</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0", analysisProgress >= 100 ? "bg-[hsl(var(--status-active-bg))]" : analysisProgress > 80 ? "bg-muted" : "bg-muted/50")}>
                      {analysisProgress >= 100 ? <Check className="h-3 w-3 text-[hsl(var(--status-active))]" /> : analysisProgress > 80 ? <Loader2 className="h-3 w-3 text-muted-foreground animate-spin" /> : <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />}
                    </div>
                    <span className={cn("text-xs", analysisProgress > 80 ? "text-foreground" : "text-muted-foreground")}>Формирование отчёта</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
          <div className="flex gap-6 p-8">
            {/* Main column */}
            <div className="flex-1 min-w-0 space-y-6">

              {/* ── OVERVIEW ── */}
              <section ref={setSectionRef("overview")} className="space-y-6">
                {/* Inline success alert after acceptance */}
                {accepted && (
                  <div className="rounded-xl border border-[hsl(var(--status-active))/0.3] bg-[hsl(var(--status-active-bg))] p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-7 w-7 rounded-lg bg-[hsl(var(--status-active))/0.15] flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--status-active))]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[hsl(var(--status-active))] mb-0.5">Оценка риска подтверждена</p>
                        <p className="text-xs text-[hsl(var(--status-active))/0.8] mb-0">
                          Результаты зафиксированы и учитываются в продукте.
                        </p>
                        {lifecycle === "planned" && (
                          <button
                            onClick={handleActivateProduct}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--status-active))] text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                            Перевести в действующие
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {/* Sources context banner */}
                {sources.length > 0 && (
                  <div className="rounded-xl border border-[hsl(200_80%_85%)] bg-[hsl(200_80%_97%)] p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-7 w-7 rounded-lg bg-[hsl(200_80%_90%)] flex items-center justify-center shrink-0 mt-0.5">
                        <Info className="h-3.5 w-3.5 text-[hsl(200_80%_40%)]" />
                      </div>
                      <div>
                        <p className="text-sm text-[hsl(200_80%_30%)]">
                          Обнаружены риски на основе {sources.length > 1 ? `${sources.length} источников` : "1 источника"}.{" "}
                          Вы можете принять или отклонить оценку.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Summary — clean text only */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[hsl(270_60%_95%)] flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="h-4 w-4 text-[hsl(270_60%_50%)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-medium text-muted-foreground">AI-сводка</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{aiSummary}</p>
                    </div>
                  </div>
                </div>

                {/* Metrics strip — total risks + date only */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground">
                    <Target className="h-3 w-3 text-muted-foreground" />
                    Риски: {manifestationsData.length}
                  </div>
                  {acceptedCount > 0 && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--status-active-bg))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--status-active))]">
                      <Check className="h-3 w-3" />
                      Принято: {acceptedCount}
                    </div>
                  )}
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Оценка: {obj.lastAssessment ?? "не проводилась"}
                  </div>
                </div>
              </section>

              {/* ── MANIFESTATIONS ── */}
              <section ref={setSectionRef("manifestations")} className="space-y-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-semibold text-foreground">Проявления рисков</h2>
                  {manifestationsData.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {manifestationsData.length} рисков
                    </span>
                  )}
                </div>

                {manifestationsData.length > 0 ? (
                  <>
                    <div className="space-y-2 transition-all duration-300">
                      {(manifestationsExpanded ? manifestationsData : previewManifestations).map((m, i) => {
                        const mStatus = statuses[i] || "pending";
                         return (
                          <button
                            key={i}
                            onClick={() => setDrawerItem({ index: i, data: m })}
                            className="w-full text-left rounded-xl border border-border bg-card p-4 hover:shadow-sm hover:border-[hsl(var(--primary)/0.3)] transition-all group"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">
                                    {m.risk.name}
                                  </span>
                                  <RiskBadge level={m.level} />
                                  {m.risk.riskType === "behavior" && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(270_60%_95%)] text-[hsl(270_60%_40%)] px-1.5 py-0.5 text-[10px] font-medium">
                                      <ShieldAlert className="h-2.5 w-2.5" />
                                      Поведенческий
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{m.comment}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                {mStatus === "pending" && (
                                  <span className="text-xs text-muted-foreground">На рассмотрении</span>
                                )}
                                {mStatus === "accepted" && (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--status-active-bg))] text-[hsl(var(--status-active))] px-2.5 py-1 text-xs font-medium">
                                    <Check className="h-3 w-3" />
                                    Учтён
                                  </span>
                                )}
                                {mStatus === "rejected" && (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground px-2.5 py-1 text-xs font-medium">
                                    <XCircle className="h-3 w-3" />
                                    Отклонён
                                  </span>
                                )}
                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[hsl(var(--primary))] transition-colors" />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {manifestationsData.length > 3 && (
                      <button onClick={() => setManifestationsExpanded(!manifestationsExpanded)}
                        className="flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--primary))] hover:underline">
                        {manifestationsExpanded ? "Свернуть" : `Показать все (${manifestationsData.length})`}
                        <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", manifestationsExpanded && "rotate-180")} />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="rounded-xl border border-border bg-card p-8 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Target className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">Проявления рисков не обнаружены</p>
                    <p className="text-xs text-muted-foreground mb-4">Объект не имеет выявленных рисков или оценка ещё не проводилась</p>
                    <button className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors">
                      Запустить оценку
                    </button>
                  </div>
                )}
              </section>

              {/* ── SOURCES ── */}
              <section ref={setSectionRef("sources")} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">Источники анализа</h2>
                </div>
                {sources.length > 0 ? (
                  <>
                    <div className="space-y-2 transition-all duration-300">
                      {(sourcesExpanded ? sources : previewSources).map((source, i) => {
                        const Icon = sourceIcons[source.type];
                        return (
                          <div key={i} className="rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-start gap-3">
                              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs text-muted-foreground font-medium">{sourceLabels[source.type]}</span>
                                  <span className="text-xs text-muted-foreground">· {source.date}</span>
                                </div>
                                <h4 className="text-sm font-medium text-foreground mb-0.5">{source.title}</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{source.description}</p>
                                <div className="inline-flex items-center gap-1.5 rounded-md bg-[hsl(270_60%_95%)] text-[hsl(270_60%_40%)] px-2.5 py-1 text-xs font-medium">
                                  <Sparkles className="h-3 w-3" />
                                  {source.effect}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {sources.length > 2 && (
                      <button onClick={() => setSourcesExpanded(!sourcesExpanded)}
                        className="flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--primary))] hover:underline">
                        {sourcesExpanded ? "Свернуть" : `Все источники (${sources.length})`}
                        <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", sourcesExpanded && "rotate-180")} />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="rounded-xl border border-border bg-card p-5 text-center">
                    <p className="text-sm text-muted-foreground">Источники анализа не зафиксированы</p>
                  </div>
                )}
              </section>

              {/* ── CONTEXT ── */}
              <section ref={setSectionRef("context")} className="space-y-4">
                <h2 className="text-sm font-semibold text-foreground">Контекст</h2>
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Описание</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{obj.description || "Описание не указано."}</p>
                </div>
              </section>

              {/* ── HISTORY ── */}
              <section ref={setSectionRef("history")} className="space-y-3 pb-4">
                <h2 className="text-sm font-semibold text-foreground">История оценок</h2>
                {history.length > 0 ? (
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    {history.map((h, i) => (
                      <div key={i} className={cn("flex items-center justify-between px-4 py-3", i < history.length - 1 && "border-b border-border")}>
                        <span className="text-sm text-foreground tabular-nums">{h.date}</span>
                        <span className="text-xs text-muted-foreground">{h.type === "AI" ? "AI-оценка" : "Ручная"}</span>
                        <RiskBadge level={h.level} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-card p-5 text-center">
                    <p className="text-sm text-muted-foreground">Оценки ещё не проводились</p>
                  </div>
                )}
              </section>
            </div>

            {/* ── Right sidebar ── */}
            <div className="w-[260px] shrink-0 space-y-4">
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Информация</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Тип</span>
                    <span className="font-medium text-foreground">{typeLabels[obj.type]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Жизненный цикл</span>
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", lifecycleStyleMap[lifecycle])}>
                      {lifecycleLabels[lifecycle]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Статус оценки</span>
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", evalInfo.className)}>
                      {evalInfo.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Последняя оценка</span>
                    <span className="text-foreground">{obj.lastAssessment ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Риски</span>
                    <span className="text-foreground">{manifestationsData.length}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setReEvalModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <RotateCcw className="h-4 w-4" />
                Запустить переоценку
              </button>

              {versions.length > 0 && (
                <button
                  onClick={() => setVersionDrawerOpen(true)}
                  className="w-full flex items-center justify-between rounded-xl border border-border bg-card p-5 hover:shadow-sm hover:border-[hsl(var(--primary)/0.3)] transition-all"
                >
                  <div className="text-left">
                    <span className="text-sm font-medium text-foreground">История версий</span>
                    <p className="text-xs text-muted-foreground mt-0.5">v{currentVersion} · {versions.length} версий</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              )}
            </div>
          </div>
          )}
        </div>

        {/* Bottom actions */}
        {!isNoEvaluation && !isAiAnalysis && (
        <div className="border-t border-border px-8 py-4 flex items-center justify-end gap-3">
          {isNeedsReview && !accepted && (
            <>
              <button
                onClick={handleDeleteEvaluation}
                className="inline-flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Удалить оценку
              </button>
              <button
                onClick={handleAcceptEvaluation}
                className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Check className="h-4 w-4" />
                Принять оценку
              </button>
            </>
          )}
          {accepted && (
            <button
              onClick={() => setReEvalModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Запустить переоценку
            </button>
          )}
        </div>
        )}

        {/* ── Manifestation Drawer ── */}
        {drawerItem && (() => {
          const m = drawerItem.data;
          const mStatus = statuses[drawerItem.index] || "pending";
          const relatedSources = (objectSources[objectId] || []).slice(0, 2);

          return (
            <>
              <div
                className="absolute inset-0 z-30 bg-black/20 rounded-2xl transition-opacity duration-200"
                onClick={() => setDrawerItem(null)}
              />
              <div className="absolute right-0 top-0 bottom-0 z-40 w-[440px] bg-background border-l border-border rounded-r-2xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
                {/* Drawer header */}
                <div className="px-5 py-4 border-b border-border shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Проявление риска</span>
                    <button onClick={() => setDrawerItem(null)} className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{m.risk.name}</h3>
                </div>

                {/* Drawer content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
                  {/* Level & type */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <RiskBadge level={m.level} />
                    {m.risk.riskType === "behavior" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(270_60%_95%)] text-[hsl(270_60%_40%)] px-2 py-0.5 text-xs font-medium">
                        <ShieldAlert className="h-3 w-3" />
                        Поведенческий
                      </span>
                    )}
                  </div>

                  {/* AI explanation */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="h-4 w-4 text-[hsl(270_60%_50%)] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium text-muted-foreground mb-1 block">AI-объяснение</span>
                        <p className="text-sm text-foreground leading-relaxed">{m.comment}</p>
                      </div>
                    </div>
                  </div>

                  {/* Linked corporate risk */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground">Корпоративный риск</span>
                    <button
                      onClick={() => {
                        setDrawerItem(null);
                        onOpenRisk?.(m.riskId);
                      }}
                      className="w-full rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-3 hover:border-[hsl(var(--primary)/0.3)] hover:shadow-sm transition-all group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">{m.risk.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Уровень: {levelLabelsRu[m.risk.level]}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[hsl(var(--primary))] transition-colors shrink-0" />
                    </button>
                  </div>

                  {/* Related sources */}
                  {relatedSources.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-muted-foreground">Источники</span>
                      <div className="space-y-2">
                        {relatedSources.map((s, si) => {
                          const SIcon = sourceIcons[s.type];
                          return (
                            <div key={si} className="rounded-xl border border-border bg-card p-3">
                              <div className="flex items-start gap-2.5">
                                <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
                                  <SIcon className="h-3 w-3 text-muted-foreground" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-foreground">{s.title}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{s.effect}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Drawer actions */}
                <div className="px-5 py-4 border-t border-border shrink-0 space-y-2">
                  {mStatus === "pending" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setManifestationStatus(drawerItem.index, "accepted");
                          setDrawerItem(null);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-foreground/90 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Принять оценку
                      </button>
                      <button
                        onClick={() => {
                          setManifestationStatus(drawerItem.index, "rejected");
                          setDrawerItem(null);
                        }}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Не согласен
                      </button>
                    </div>
                  )}
                  {mStatus === "accepted" && (
                    <div className="flex items-center justify-center gap-1.5 rounded-lg bg-[hsl(var(--status-active-bg))] text-[hsl(var(--status-active))] px-4 py-2 text-sm font-medium">
                      <Check className="h-3.5 w-3.5" />
                      Учтён в корпоративном риске
                    </div>
                  )}
                  {mStatus === "rejected" && (
                    <div className="flex items-center justify-center gap-1.5 rounded-lg bg-muted text-muted-foreground px-4 py-2 text-sm font-medium">
                      <XCircle className="h-3.5 w-3.5" />
                      Оценка отклонена
                    </div>
                  )}
                </div>
              </div>
            </>
          );
        })()}

        {/* ── Version History Drawer ── */}
        {versionDrawerOpen && versions.length > 0 && (
          <VersionHistoryDrawer
            versions={versions}
            currentVersion={currentVersion}
            onClose={() => setVersionDrawerOpen(false)}
            onSelectVersion={(v) => {
              setVersionDrawerOpen(false);
              toast({ title: `Версия v${v.version}`, description: `Переключено на версию от ${v.date}` });
            }}
          />
        )}

        {/* ── Re-Evaluation Modal ── */}
        {reEvalModalOpen && (
          <ProductReEvaluationModal
            productName={obj.name}
            currentVersion={currentVersion}
            onClose={() => setReEvalModalOpen(false)}
            onStarted={handleReEvaluationStarted}
            zIndex={(zIndex || 50) + 10}
          />
        )}
      </div>
    </div>
  );
}
