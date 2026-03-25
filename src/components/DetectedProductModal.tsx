import { useState } from "react";
import { X, Sparkles, Link2, Plus, ChevronRight, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { objects, lifecycleLabels, type ProductLifecycle } from "@/data/mock";
import type { DetectedProduct } from "@/data/detectedProducts";
import { ProductModalShell, ModalBody, ModalNavChips } from "@/components/ProductModalShell";

const lifecycleStyleMap: Record<ProductLifecycle, string> = {
  planned: "bg-[hsl(var(--lifecycle-planned-bg))] text-[hsl(var(--lifecycle-planned))]",
  active: "bg-[hsl(var(--lifecycle-active-bg))] text-[hsl(var(--lifecycle-active))]",
  closed: "bg-[hsl(var(--lifecycle-closed-bg))] text-[hsl(var(--lifecycle-closed))]",
};

const sections = [
  { id: "overview", label: "Обзор" },
  { id: "manifestations", label: "Проявления" },
  { id: "sources", label: "Источники" },
  { id: "context", label: "Контекст" },
  { id: "history", label: "История" },
] as const;

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
  const [showDescriptionDrawer, setShowDescriptionDrawer] = useState(false);

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

  /* ─── Row 1: lifecycle chip (no risk for detected products) ─── */
  const statusChips = (
    <>
      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", lifecycleStyleMap[product.lifecycle])}>
        {lifecycleLabels[product.lifecycle]}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--brand-green)/0.15)] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--brand-green))]">
        <Sparkles className="h-2.5 w-2.5" />
        Обнаружен
      </span>
    </>
  );

  const navigation = (
    <ModalNavChips sections={sections} activeSection="overview" onNavigate={() => {}} />
  );

  const footer = (
    <>
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
    </>
  );

  /* ─── Right meta panel (mandatory, all fields with placeholders) ─── */
  const metaSidebar = (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Информация</h3>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Тип</span>
          <span className="font-medium text-foreground">Продукт</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Жизненный цикл</span>
          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", lifecycleStyleMap[product.lifecycle])}>
            {lifecycleLabels[product.lifecycle]}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Дата создания</span>
          <span className="text-foreground">—</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Последняя оценка</span>
          <span className="text-foreground">—</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Статус оценки</span>
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-[hsl(var(--brand-green)/0.15)] text-[hsl(var(--brand-green))]">
            Ожидает решения
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Риски</span>
          <span className="text-foreground">—</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Источник</span>
          <span className="text-foreground">{product.sourceHint}</span>
        </div>
      </div>
    </div>
  );

  /* ─── Link drawer ─── */
  const linkDrawer = showLinkDrawer ? (
    <>
      <div
        className="absolute inset-0 z-30 bg-black/20 rounded-2xl"
        onClick={() => setShowLinkDrawer(false)}
      />
      <div className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-background border-l border-border z-40 shadow-xl animate-in slide-in-from-right duration-200 flex flex-col rounded-r-2xl">
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
  ) : null;

  /* ─── Description drawer ─── */
  const descriptionDrawer = showDescriptionDrawer ? (
    <>
      <div
        className="absolute inset-0 z-30 bg-black/20 rounded-2xl"
        onClick={() => setShowDescriptionDrawer(false)}
      />
      <div className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-background border-l border-border z-40 shadow-xl animate-in slide-in-from-right duration-200 flex flex-col rounded-r-2xl">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <h2 className="text-sm font-semibold text-foreground">Описание продукта</h2>
          <button
            onClick={() => setShowDescriptionDrawer(false)}
            className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-sm text-foreground leading-relaxed">{product.description}</p>
        </div>
      </div>
    </>
  ) : null;

  return (
    <ProductModalShell
      onClose={onClose}
      zIndex={zIndex}
      statusChips={statusChips}
      title={product.name}
      navigation={navigation}
      footer={footer}
      drawers={<>{linkDrawer}{descriptionDrawer}</>}
    >
      <ModalBody sidebar={metaSidebar}>
        {/* Decision Banner */}
        <section className="space-y-6">
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
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    Привязать к продукту
                  </button>
                  <button
                    onClick={handleContinueAsNew}
                    className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--brand-green))] text-[hsl(var(--brand-green-foreground))] px-3.5 py-2 text-sm font-medium hover:opacity-90 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Продолжить как новый
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Description block */}
        {product.description && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Описание продукта</h2>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-foreground leading-relaxed line-clamp-3">{product.description}</p>
              <button
                onClick={() => setShowDescriptionDrawer(true)}
                className="mt-2 text-xs font-medium text-[hsl(var(--primary))] hover:underline transition-colors"
              >
                Подробнее
              </button>
            </div>
          </section>
        )}

        {/* No evaluation state */}
        <section className="space-y-3">
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-[hsl(var(--brand-green)/0.1)] flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-[hsl(var(--brand-green))]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-1">Оценка не проводилась</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Загрузите документы, чтобы провести анализ рисков. Отсутствие оценки не означает отсутствие рисков.
                </p>
              </div>
            </div>
          </div>
        </section>
      </ModalBody>
    </ProductModalShell>
  );
}
