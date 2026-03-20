import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RiskBadge } from "@/components/RiskBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { getObjectsByType, ObjectType, RiskLevel, AssessmentStatus, typeLabels } from "@/data/mock";

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

const typeConfig: Record<ObjectType, { title: string; pathSegment: string }> = {
  product: { title: "Продукты", pathSegment: "products" },
  counterparty: { title: "Контрагенты", pathSegment: "counterparties" },
  contract: { title: "Договоры", pathSegment: "contracts" },
  "ai-agent": { title: "AI-агенты", pathSegment: "ai-agents" },
};

export default function ObjectList({ objectType }: { objectType: ObjectType }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRisk = (searchParams.get("risk") as RiskLevel) || "all";

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">(initialRisk);
  const [statusFilter, setStatusFilter] = useState<AssessmentStatus | "all">("all");

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
      <h1 className="text-2xl font-semibold text-foreground tracking-tight animate-fade-up">{config.title}</h1>

      {/* Filters */}
      <div className="flex items-center gap-3 animate-fade-up stagger-1">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value as any)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {riskOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

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
              <tr
                key={obj.id}
                onClick={() => navigate(`/objects/${config.pathSegment}/${obj.id}`)}
                className="border-b border-border last:border-0 cursor-pointer hover:bg-accent/50 transition-colors active:scale-[0.998]"
              >
                <td className="px-4 py-3 font-medium text-foreground">{obj.name}</td>
                <td className="px-4 py-3"><RiskBadge level={obj.riskLevel} /></td>
                <td className="px-4 py-3"><StatusBadge status={obj.status} /></td>
                <td className="px-4 py-3 text-muted-foreground tabular-nums">{obj.lastAssessment ?? "—"}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Ничего не найдено</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
