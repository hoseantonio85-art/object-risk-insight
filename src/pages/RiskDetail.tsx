import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import { risks, getManifestationsForRisk, typeLabels, typePaths } from "@/data/mock";

export default function RiskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const risk = risks.find((r) => r.id === id);
  if (!risk) return <div className="py-12 text-center text-muted-foreground">Риск не найден</div>;

  const manifestationsData = getManifestationsForRisk(risk.id);

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          Назад
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">{risk.name}</h1>
          <RiskBadge level={risk.level} />
        </div>
      </div>

      {/* Manifestations */}
      <section className="space-y-3 animate-fade-up stagger-1">
        <h2 className="text-sm font-medium text-muted-foreground">Где проявляется</h2>
        <div className="space-y-2">
          {manifestationsData.map((m, i) => (
            <div
              key={i}
              onClick={() => navigate(`/objects/${typePaths[m.object.type]}/${m.object.id}`)}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">{m.object.name}</span>
                <span className="text-xs text-muted-foreground">{typeLabels[m.object.type]}</span>
              </div>
              <RiskBadge level={m.level} />
            </div>
          ))}
        </div>
      </section>

      {/* Description */}
      <section className="space-y-3 animate-fade-up stagger-2">
        <h2 className="text-sm font-medium text-muted-foreground">Описание</h2>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-foreground leading-relaxed">{risk.description}</p>
        </div>
      </section>

      {/* Measures placeholder */}
      <section className="space-y-3 animate-fade-up stagger-3">
        <h2 className="text-sm font-medium text-muted-foreground">Меры</h2>
        <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Меры управления риском ещё не назначены
        </div>
      </section>
    </div>
  );
}
