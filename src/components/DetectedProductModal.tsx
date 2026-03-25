import { useState } from "react";
import { X, Sparkles, Link2, Plus, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { objects, lifecycleLabels, type ProductLifecycle } from "@/data/mock";
import type { DetectedProduct } from "@/data/detectedProducts";

const lifecycleStyleMap: Record<ProductLifecycle, string> = {
  planned: "bg-[hsl(var(--lifecycle-planned-bg))] text-[hsl(var(--lifecycle-planned))]",
  active: "bg-[hsl(var(--lifecycle-active-bg))] text-[hsl(var(--lifecycle-active))]",
  closed: "bg-[hsl(var(--lifecycle-closed-bg))] text-[hsl(var(--lifecycle-closed))]",
};

interface DetectedProductModalProps {
  product: DetectedProduct;
  onClose: () => void;
  onLinked: (detectedId: string, existingId: string) => void;
  onContinueAsNew: (detectedId: string) => void;
  zIndex?: number;
}

export function DetectedProductModal({
  product,
  onClose,
  onLinked,
  onContinueAsNew,
  zIndex = 60,
}: DetectedProductModalProps) {
  const [showLinkDrawer, setShowLinkDrawer] = useState(false);

  const existingProducts = objects.filter((o) => o.type === "product");
  const activeProducts = existingProducts.filter((o) => o.lifecycle === "active");
  const plannedProducts = existingProducts.filter((o) => o.lifecycle === "planned");

  const handleLink = (existingId: string) => {
    onLinked(product.id, existingId);
    toast({
      title: "Продукт привязан",
      description: `«${product.name}» привязан к существующему продукту.`,
    });
  };

  const handleContinueAsNew = () => {
    onContinueAsNew(product.id);
    toast({
      title: "Продолжить как новый",
      description: `«${product.name}» добавлен как новый продукт.`,
    });
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center" style={{ zIndex }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-[1320px] max-h-[92vh] mt-[4vh] bg-background rounded-2xl shadow-2xl border border-border flex flex-col animate-in fade-in-0 zoom-in-95 duration-200">
        {/* ── Header ── */}
        <div className="sticky top-0 z-20 bg-background rounded-t-2xl border-b border-border px-8 py-4 shrink-0">
          {/* Row 1: Tags */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--brand-green)/0.15)] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--brand-green))]">
              <Sparkles className="h-2.5 w-2.5" />
              Обнаружен
            </span>
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", lifecycleStyleMap[product.lifecycle])}>
              {lifecycleLabels[product.lifecycle]}
            </span>
          </div>

          {/* Row 2: Title + Close */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground">{product.name}</h1>
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="overflow-y-auto flex-1 no-scrollbar relative">
          <div className="p-8 space-y-6">
            {/* Decision Banner */}
            <div className="rounded-xl border border-[hsl(var(--brand-green)/0.3)] bg-[hsl(var(--brand-green-bg))] p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-[hsl(var(--brand-green)/0.15)] flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-[hsl(var(--brand-green))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-foreground mb-1">
                    Этот продукт уже прорабатывался?
                  </h2>
                  <p className="text-xs text-muted-foreground mb-4">
                    Можно привязать его к существующему или продолжить как новый.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowLinkDrawer(true)}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                    >
                      <Link2 className="h-4 w-4" />
                      Привязать к продукту
                    </button>
                    <button
                      onClick={handleContinueAsNew}
                      className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--brand-green))] text-[hsl(var(--brand-green-foreground))] px-4 py-2 text-sm font-medium hover:opacity-90 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      Продолжить как новый
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic info */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Информация</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Название</span>
                  <p className="font-medium text-foreground">{product.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Жизненный цикл</span>
                  <p className="font-medium text-foreground">{lifecycleLabels[product.lifecycle]}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Источник</span>
                  <p className="font-medium text-foreground">{product.sourceHint}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Статус</span>
                  <p className="font-medium text-[hsl(var(--brand-green))]">Ожидает решения</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Linking Drawer (slide-in from right inside modal) ── */}
          {showLinkDrawer && (
            <>
              <div
                className="absolute inset-0 bg-black/20 z-10"
                onClick={() => setShowLinkDrawer(false)}
              />
              <div className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-background border-l border-border z-20 shadow-xl animate-in slide-in-from-right duration-200 flex flex-col">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
                  <h2 className="text-sm font-semibold text-foreground">Привязать к продукту</h2>
                  <button
                    onClick={() => setShowLinkDrawer(false)}
                    className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  {/* Active products */}
                  {activeProducts.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Действующие
                      </h3>
                      <div className="space-y-1">
                        {activeProducts.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleLink(p.id)}
                            className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-accent transition-colors group"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                              <p className="text-[11px] text-muted-foreground">
                                Оценка: {p.lastAssessment || "—"}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Planned products */}
                  {plannedProducts.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Планируемые
                      </h3>
                      <div className="space-y-1">
                        {plannedProducts.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleLink(p.id)}
                            className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-accent transition-colors group"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                              <p className="text-[11px] text-muted-foreground">
                                Оценка: {p.lastAssessment || "—"}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeProducts.length === 0 && plannedProducts.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Нет доступных продуктов для привязки
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
