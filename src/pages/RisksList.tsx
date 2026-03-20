import { useNavigate } from "react-router-dom";
import { RiskBadge } from "@/components/RiskBadge";
import { risks } from "@/data/mock";

export default function RisksList() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground tracking-tight animate-fade-up">Риски</h1>

      <div className="rounded-xl border border-border bg-card overflow-hidden animate-fade-up stagger-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Название</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Уровень</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Проявления</th>
            </tr>
          </thead>
          <tbody>
            {risks.map((risk) => (
              <tr
                key={risk.id}
                onClick={() => navigate(`/risks/${risk.id}`)}
                className="border-b border-border last:border-0 cursor-pointer hover:bg-accent/50 transition-colors active:scale-[0.998]"
              >
                <td className="px-4 py-3 font-medium text-foreground">{risk.name}</td>
                <td className="px-4 py-3"><RiskBadge level={risk.level} /></td>
                <td className="px-4 py-3 text-muted-foreground tabular-nums">{risk.manifestations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
