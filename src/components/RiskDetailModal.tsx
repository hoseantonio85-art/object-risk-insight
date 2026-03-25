import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, ChevronRight, ChevronDown, AlertTriangle, Info, Shield, FileText,
  Sparkles, Bot, User, Newspaper, Scale, CircleAlert, CircleDot, Target,
  ExternalLink, TrendingUp, Clock, Activity, ShieldAlert
} from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import { risks, getManifestationsForRisk, typeLabels, riskTypeLabels } from "@/data/mock";
import { cn } from "@/lib/utils";

/* ─── Source analysis mock data ─── */
interface AnalysisSource {
  type: "law" | "news" | "document" | "ai-agent" | "manual";
  title: string;
  description: string;
  effect: string;
  date: string;
}

const sourceIcons: Record<AnalysisSource["type"], React.ElementType> = {
  law: Scale, news: Newspaper, document: FileText, "ai-agent": Bot, manual: User,
};
const sourceLabels: Record<AnalysisSource["type"], string> = {
  law: "Закон", news: "Новость", document: "Документ", "ai-agent": "AI агент", manual: "Ручная оценка",
};

const mockSources: Record<string, AnalysisSource[]> = {
  r1: [
    { type: "law", title: "Ужесточение ФЗ-152 о персональных данных", description: "Новые требования к хранению и обработке ПДн вступают в силу с 01.06.2026", effect: "+2 продукта перешли в высокий уровень риска", date: "15.03.2026" },
    { type: "ai-agent", title: "NORM AI: переоценка скоринга", description: "Автоматический анализ выявил новые уязвимости в API мобильного банка", effect: "Уровень риска повышен с среднего до высокого", date: "14.03.2026" },
    { type: "news", title: "Утечка данных в компании-аналоге", description: "Крупная утечка ПДн в финтех-секторе привлекла внимание регулятора", effect: "Рекомендовано провести внеплановый аудит", date: "12.03.2026" },
  ],
  r3: [
    { type: "law", title: "Обновление требований ЦБ", description: "Новые стандарты комплаенс для финансовых организаций", effect: "+1 договор требует проверки", date: "10.03.2026" },
    { type: "manual", title: "Аудит отдела комплаенс", description: "Плановая проверка выявила несоответствия в процедурах", effect: "Риск переоценён на основе новых данных", date: "08.03.2026" },
  ],
  r5: [
    { type: "ai-agent", title: "NORM AI: bias-тест скоринг-модели", description: "Выявлена систематическая предвзятость в возрастной когорте 18-25", effect: "Модель помечена для переобучения", date: "18.03.2026" },
    { type: "document", title: "Отчёт внешнего аудитора", description: "Независимая проверка подтвердила наличие bias", effect: "Уровень риска подтверждён как высокий", date: "16.03.2026" },
  ],
  br1: [
    { type: "ai-agent", title: "NORM AI: анализ продуктовых потоков", description: "Выявлены паттерны автоматической активации без согласия клиента", effect: "+3 продукта с проявлениями", date: "20.03.2026" },
    { type: "law", title: "Указание ЦБ по защите прав потребителей", description: "Новые требования к раскрытию информации о подключаемых услугах", effect: "Риск повышен до высокого уровня", date: "18.03.2026" },
  ],
  br2: [
    { type: "document", title: "Отчёт тайного покупателя", description: "Выявлены несоответствия в раскрытии условий тарифов", effect: "+2 продукта с проявлениями", date: "19.03.2026" },
  ],
  br4: [
    { type: "ai-agent", title: "NORM AI: анализ рекомендаций", description: "Скоринг-модель рекомендует неподходящие продукты клиентам с низким доходом", effect: "Уровень риска подтверждён как высокий", date: "17.03.2026" },
    { type: "news", title: "Штраф банку за мисселинг", description: "Регулятор оштрафовал конкурента за навязывание кредитных продуктов", effect: "Рекомендована проверка продуктовых процессов", date: "15.03.2026" },
  ],
};

