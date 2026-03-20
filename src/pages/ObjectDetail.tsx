import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/RiskBadge";
import { objects, getManifestationsForObject, assessmentHistory, typeLabels } from "@/data/mock";
import { cn } from "@/lib/utils";

const tabs = ["Обзор", "Оценка рисков"] as const;

export default function ObjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("Обзор");

  const obj = objects.find((o) => o.id === id);
  if (!obj) return <div className="py-12 text-center text-muted-foreground">Объект не найден</div>;

  const manifestationsData = getManifestationsForObject(obj.id);
  const history = assessmentHistory[obj.id] || [];

  const aiSummaries: Record<string, string> = {
    p1: "CRM-система содержит критические риски в области защиты данных. Рекомендуется немедленный аудит механизмов шифрования и контроля доступа.",
    p2: "Мобильное приложение использует устаревший API для передачи данных. Высокий приоритет обновления до актуальной версии протокола.",
    p5: "Data Lake имеет неконтролируемый доступ аналитиков к сырым данным. Необходимо внедрить ролевую модель доступа.",
    a2: "Скоринг-модель демонстрирует предвзятость по возрастному признаку. Требуется ретренинг на сбалансированной выборке.",
  };

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="animate-fade-up">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          Назад
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">{obj.name}</h1>
            <RiskBadge level={obj.riskLevel} />
          </div>
          <Button size="sm">Запустить оценку</Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{typeLabels[obj.type]}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border animate-fade-up stagger-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "Обзор" && (
        <div className="space-y-6 animate-fade-up">
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">О объекте</h3>
            <p className="text-sm text-foreground">{obj.description || "Описание не указано."}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Текущий уровень риска</h3>
            <div className="flex items-center gap-3">
              <RiskBadge level={obj.riskLevel} />
              <span className="text-sm text-muted-foreground">Последняя оценка: {obj.lastAssessment ?? "нет"}</span>
            </div>
          </div>
          {aiSummaries[obj.id] && (
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium text-muted-foreground">AI-вывод</h3>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{aiSummaries[obj.id]}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "Оценка рисков" && (
        <div className="space-y-6 animate-fade-up">
          {/* Summary */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Саммари</h3>
            <div className="flex items-center gap-3">
              <RiskBadge level={obj.riskLevel} />
            </div>
            {aiSummaries[obj.id] && (
              <p className="text-sm text-foreground leading-relaxed">{aiSummaries[obj.id]}</p>
            )}
          </div>

          {/* Risk manifestations */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Проявления рисков</h3>
            {manifestationsData.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">Нет проявлений рисков</div>
            ) : (
              <div className="space-y-2">
                {manifestationsData.map((m, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-4 flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/risks/${m.riskId}`)}
                          className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {m.risk.name}
                        </button>
                        <RiskBadge level={m.level} />
                      </div>
                      <p className="text-xs text-muted-foreground">{m.comment}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => navigate(`/risks/${m.riskId}`)}
                        className="text-xs text-primary hover:underline"
                      >
                        Открыть риск
                      </button>
                      <button className="text-xs text-muted-foreground hover:text-foreground">Принять меры</button>
                      <button className="text-xs text-muted-foreground hover:text-foreground">Не согласен</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assessment history */}
          {history.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">История оценок</h3>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-4 py-3 ${i < history.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <span className="text-sm text-foreground tabular-nums">{h.date}</span>
                    <span className="text-xs text-muted-foreground">{h.type === "AI" ? "AI-оценка" : "Ручная"}</span>
                    <RiskBadge level={h.level} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
