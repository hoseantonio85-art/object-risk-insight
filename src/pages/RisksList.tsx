import { useState } from "react";
import { Search, SlidersHorizontal, Sparkles, ChevronDown, Users, ShieldAlert } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import { useModalStack } from "@/contexts/ModalStackContext";
import { cn } from "@/lib/utils";
import { type RiskType } from "@/data/mock";

type RiskStatus = "new" | "in_progress" | "resolved";

interface RiskEntry {
  id: string;
  code: string;
  name: string;
  level: "high" | "medium" | "low";
  status: RiskStatus;
  potentialLoss: string;
  actualLoss: string;
  strategy: string;
  recommendations: number;
  measures: number;
  organization: string;
  riskType: RiskType;
}

const statusConfig: Record<RiskStatus, { label: string; className: string }> = {
  new: { label: "Новый", className: "bg-[hsl(200_80%_95%)] text-[hsl(200_80%_40%)]" },
  in_progress: { label: "В работе", className: "bg-[hsl(38_92%_95%)] text-[hsl(38_92%_50%)]" },
  resolved: { label: "Решён", className: "bg-[hsl(152_60%_95%)] text-[hsl(152_60%_40%)]" },
};

const mockRisks: RiskEntry[] = [
  {
    id: "r1", code: "RSC-426846648",
    name: "Прекращение поставок сырья из-за санкций или логистических проблем",
    level: "high", status: "new", riskType: "operational",
    potentialLoss: "1 502 620 ₽", actualLoss: "1 502 620 ₽", strategy: "Снизить",
    recommendations: 2, measures: 2,
    organization: 'ООО "Тестовая компания" / ... / Отдел технического сопровождения',
  },
  {
    id: "r2", code: "RSC-426846648",
    name: "Прекращение поставок сырья из-за санкций или логистических проблем",
    level: "medium", status: "new", riskType: "operational",
    potentialLoss: "1 502 620 ₽", actualLoss: "1 502 620 ₽", strategy: "Снизить",
    recommendations: 0, measures: 2,
    organization: 'ООО "Тестовая компания" / ... / Отдел технического сопровождения',
  },
  {
    id: "r3", code: "RSC-426846648",
    name: "Прекращение поставок сырья из-за санкций или логистических проблем",
    level: "medium", status: "new", riskType: "operational",
    potentialLoss: "1 502 620 ₽", actualLoss: "1 502 620 ₽", strategy: "Снизить",
    recommendations: 1, measures: 3,
    organization: 'ООО "Тестовая компания" / ... / Отдел технического сопровождения',
  },
  {
    id: "r4", code: "RSC-426846648",
    name: "Утечка персональных данных клиентов через внешний API",
    level: "high", status: "in_progress", riskType: "operational",
    potentialLoss: "3 200 000 ₽", actualLoss: "0 ₽", strategy: "Избежать",
    recommendations: 4, measures: 1,
    organization: 'ООО "Тестовая компания" / ... / Отдел информационной безопасности',
  },
  // Behavior risks
  {
    id: "br1", code: "BHV-100001",
    name: "Подключение без ведома клиента",
    level: "high", status: "new", riskType: "behavior",
    potentialLoss: "—", actualLoss: "—", strategy: "Снизить",
    recommendations: 3, measures: 1,
    organization: 'ООО "Тестовая компания" / ... / Отдел продуктового комплаенса',
  },
  {
    id: "br2", code: "BHV-100002",
    name: "Unfair disclosure",
    level: "medium", status: "new", riskType: "behavior",
    potentialLoss: "—", actualLoss: "—", strategy: "Снизить",
    recommendations: 2, measures: 0,
    organization: 'ООО "Тестовая компания" / ... / Отдел продуктового комплаенса',
  },
  {
    id: "br4", code: "BHV-100004",
    name: "Unsuitable product sale",
    level: "high", status: "in_progress", riskType: "behavior",
    potentialLoss: "—", actualLoss: "—", strategy: "Избежать",
    recommendations: 2, measures: 1,
    organization: 'ООО "Тестовая компания" / ... / Отдел продуктового комплаенса',
  },
];

const tabs = ["Активные риски", "Анализ рисков", "Архив"] as const;

type TypeFilter = "all" | "operational" | "behavior";
const typeFilters: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Все риски" },
  { value: "operational", label: "Операционные" },
  { value: "behavior", label: "Поведенческие" },
];

const alertCards = [
  { title: "Новые риски", description: "Норм обнаружил новые риски, можешь ознакомиться с ними.", count: 4, color: "hsl(38 92% 50%)" },
  { title: "Высокий уровень риска", description: "Обрати внимание на рекомендации от Норма и прими решения по рискам.", count: 1, color: "hsl(0 72% 51%)" },
  { title: "Переоценено", description: "Норм скорректировал оценку риска на основе новых данных.", count: 2, color: "hsl(152 60% 40%)" },
];