/* ─── Risk factors & consequences mock ─── */
const riskFactors: Record<string, string[]> = {
  r1: ["Нарушение регламентов защиты данных в условиях ужесточения требований ФЗ-420", "Зависимость от стабильности работы IT-инфраструктуры"],
  r3: ["Частые изменения регуляторных требований", "Недостаточная автоматизация комплаенс-процессов"],
  r5: ["Недостаточное качество обучающих данных", "Отсутствие регулярного bias-тестирования"],
  br1: ["Отсутствие явного opt-in при подключении платных опций", "Автоматическая активация при обновлении тарифного плана"],
  br2: ["Условия тарифов скрыты в сносках", "Комиссии не отображаются до подтверждения"],
  br4: ["Скоринг-модель не учитывает профиль клиента при рекомендациях", "Нет контроля соответствия продукта потребностям"],
};

const consequences: Record<string, string[]> = {
  r1: ["Штраф в размере до 5 000 000 руб. или до 4% годового оборота", "Репутационные потери и отток клиентов", "Судебные иски от пострадавших клиентов", "Временная приостановка лицензии на деятельность"],
  r3: ["Штрафные санкции от регулятора", "Ограничение деятельности до устранения нарушений"],
  r5: ["Дискриминационные решения по кредитным заявкам", "Репутационные риски при публичном раскрытии"],
  br1: ["Жалобы клиентов и обращения в ЦБ", "Штраф за нарушение прав потребителей", "Репутационные потери"],
  br4: ["Мисселинг и судебные иски от клиентов", "Предписание регулятора о приостановке продаж"],
};

/* ─── Measures mock ─── */
type MeasureStatus = "new" | "implemented";
interface Measure { id: string; title: string; code: string; date: string; status: MeasureStatus; impactPercent: number; objectsApplied: number; }

const measures: Record<string, Measure[]> = {
  r1: [
    { id: "m1", title: "Проведение тестирования на проникновение внешним подрядчиком", code: "MSR-171185", date: "05.03.2024", status: "new", impactPercent: 25, objectsApplied: 3 },
    { id: "m2", title: "Обновление политики парольной защиты", code: "MSR-171125", date: "15.01.2024", status: "implemented", impactPercent: 15, objectsApplied: 4 },
    { id: "m3", title: "Сегментация сети и разграничение доступа к базам данных", code: "MSR-171185", date: "28.01.2024", status: "implemented", impactPercent: 30, objectsApplied: 2 },
    { id: "m4", title: "Внедрение двухфакторной аутентификации для всех сотрудников", code: "MSR-171185", date: "10.02.2024", status: "implemented", impactPercent: 20, objectsApplied: 4 },
    { id: "m5", title: "Шифрование данных в состоянии покоя", code: "MSR-171185", date: "20.02.2024", status: "implemented", impactPercent: 10, objectsApplied: 2 },
  ],
  r3: [{ id: "m6", title: "Проведение аудита соответствия ФЗ-152", code: "MSR-171200", date: "01.03.2024", status: "new", impactPercent: 40, objectsApplied: 1 }],
  r5: [{ id: "m7", title: "Запуск bias-тестирования для скоринг-модели", code: "MSR-171210", date: "15.03.2024", status: "new", impactPercent: 50, objectsApplied: 2 }],
  br1: [
    { id: "bm1", title: "Внедрение двойного подтверждения при подключении услуг", code: "MSR-200001", date: "20.03.2026", status: "new", impactPercent: 40, objectsApplied: 3 },
  ],
  br4: [
    { id: "bm2", title: "Пересмотр алгоритма подбора продуктов в скоринг-модели", code: "MSR-200002", date: "18.03.2026", status: "new", impactPercent: 35, objectsApplied: 2 },
  ],
};

const measureStatusConfig: Record<MeasureStatus, { label: string; className: string }> = {
  new: { label: "Новая", className: "bg-[hsl(200_80%_95%)] text-[hsl(200_80%_40%)]" },
  implemented: { label: "Реализована", className: "bg-[hsl(152_60%_95%)] text-[hsl(152_60%_40%)]" },
};

/* ─── Utilization mock ─── */
interface UtilizationItem { label: string; amount: string; limit: string; percent: number; }
const utilization: Record<string, UtilizationItem[]> = {
  r1: [
    { label: "Прямые потери", amount: "1 340 500 ₽", limit: "12 000 000 ₽", percent: 11 },
    { label: "Косвенные потери", amount: "4 300 000 ₽", limit: "6 000 000 ₽", percent: 72 },
    { label: "Кредитные потери", amount: "250 500 ₽", limit: "1 000 000 000 ₽", percent: 1 },
  ],
};

