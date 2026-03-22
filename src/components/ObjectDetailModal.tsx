import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, ChevronDown, Sparkles, Shield, Clock, Activity, Target,
  CircleDot, Scale, Newspaper, FileText, Bot, User, Info,
  AlertTriangle, Check, XCircle, ExternalLink, TrendingUp,
  ArrowRight, ChevronRight
} from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import { StatusBadge } from "@/components/StatusBadge";
import {
  objects, getManifestationsForObject, assessmentHistory, typeLabels,
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

/* ─── Mock: Change events ─── */
interface ChangeEvent {
  previousLevel: RiskLevel;
  currentLevel: RiskLevel;
}
const changeEvents: Record<string, ChangeEvent> = {
  p1: { previousLevel: "medium", currentLevel: "high" },
  a2: { previousLevel: "medium", currentLevel: "high" },
};
const levelLabelsRu: Record<string, string> = {
  high: "Высокий", medium: "Средний", low: "Низкий", none: "Нет данных",
};

/* ─── Mock: Accepted manifestations state ─── */
type ManifestationStatus = "pending" | "accepted" | "rejected";

/* ─── Status labels ─── */
const objectStatusLabels: Record<string, { label: string; className: string }> = {
  actual: { label: "Актуально", className: "bg-[hsl(var(--status-active-bg))] text-[hsl(var(--status-active))]" },
  stale: { label: "Устарело", className: "bg-[hsl(var(--status-stale-bg))] text-[hsl(var(--status-stale))]" },
  progress: { label: "В работе", className: "bg-[hsl(var(--status-progress-bg))] text-[hsl(var(--status-progress))]" },
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
  const changeEvent = changeEvents[obj.id];
  const aiSummary = aiSummaries[obj.id] || `Объект ${obj.riskLevel === "high" ? "содержит критические" : obj.riskLevel === "medium" ? "содержит умеренные" : "не содержит значимых"} рисков.`;

  const highCount = manifestationsData.filter(m => m.level === "high").length;
  const mediumCount = manifestationsData.filter(m => m.level === "medium").length;
  const lowCount = manifestationsData.filter(m => m.level === "low").length;
  const acceptedCount = Object.values(statuses).filter(s => s === "accepted").length;

  const previewManifestations = manifestationsData.slice(0, 3);
  const previewSources = sources.slice(0, 2);
  const statusInfo = objectStatusLabels[obj.status] || objectStatusLabels.none;

  const setManifestationStatus = (idx: number, status: ManifestationStatus) => {
    setStatuses(prev => ({ ...prev, [idx]: status }));
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center" style={{ zIndex }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-[1320px] max-h-[92vh] mt-[4vh] bg-background rounded-2xl shadow-2xl border border-border flex flex-col animate-in fade-in-0 zoom-in-95 duration-200">
        {/* ── Sticky Header ── */}
        <div className="sticky top-0 z-20 bg-background rounded-t-2xl border-b border-border px-8 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">{typeLabels[obj.type]}</span>
                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", statusInfo.className)}>
                  {statusInfo.label}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{obj.name}</h1>
              </div>
              <RiskBadge level={obj.riskLevel} />
            </div>
            <div className="flex items-center gap-3">
              {obj.lastAssessment && (
                <span className="text-xs text-muted-foreground">Обновлён: {obj.lastAssessment}</span>
              )}
              <button onClick={onClose} className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* Sticky nav chips */}
          <div className="flex items-center gap-1.5 mt-3 -mb-1">
            {sections.map(s => (
              <button key={s.id} onClick={() => scrollToSection(s.id)}
                className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  activeSection === s.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground hover:bg-accent"
                )}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div ref={scrollRef} className="overflow-y-auto flex-1 no-scrollbar">
          <div className="flex gap-6 p-8">
            {/* Main column */}
            <div className="flex-1 min-w-0 space-y-6">

              {/* ── OVERVIEW ── */}
              <section ref={setSectionRef("overview")} className="space-y-6">
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

                {/* AI Summary */}
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
                      {changeEvent && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[hsl(38_92%_95%)] px-2.5 py-1 text-xs font-medium text-[hsl(38_92%_40%)]">
                          <Activity className="h-3 w-3 text-[hsl(38_92%_50%)]" />
                          Переоценён: {levelLabelsRu[changeEvent.previousLevel]} → {levelLabelsRu[changeEvent.currentLevel]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary strip */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground">
                    <Target className="h-3 w-3 text-muted-foreground" />
                    Риски: {manifestationsData.length}
                  </div>
                  {highCount > 0 && (
                    <div className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--risk-high-bg))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--risk-high))]">
                      Высокий: {highCount}
                    </div>
                  )}
                  {mediumCount > 0 && (
                    <div className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--risk-medium-bg))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--risk-medium))]">
                      Средний: {mediumCount}
                    </div>
                  )}
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-semibold text-foreground">Проявления рисков</h2>
                    <span className="text-xs text-muted-foreground">
                      {manifestationsData.length > 0 ? `${manifestationsData.length} рисков` : ""}
                    </span>
                  </div>
                  {manifestationsData.length > 0 && (
                    <div className="flex items-center gap-2">
                      {highCount > 0 && <span className="inline-flex items-center rounded-full bg-[hsl(var(--risk-high-bg))] text-[hsl(var(--risk-high))] px-2 py-0.5 text-xs font-medium">High {highCount}</span>}
                      {mediumCount > 0 && <span className="inline-flex items-center rounded-full bg-[hsl(var(--risk-medium-bg))] text-[hsl(var(--risk-medium))] px-2 py-0.5 text-xs font-medium">Medium {mediumCount}</span>}
                      {lowCount > 0 && <span className="inline-flex items-center rounded-full bg-[hsl(var(--risk-low-bg))] text-[hsl(var(--risk-low))] px-2 py-0.5 text-xs font-medium">Low {lowCount}</span>}
                    </div>
                  )}
                </div>

                {manifestationsData.length > 0 ? (
                  <>
                    <div className="space-y-2 transition-all duration-300">
                      {(manifestationsExpanded ? manifestationsData : previewManifestations).map((m, i) => {
                        const mStatus = statuses[i] || "pending";
                        return (
                          <div key={i} className="rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <button
                                    onClick={() => onOpenRisk?.(m.riskId)}
                                    className="text-sm font-medium text-foreground hover:text-[hsl(var(--primary))] transition-colors"
                                  >
                                    {m.risk.name}
                                  </button>
                                  <RiskBadge level={m.level} />
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">{m.comment}</p>
                                <button
                                  onClick={() => onOpenRisk?.(m.riskId)}
                                  className="text-xs text-muted-foreground hover:text-[hsl(var(--primary))] transition-colors"
                                >
                                  Корп. риск: {m.risk.name} →
                                </button>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {mStatus === "pending" && (
                                  <>
                                    <button
                                      onClick={() => setManifestationStatus(i, "accepted")}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                                    >
                                      <Check className="h-3 w-3" />
                                      Принять оценку
                                    </button>
                                    <button
                                      onClick={() => setManifestationStatus(i, "rejected")}
                                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      <XCircle className="h-3 w-3" />
                                      Не согласен
                                    </button>
                                  </>
                                )}
                                {mStatus === "accepted" && (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--status-active-bg))] text-[hsl(var(--status-active))] px-2.5 py-1 text-xs font-medium">
                                    <Check className="h-3 w-3" />
                                    Учтён в корп. риске
                                  </span>
                                )}
                                {mStatus === "rejected" && (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground px-2.5 py-1 text-xs font-medium">
                                    <XCircle className="h-3 w-3" />
                                    Отклонён
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
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
                  <div className="flex justify-between"><span className="text-muted-foreground">Тип</span><span className="font-medium text-foreground">{typeLabels[obj.type]}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Статус</span><StatusBadge status={obj.status} /></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Последняя оценка</span><span className="text-foreground">{obj.lastAssessment ?? "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Риски</span><span className="text-foreground">{manifestationsData.length}</span></div>
                </div>
              </div>

              <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
                Запустить оценку
              </button>

              {history.length > 0 && (
                <button className="w-full flex items-center justify-between rounded-xl border border-border bg-card p-5 hover:shadow-sm transition-shadow">
                  <span className="text-sm font-medium text-foreground">История версий</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="border-t border-border px-8 py-4 flex items-center justify-end gap-3">
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">Отменить</button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
            <Check className="h-4 w-4" />
            Принять оценку
          </button>
        </div>
      </div>
    </div>
  );
}