export default function RisksList() {
  const [activeTab, setActiveTab] = useState<string>("Активные риски");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const { openRisk } = useModalStack();

  const filteredRisks = typeFilter === "all"
    ? mockRisks
    : mockRisks.filter((r) => r.riskType === typeFilter);

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            <span className="text-muted-foreground mr-1">—</span>Все риски
          </h1>
          <span className="text-muted-foreground text-base">1002</span>
          <span className="text-muted-foreground text-sm">ⓘ</span>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full border border-[hsl(152_60%_40%)] text-[hsl(152_60%_40%)] px-5 py-2 text-sm font-medium hover:bg-[hsl(152_60%_95%)] transition-colors">
          <Sparkles className="h-4 w-4" />
          Выявить новые риски
        </button>
      </div>

      {/* Tabs + Type Filter + Search/Filter */}
      <div className="flex items-center justify-between animate-fade-up stagger-1">
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                  activeTab === tab
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Type filter chips */}
          <div className="flex gap-1 ml-2">
            {typeFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  typeFilter === f.value
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <Search className="h-4 w-4" />
          </button>
          <button className="inline-flex items-center gap-2 h-9 rounded-lg border border-border px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
            Фильтр
          </button>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-3 gap-4 animate-fade-up stagger-2">
        {alertCards.map((card, i) => (
          <div
            key={i}
            className="relative rounded-xl border border-border bg-card p-5 pr-12 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div
              className="absolute top-4 right-4 h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: card.color }}
            >
              {card.count}
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">{card.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Risk Cards */}
      <div className="space-y-4 animate-fade-up stagger-3">
        {filteredRisks.map((risk) => (
          <div
            key={risk.id}
            className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => openRisk(risk.id)}
          >
            {/* Top row: badges + code */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <RiskBadge level={risk.level} />
                <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", statusConfig[risk.status].className)}>
                  {statusConfig[risk.status].label}
                </span>
                {risk.riskType === "behavior" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(270_60%_95%)] text-[hsl(270_60%_40%)] px-2.5 py-0.5 text-xs font-medium">
                    <ShieldAlert className="h-3 w-3" />
                    Поведенческий
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground font-mono">{risk.code}</span>
            </div>

            {/* Title */}
            <h3 className="text-base font-medium text-foreground mb-4">{risk.name}</h3>

            {/* Metrics row */}
            <div className="flex gap-12 mb-4">
              {risk.riskType === "operational" ? (
                <>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Потенциальные потери</div>
                    <div className="text-sm font-semibold text-foreground">{risk.potentialLoss}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Фактические потери</div>
                    <div className="text-sm font-semibold text-foreground">{risk.actualLoss}</div>
                  </div>
                </>
              ) : (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Проявления в продуктах</div>
                  <div className="text-sm font-semibold text-foreground">
                    {risk.id === "br1" ? "3 продукта" : risk.id === "br2" ? "2 продукта" : "2 продукта"}
                  </div>
                </div>
              )}
              <div>
                <div className="text-xs text-muted-foreground mb-1">Стратегия реагирования</div>
                <div className="inline-flex items-center rounded-md border border-border px-2.5 py-0.5 text-xs font-medium text-foreground">
                  {risk.strategy}
                </div>
              </div>
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === risk.id ? null : risk.id); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expandedId === risk.id && "rotate-180")} />
                  Описание
                </button>
                {risk.recommendations > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(270_60%_95%)] text-[hsl(270_60%_40%)] px-2.5 py-0.5 text-xs font-medium">
                    <Sparkles className="h-3 w-3" />
                    Рекомендации: {risk.recommendations}
                  </span>
                )}
                <span className="text-xs text-muted-foreground font-medium">
                  Меры: {risk.measures}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {risk.organization}
              </div>
            </div>

            {/* Expanded description */}
            {expandedId === risk.id && (
              <div className="mt-3 pt-3 border-t border-border text-sm text-muted-foreground leading-relaxed animate-fade-in">
                Описание риска и дополнительная информация о потенциальных последствиях и рекомендуемых мерах реагирования.
              </div>
            )}
          </div>
        ))}
        {filteredRisks.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">Нет рисков в выбранной категории</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3">
        <button className="inline-flex items-center gap-2 rounded-full bg-[hsl(160_60%_65%)] hover:bg-[hsl(160_60%_55%)] text-white px-8 py-3 text-sm font-medium shadow-lg transition-colors">
          Зарегистрировать риск
        </button>
      </div>
    </div>
  );
}