/* ─── Change event mock data ─── */
interface ChangeEvent {
  previousLevel: "high" | "medium" | "low";
  currentLevel: "high" | "medium" | "low";
  previousStrategy?: string;
  currentStrategy?: string;
}

const changeEvents: Record<string, ChangeEvent> = {
  r1: { previousLevel: "medium", currentLevel: "high", previousStrategy: "Мониторинг", currentStrategy: "Снижение" },
  r5: { previousLevel: "medium", currentLevel: "high" },
  br1: { previousLevel: "medium", currentLevel: "high", previousStrategy: "Мониторинг", currentStrategy: "Снижение" },
};

const levelLabelsRu: Record<string, string> = {
  high: "Высокий", medium: "Средний", low: "Низкий", none: "Не выявлен",
};

/* ─── AI summaries mock ─── */
const aiSummaries: Record<string, string> = {
  r1: "Риск высокий из-за 2 продуктов с критическим уровнем после изменений в законодательстве. Требуется немедленная переоценка мер защиты данных.",
  r3: "Риск повышен после обновления требований ЦБ. 1 договор не соответствует новым стандартам комплаенс.",
  r5: "Выявлена систематическая предвзятость скоринг-модели. Необходимо переобучение и расширение выборки.",
  br1: "Риск высокий — подтверждён в 3 продуктах, включая 2 с критическими проявлениями. Рекомендуется проверить процессы подключения услуг и получения согласий.",
  br2: "Риск средний — выявлены несоответствия в раскрытии условий в 2 продуктах. Необходимо обновить интерфейсы оформления.",
  br3: "Риск низкий — обнаружен 1 случай навязывания дополнительного продукта. Мониторинг продолжается.",
  br4: "Риск высокий — скоринг-модель и CRM рекомендуют неподходящие продукты. Требуется пересмотр алгоритмов подбора.",
  br5: "Проявления не обнаружены. Риск оценён на основе внешних факторов.",
};

