import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, Package, Users, FileText, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/RiskBadge";
import { objects, typeLabels, typePaths } from "@/data/mock";

const recentAssessments = objects
  .filter((o) => o.lastAssessment)
  .sort((a, b) => (b.lastAssessment! > a.lastAssessment! ? 1 : -1))
  .slice(0, 6);

const highRiskProducts = objects.filter((o) => o.type === "product" && o.riskLevel === "high").length;
const counterpartiesNeedCheck = objects.filter((o) => o.type === "counterparty" && (o.riskLevel === "high" || o.status === "stale")).length;

const typeCards = [
  { type: "product" as const, label: "Продукты", icon: Package, count: objects.filter((o) => o.type === "product").length },
  { type: "counterparty" as const, label: "Контрагенты", icon: Users, count: objects.filter((o) => o.type === "counterparty").length },
  { type: "contract" as const, label: "Договоры", icon: FileText, count: objects.filter((o) => o.type === "contract").length },
  { type: "ai-agent" as const, label: "AI-агенты", icon: Bot, count: objects.filter((o) => o.type === "ai-agent").length },
];

export default function ObjectsOverview() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight text-balance">Оценка объектов</h1>
        <Button size="sm">Запустить оценку</Button>
      </div>

      {/* Attention */}
      <section className="animate-fade-up stagger-1">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Требуют внимания</h2>
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => navigate("/objects/products?risk=high")}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 cursor-pointer transition-shadow hover:shadow-md active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-risk-high-bg">
              <AlertTriangle className="h-5 w-5 text-risk-high" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{highRiskProducts} продукта с высоким риском</p>
              <p className="text-xs text-muted-foreground mt-0.5">Требуется проверка</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div
            onClick={() => navigate("/objects/counterparties?risk=high")}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 cursor-pointer transition-shadow hover:shadow-md active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-risk-medium-bg">
              <Users className="h-5 w-5 text-risk-medium" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{counterpartiesNeedCheck} контрагента требуют проверки</p>
              <p className="text-xs text-muted-foreground mt-0.5">Устаревшая оценка или высокий риск</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </section>

      {/* Recent assessments */}
      <section className="animate-fade-up stagger-2">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Последние оценки</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {recentAssessments.map((obj, i) => (
            <div
              key={obj.id}
              onClick={() => navigate(`/objects/${typePaths[obj.type]}/${obj.id}`)}
              className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-accent/50 transition-colors active:scale-[0.998] ${
                i < recentAssessments.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-medium text-foreground truncate">{obj.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">{typeLabels[obj.type]}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <RiskBadge level={obj.riskLevel} />
                <span className="text-xs text-muted-foreground tabular-nums">{obj.lastAssessment}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Object types */}
      <section className="animate-fade-up stagger-3">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Типы объектов</h2>
        <div className="grid grid-cols-4 gap-3">
          {typeCards.map((tc) => (
            <div
              key={tc.type}
              onClick={() => navigate(`/objects/${typePaths[tc.type]}`)}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 cursor-pointer transition-shadow hover:shadow-md active:scale-[0.98]"
            >
              <tc.icon className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm font-medium text-foreground">{tc.label}</span>
              <span className="text-xs text-muted-foreground">{tc.count} объектов</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
