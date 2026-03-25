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
import { ProductModalShell, ModalBody, ModalNavChips } from "@/components/ProductModalShell";
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
  const [productDetailsOpen, setProductDetailsOpen] = useState(false);
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
    setLocalEvalStatus("none");
    const objIndex = objects.findIndex(o => o.id === objectId);
    if (objIndex !== -1) {
      objects[objIndex].lifecycle = "active";
      objects[objIndex].evaluationStatus = "none";
      objects[objIndex].riskLevel = "none";
    }
    toast({ title: "Продукт переведён в действующие", description: "Жизненный цикл продукта обновлён. Вы можете провести оценку рисков." });
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

      if (wasNoEvaluation) {
        newManifestations.forEach((m) => {
          manifestations.unshift({
            riskId: m.riskId,
            objectId: obj.id,
            level: m.level,
            comment: m.comment,
          });
        });

        aiSummaries[obj.id] = completionSummary;

        assessmentHistory[obj.id] = [
          { date: "2026-03-25", type: "AI", level: generatedRiskLevel },
        ];

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

  /* ─── Build shell props ─── */
  const statusChips = (
    <>
      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", lifecycleStyleMap[lifecycle])}>
        {lifecycleLabels[lifecycle]}
      </span>
      {obj.riskLevel !== "none" && <RiskBadge level={obj.riskLevel} />}
    </>
  );

  const navigation = (
    <ModalNavChips sections={sections} activeSection={activeSection} onNavigate={scrollToSection} />
  );

  const headerExtra = lifecycle === "planned" && obj.type === "product" ? (
    <div className="flex items-center justify-between gap-3 mt-2 rounded-xl border border-[hsl(var(--lifecycle-planned)/0.3)] bg-[hsl(var(--lifecycle-planned-bg))] px-4 py-3">
      <p className="text-xs text-foreground">Продукт в статусе «Планируемый». Активация не требует оценки рисков.</p>
      <button
        onClick={handleActivateProduct}
        className="inline-flex items-center gap-1.5 shrink-0 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2 text-sm font-medium hover:opacity-90 transition-all"
      >
        <ArrowRight className="h-3.5 w-3.5" />
        Перевести в действующие
      </button>
    </div>
  ) : undefined;

  const footer = (
    <>
      {isNoEvaluation && (
        <button
          onClick={() => setReEvalModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--brand-green))] text-[hsl(var(--brand-green-foreground))] px-4 py-2 text-sm font-medium hover:opacity-90 transition-all"
        >
          <FileText className="h-4 w-4" />
          Оценить продукт
        </button>
      )}
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
    </>
  );

  /* ─── Shared meta sidebar ─── */
  const metaSidebar = (
    <>
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
          {obj.createdDate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Дата создания</span>
              <span className="text-foreground">{obj.createdDate}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Последняя оценка</span>
            <span className="text-foreground">{obj.lastAssessment ?? "—"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Статус оценки</span>
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", evalInfo.className)}>
              {evalInfo.label}
            </span>
          </div>
          {!isNoEvaluation && !isAiAnalysis && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Риски</span>
              <span className="text-foreground">{manifestationsData.length}</span>
            </div>
          )}
        </div>
      </div>

      {!isAiAnalysis && (
        <button
          onClick={() => setReEvalModalOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <RotateCcw className="h-4 w-4" />
          {isNoEvaluation ? "Оценить продукт" : "Запустить переоценку"}
        </button>
      )}

      {versions.length > 0 && (
        <button
          onClick={() => setVersionDrawerOpen(true)}
          className="w-full flex items-center justify-between rounded-xl border border-border bg-card p-5 hover:shadow-sm hover:border-[hsl(var(--primary)/0.3)] transition-all"
        >
          <div className="text-left">
            <span className="text-sm font-medium text-foreground">История версий</span>
            <p className="text-xs text-muted-foreground mt-0.5">v{currentVersion} · {versions.length} версий</p>
          </div>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </>
  );

  /* ─── Body content — always two-column ─── */
  const renderBody = () => {
    return (
      <ModalBody sidebar={metaSidebar}>
        {/* ── OVERVIEW ── */}
        <section ref={setSectionRef("overview")} className="space-y-6">
          {obj.description && (
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-foreground leading-relaxed line-clamp-3">{obj.description}</p>
              <button
                onClick={() => setProductDetailsOpen(true)}
                className="mt-2 text-xs font-medium text-[hsl(var(--primary))] hover:underline transition-colors"
              >
                Подробнее
              </button>
            </div>
          )}

          {isNoEvaluation && (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-[hsl(var(--brand-green)/0.1)] flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-[hsl(var(--brand-green))]" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground mb-1">Оценка не проводилась</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    Загрузите документы, чтобы провести анализ рисков. Отсутствие оценки не означает отсутствие рисков.
                  </p>
                  <button
                    onClick={() => setReEvalModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--brand-green))] text-[hsl(var(--brand-green-foreground))] px-3.5 py-2 text-sm font-medium hover:opacity-90 transition-all"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Оценить продукт
                  </button>
                </div>
              </div>
            </div>
          )}

          {isAiAnalysis && (
            <div className="rounded-xl border border-border bg-card p-5 space-y-5">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-[hsl(270_60%_95%)] flex items-center justify-center shrink-0">
                  <Loader2 className="h-4 w-4 text-[hsl(270_60%_50%)] animate-spin" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground mb-1">AI анализирует документы</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Система проверяет загруженные документы на соответствие требованиям.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Прогресс</span>
                  <span className="text-xs font-medium text-foreground tabular-nums">{Math.min(Math.round(analysisProgress), 100)}%</span>
                </div>
                <Progress value={Math.min(analysisProgress, 100)} className="h-2" />
              </div>
              <div className="space-y-2">
                {[
                  { threshold: 20, label: "Извлечение данных из документов" },
                  { threshold: 50, label: "Анализ операционных рисков" },
                  { threshold: 80, label: "Проверка поведенческих рисков" },
                  { threshold: 100, label: "Формирование отчёта" },
                ].map((step) => (
                  <div key={step.threshold} className="flex items-center gap-3">
                    <div className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0",
                      analysisProgress > step.threshold ? "bg-[hsl(var(--status-active-bg))]" :
                      analysisProgress > step.threshold - 30 ? "bg-muted" : "bg-muted/50"
                    )}>
                      {analysisProgress > step.threshold ? (
                        <Check className="h-3 w-3 text-[hsl(var(--status-active))]" />
                      ) : analysisProgress > step.threshold - 30 ? (
                        <Loader2 className="h-3 w-3 text-muted-foreground animate-spin" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>
                    <span className={cn("text-xs", analysisProgress > step.threshold - 30 ? "text-foreground" : "text-muted-foreground")}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {accepted && (
            <div className="rounded-xl border border-[hsl(var(--status-active))/0.3] bg-[hsl(var(--status-active-bg))] p-4">
              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-[hsl(var(--status-active))/0.15] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--status-active))]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[hsl(var(--status-active))] mb-0.5">Оценка риска подтверждена</p>
                  <p className="text-xs text-[hsl(var(--status-active))/0.8]">Результаты зафиксированы и учитываются в продукте.</p>
                </div>
              </div>
            </div>
          )}

          {!isNoEvaluation && !isAiAnalysis && (
            <>
              {sources.length > 0 && (
                <div className="rounded-xl border border-[hsl(200_80%_85%)] bg-[hsl(200_80%_97%)] p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-7 w-7 rounded-lg bg-[hsl(200_80%_90%)] flex items-center justify-center shrink-0 mt-0.5">
                      <Info className="h-3.5 w-3.5 text-[hsl(200_80%_40%)]" />
                    </div>
                    <p className="text-sm text-[hsl(200_80%_30%)]">
                      Обнаружены риски на основе {sources.length > 1 ? `${sources.length} источников` : "1 источника"}.{" "}
                      Вы можете принять или отклонить оценку.
                    </p>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[hsl(270_60%_95%)] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="h-4 w-4 text-[hsl(270_60%_50%)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-muted-foreground mb-1.5 block">AI-сводка</span>
                    <p className="text-sm text-foreground leading-relaxed">{aiSummary}</p>
                  </div>
                </div>
              </div>

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
            </>
          )}
        </section>

        {/* ── MANIFESTATIONS ── */}
        <section ref={setSectionRef("manifestations")} className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-foreground">Проявления рисков</h2>
            {manifestationsData.length > 0 && (
              <span className="text-xs text-muted-foreground">{manifestationsData.length} рисков</span>
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
                            <span className="text-sm font-medium text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">{m.risk.name}</span>
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
                          {mStatus === "pending" && <span className="text-xs text-muted-foreground">На рассмотрении</span>}
                          {mStatus === "accepted" && <span className="inline-flex items-center gap-1 text-xs text-[hsl(var(--status-active))]"><Check className="h-3 w-3" /> Принято</span>}
                          {mStatus === "rejected" && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><XCircle className="h-3 w-3" /> Отклонено</span>}
                          <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {manifestationsData.length > 3 && (
                <button onClick={() => setManifestationsExpanded(!manifestationsExpanded)}
                  className="flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--primary))] hover:underline">
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", manifestationsExpanded && "rotate-180")} />
                  {manifestationsExpanded ? "Свернуть" : `Показать все ${manifestationsData.length}`}
                </button>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center">
              <p className="text-sm text-muted-foreground">
                {isNoEvaluation || isAiAnalysis ? "Проявления появятся после завершения анализа" : "Проявления рисков не обнаружены"}
              </p>
            </div>
          )}
        </section>

        {/* ── SOURCES ── */}
        <section ref={setSectionRef("sources")} className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Источники</h2>
          {sources.length > 0 ? (
            <>
              <div className="space-y-2">
                {(sourcesExpanded ? sources : previewSources).map((s, i) => {
                  const SIcon = sourceIcons[s.type];
                  return (
                    <div key={i} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <SIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-medium text-foreground">{s.title}</span>
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{sourceLabels[s.type]}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{s.description}</p>
                          <p className="text-xs text-foreground font-medium">{s.effect}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">{s.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {sources.length > 2 && (
                <button onClick={() => setSourcesExpanded(!sourcesExpanded)}
                  className="flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--primary))] hover:underline">
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", sourcesExpanded && "rotate-180")} />
                  {sourcesExpanded ? "Свернуть" : `Показать все ${sources.length}`}
                </button>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center">
              <p className="text-sm text-muted-foreground">Источники не найдены</p>
            </div>
          )}
        </section>

        {/* ── CONTEXT ── */}
        <section ref={setSectionRef("context")} className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Контекст</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-foreground leading-relaxed">{obj.description || "Описание объекта не указано."}</p>
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
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center">
              <p className="text-sm text-muted-foreground">Оценки ещё не проводились</p>
            </div>
          )}
        </section>
      </ModalBody>
    );
  };

  /* ─── Drawers ─── */
  const drawers = (
    <>
      {/* Manifestation Drawer */}
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
              <div className="px-5 py-4 border-b border-border shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Проявление риска</span>
                  <button onClick={() => setDrawerItem(null)} className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h3 className="text-base font-semibold text-foreground">{m.risk.name}</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
                <div className="flex items-center gap-3 flex-wrap">
                  <RiskBadge level={m.level} />
                  {m.risk.riskType === "behavior" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(270_60%_95%)] text-[hsl(270_60%_40%)] px-2 py-0.5 text-xs font-medium">
                      <ShieldAlert className="h-3 w-3" />
                      Поведенческий
                    </span>
                  )}
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-[hsl(270_60%_50%)] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-medium text-muted-foreground mb-1 block">AI-объяснение</span>
                      <p className="text-sm text-foreground leading-relaxed">{m.comment}</p>
                    </div>
                  </div>
                </div>

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

      {/* Version History Drawer */}
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

      {/* Product Details Drawer — full description only */}
      {productDetailsOpen && (
        <>
          <div
            className="absolute inset-0 z-30 bg-black/20 rounded-2xl transition-opacity duration-200"
            onClick={() => setProductDetailsOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 z-40 w-[440px] bg-background border-l border-border rounded-r-2xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">Полное описание</span>
                <button onClick={() => setProductDetailsOpen(false)} className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <h3 className="text-base font-semibold text-foreground">{obj.name}</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
              <p className="text-sm text-foreground leading-relaxed">{obj.description || "Описание не указано."}</p>
            </div>
          </div>
        </>
      )}

      {/* Re-Evaluation Modal */}
      {reEvalModalOpen && (
        <ProductReEvaluationModal
          productName={obj.name}
          currentVersion={currentVersion}
          onClose={() => setReEvalModalOpen(false)}
          onStarted={handleReEvaluationStarted}
          zIndex={(zIndex || 50) + 10}
        />
      )}
    </>
  );

  return (
    <ProductModalShell
      ref={scrollRef}
      onClose={onClose}
      zIndex={zIndex}
      statusChips={statusChips}
      title={obj.name}
      navigation={navigation}
      headerExtra={headerExtra}
      footer={footer}
      drawers={drawers}
    >
      {renderBody()}
    </ProductModalShell>
  );
}