/* ─── Donut chart component ─── */
function MiniDonut({ percent, size = 40 }: { percent: number; size?: number }) {
  const r = (size - 6) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;
  const color = percent > 70 ? "hsl(38 92% 50%)" : percent > 30 ? "hsl(200 80% 50%)" : "hsl(152 60% 40%)";
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={3} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(-90 ${size / 2} ${size / 2})`} className="transition-all duration-700" />
    </svg>
  );
}

/* ─── Anchor nav sections ─── */
const sections = [
  { id: "overview", label: "Обзор" },
  { id: "manifestations", label: "Проявления" },
  { id: "sources", label: "Источники" },
  { id: "context", label: "Контекст" },
  { id: "measures", label: "Меры" },
  { id: "history", label: "История" },
] as const;

/* ─── Main Modal Component ─── */
interface RiskDetailModalProps { riskId: string; onClose: () => void; onOpenObject?: (id: string) => void; zIndex?: number; }

export function RiskDetailModal({ riskId, onClose, onOpenObject, zIndex = 50 }: RiskDetailModalProps) {
  const risk = risks.find((r) => r.id === riskId);
  const [riskLevelOpen, setRiskLevelOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [manifestationsExpanded, setManifestationsExpanded] = useState(false);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
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

  if (!risk) return null;

  const isBehavior = risk.riskType === "behavior";
  const manifestationsData = getManifestationsForRisk(risk.id);
  const sources = mockSources[risk.id] || [];
  const factors = riskFactors[risk.id] || [];
  const cons = consequences[risk.id] || [];
  const riskMeasures = measures[risk.id] || [];
  const util = isBehavior ? undefined : utilization[risk.id]; // hide utilization for behavior
  const hasReassessment = sources.some(s => s.effect.includes("переоценён"));
  const aiSummary = aiSummaries[risk.id] || `Риск ${risk.level === "high" ? "высокий" : risk.level === "medium" ? "средний" : "низкий"}. Требует внимания.`;
  const changeEvent = changeEvents[risk.id];

  const highCount = manifestationsData.filter(m => m.level === "high").length;
  const mediumCount = manifestationsData.filter(m => m.level === "medium").length;
  const lowCount = manifestationsData.filter(m => m.level === "low").length;

  const implementedCount = riskMeasures.filter(m => m.status === "implemented").length;
  const effectivenessPercent = riskMeasures.length > 0 ? Math.round((implementedCount / riskMeasures.length) * 100) : 0;

  const previewManifestations = manifestationsData.slice(0, 3);
  const previewSources = sources.slice(0, 3);

  return (
    <div className="fixed inset-0 flex items-start justify-center" style={{ zIndex }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-[1320px] max-h-[92vh] mt-[4vh] bg-background rounded-2xl shadow-2xl border border-border flex flex-col animate-in fade-in-0 zoom-in-95 duration-200">
        {/* ── Sticky Header ── */}
        <div className="sticky top-0 z-20 bg-background rounded-t-2xl border-b border-border px-8 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Риск</span>
                <span className="inline-flex items-center rounded-full bg-[hsl(var(--status-active-bg))] text-[hsl(var(--status-active))] px-2 py-0.5 text-xs font-medium">Активен</span>
                {isBehavior && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(270_60%_95%)] text-[hsl(270_60%_40%)] px-2 py-0.5 text-xs font-medium">
                    <ShieldAlert className="h-3 w-3" />
                    Поведенческий
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{risk.name}</h1>
              </div>
              <RiskBadge level={risk.level} />
            </div>
            <button onClick={onClose} className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <X className="h-4 w-4" />
            </button>
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

              {/* ── HERO / OVERVIEW ── */}
              <section ref={setSectionRef("overview")} className="space-y-6">
                {/* AI Summary Hero */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[hsl(270_60%_95%)] flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="h-4 w-4 text-[hsl(270_60%_50%)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-medium text-muted-foreground">AI-сводка</span>
                        <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-medium text-foreground">
                          {isBehavior ? "Мониторинг" : "Снижение"}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{aiSummary}</p>
                      {changeEvent && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[hsl(38_92%_95%)] px-2.5 py-1 text-xs font-medium text-[hsl(38_92%_40%)]">
                          <Activity className="h-3 w-3 text-[hsl(38_92%_50%)]" />
                          Переоценён: {levelLabelsRu[changeEvent.previousLevel]} → {levelLabelsRu[changeEvent.currentLevel]}
                          {changeEvent.previousStrategy && changeEvent.currentStrategy && (
                            <span> · Стратегия: {changeEvent.currentStrategy}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Risk Level Accordion */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <button onClick={() => setRiskLevelOpen(!riskLevelOpen)} className="w-full flex items-center justify-between p-5 hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-foreground">Уровень риска</span>
                      <RiskBadge level={risk.level} />
                      <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-medium text-foreground">
                        {isBehavior ? "Мониторинг" : "Снижение"}
                      </span>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", riskLevelOpen && "rotate-180")} />
                  </button>
                  {riskLevelOpen && (
                    <div className="px-5 pb-5 pt-0 space-y-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-3 gap-3 pt-4">
                        <div className="rounded-lg border border-border p-3">
                          <div className="text-xs text-muted-foreground mb-1.5">Вероятность</div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} className={cn("h-2 w-5 rounded-full", i <= 3 ? "bg-[hsl(var(--risk-medium))]" : "bg-muted")} />
                            ))}
                          </div>
                        </div>
                        <div className="rounded-lg border border-border p-3">
                          <div className="text-xs text-muted-foreground mb-1.5">Влияние на компанию</div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} className={cn("h-2 w-5 rounded-full", i <= 4 ? "bg-[hsl(var(--risk-high))]" : "bg-muted")} />
                            ))}
                          </div>
                        </div>
                        <div className="rounded-lg border border-border p-3">
                          <div className="text-xs text-muted-foreground mb-1.5">Стратегия реагирования</div>
                          <span className="inline-flex items-center rounded-md bg-[hsl(var(--risk-low-bg))] text-[hsl(var(--risk-low))] px-2 py-0.5 text-xs font-medium">
                            {isBehavior ? "Мониторинг" : "Снижение"}
                          </span>
                        </div>
                      </div>
                      {!isBehavior && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-2">Потенциальные потери</div>
                          <div className="grid grid-cols-3 gap-3">
                            {[{ l: "Прямые", v: "3 420 000 ₽" }, { l: "Косвенные", v: "3 420 000 ₽" }, { l: "Кредитные", v: "3 420 000 ₽" }].map((item, i) => (
                              <div key={i} className="rounded-lg border border-border p-3">
                                <div className="text-xs text-muted-foreground mb-1">{item.l}</div>
                                <div className="text-sm font-semibold text-foreground">{item.v}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Utilization — only for operational risks */}
                {util && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-foreground">Утилизация лимита</h2>
                      <button className="text-muted-foreground hover:text-foreground"><ExternalLink className="h-4 w-4" /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {util.map((item, i) => (
                        <div key={i} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                          <MiniDonut percent={item.percent} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-muted-foreground">{item.label}</span>
                              <span className="text-xs font-semibold text-foreground">{item.percent}%</span>
                            </div>
                            <div className="text-sm font-semibold text-foreground">{item.amount}</div>
                            <div className="text-xs text-muted-foreground">{item.limit}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── SUMMARY BLOCK ── */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground">
                    <Target className="h-3 w-3 text-muted-foreground" />
                    Проявления: {manifestationsData.length}
                  </div>
                  {highCount > 0 && (
                    <div className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--risk-high-bg))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--risk-high))]">
                      Высокий: {highCount}
                    </div>
                  )}
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    Меры: {riskMeasures.length}
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--status-active-bg))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--status-active))]">
                    <Activity className="h-3 w-3" />
                    Покрытие: {effectivenessPercent}%
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Обновлён: 2 дня назад
                  </div>
                </div>
              </section>

              {/* ── MANIFESTATIONS ── */}
              <section ref={setSectionRef("manifestations")} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-semibold text-foreground">
                      {isBehavior ? "Проявления в продуктах" : "Где проявляется"}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {manifestationsData.length > 0 ? `в ${manifestationsData.length} объектах` : ""}
                    </span>
                  </div>
                  {manifestationsData.length > 0 && (
                    <div className="flex items-center gap-2">
                      {highCount > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--risk-high-bg))] text-[hsl(var(--risk-high))] px-2 py-0.5 text-xs font-medium">Высокий {highCount}</span>}
                      {mediumCount > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--risk-medium-bg))] text-[hsl(var(--risk-medium))] px-2 py-0.5 text-xs font-medium">Средний {mediumCount}</span>}
                      {lowCount > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--risk-low-bg))] text-[hsl(var(--risk-low))] px-2 py-0.5 text-xs font-medium">Низкий {lowCount}</span>}
                    </div>
                  )}
                </div>

                {manifestationsData.length > 0 ? (
                  <>
                    <div className="space-y-2 transition-all duration-300">
                      {(manifestationsExpanded ? manifestationsData : previewManifestations).map((m, i) => (
                        <div key={i} onClick={() => onOpenObject?.(m.object.id)}
                          className="flex items-center justify-between rounded-xl border border-border bg-card p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">{typeLabels[m.object.type]}</span>
                            <span className="text-sm font-medium text-foreground">{m.object.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">Вклад: {Math.round((1 / manifestationsData.length) * 100)}%</span>
                            <RiskBadge level={m.level} />
                          </div>
                        </div>
                      ))}
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
                    <p className="text-sm font-medium text-foreground mb-1">Проявления не обнаружены</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {isBehavior
                        ? "Риск оценён на основе внешних факторов или продукты ещё не прошли оценку"
                        : "Риск оценён на основе внешних факторов или ещё не проведена оценка объектов"}
                    </p>
                    <button className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors">
                      {isBehavior ? "Оценить продукты" : "Проверить объекты"}
                    </button>
                  </div>
                )}
              </section>

              {/* ── ANALYSIS SOURCES ── */}
              <section ref={setSectionRef("sources")} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">Источники анализа</h2>
                </div>
                {hasReassessment && (
                  <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--risk-medium-bg))] border border-[hsl(38_92%_85%)] px-4 py-2.5">
                    <TrendingUp className="h-4 w-4 text-[hsl(var(--risk-medium))]" />
                    <span className="text-sm text-[hsl(38_92%_40%)]">Риск переоценён на основе новых данных</span>
                  </div>
                )}
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
                    {sources.length > 3 && (
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

              {/* ── CONTEXT (description + factors + consequences) ── */}
              <section ref={setSectionRef("context")} className="space-y-4">
                <h2 className="text-sm font-semibold text-foreground">Контекст риска</h2>

                {/* Description */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Описание</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{risk.description}</p>
                </div>

                {/* Factors */}
                {factors.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <CircleAlert className="h-4 w-4 text-[hsl(var(--primary))]" />
                      <span className="text-xs font-medium text-muted-foreground">Риск-факторы</span>
                    </div>
                    <div className="space-y-2">
                      {factors.map((f, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] mt-1.5 shrink-0" />
                          <span className="text-sm text-foreground">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Consequences */}
                {cons.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-[hsl(var(--risk-high))]" />
                      <span className="text-xs font-medium text-muted-foreground">Возможные последствия</span>
                    </div>
                    <div className="space-y-2">
                      {cons.map((c, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--risk-high))] mt-1.5 shrink-0" />
                          <span className="text-sm text-foreground">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* ── MEASURES ── */}
              <section ref={setSectionRef("measures")} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">Меры</h2>
                  <button className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Добавить меру <span className="text-lg leading-none">+</span>
                  </button>
                </div>
                {riskMeasures.length > 0 && (
                  <div className="flex items-center gap-4 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Эффективность мер</span>
                      <span className="inline-flex items-center rounded-full bg-[hsl(200_80%_95%)] text-[hsl(200_80%_40%)] px-2 py-0.5 text-xs font-semibold">{effectivenessPercent}%</span>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {riskMeasures.map((measure) => (
                    <div key={measure.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center gap-3">
                        <CircleDot className={cn("h-4 w-4", measure.status === "implemented" ? "text-[hsl(var(--risk-low))]" : "text-[hsl(var(--primary))]")} />
                        <div>
                          <div className="text-sm font-medium text-foreground">{measure.title}</div>
                          <div className="text-xs text-muted-foreground">{measure.code} · {measure.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">−{measure.impactPercent}% риск</span>
                        <span className="text-xs text-muted-foreground">{measure.objectsApplied} объект.</span>
                        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", measureStatusConfig[measure.status].className)}>
                          {measureStatusConfig[measure.status].label}
                        </span>
                      </div>
                    </div>
                  ))}
                  {riskMeasures.length === 0 && (
                    <div className="rounded-xl border border-border bg-card p-5 text-center">
                      <p className="text-sm text-muted-foreground">Меры не назначены</p>
                    </div>
                  )}
                </div>
              </section>

              {/* ── HISTORY ── */}
              <section ref={setSectionRef("history")} className="space-y-3 pb-4">
                <h2 className="text-sm font-semibold text-foreground">Подразделение владельца риска</h2>
                <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                    <CircleDot className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground">
                    {isBehavior
                      ? "ДубльКИС / Отдел продуктового комплаенса"
                      : "ДубльКИС / Департамент исследований и разработок / Управление информационных технологий"}
                  </span>
                </div>
              </section>
            </div>

            {/* ── Right sidebar ── */}
            <div className="w-[260px] shrink-0 space-y-4">
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Информация</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Риск</span><span className="font-medium text-foreground font-mono">{riskId.startsWith("br") ? "BHV-" : "RSK-"}41242001</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Тип</span><span className="font-medium text-foreground">{riskTypeLabels[risk.riskType]}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Создан</span><span className="text-foreground">01 февраля 2024</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Обновлён</span><span className="text-foreground">19 марта 2026</span></div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Автор</span>
                    <span className="flex items-center gap-1.5 text-foreground">
                      <span className="h-4 w-4 rounded-full bg-[hsl(var(--risk-low))] flex items-center justify-center"><Bot className="h-2.5 w-2.5 text-white" /></span>
                      NORM AI
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Источник</span>
                    <span className="flex items-center gap-1.5 text-foreground">
                      <span className="h-4 w-4 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white text-[8px] font-bold">AC</span>
                      АС Сенат
                    </span>
                  </div>
                </div>
              </div>

              <button className="w-full flex items-center justify-between rounded-xl border border-border bg-card p-5 hover:shadow-sm transition-shadow">
                <span className="text-sm font-medium text-foreground">История изменений</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              <button className="w-full flex items-center justify-between rounded-xl border border-border bg-card p-5 hover:shadow-sm transition-shadow">
                <span className="text-sm font-medium text-foreground">Добавить меру</span>
                <span className="text-lg text-muted-foreground">+</span>
              </button>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="border-t border-border px-8 py-4 flex items-center justify-between">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">Удалить</button>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">В архив</button>
          </div>
        </div>
      </div>
    </div>
  );
}
