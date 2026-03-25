import { Loader2, FileText, Check } from "lucide-react";
import { ProductModalShell, ModalBody, ModalNavChips } from "@/components/ProductModalShell";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { lifecycleLabels, type ProductLifecycle } from "@/data/mock";

interface InProgressProduct {
  id: string;
  name: string;
  startedAt: number;
  progress: number;
  done: boolean;
  documents: Array<{ name: string; sizeKb: number }>;
  lifecycle?: ProductLifecycle;
  description?: string;
  createdDate?: string;
}

const lifecycleStyleMap: Record<string, string> = {
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

export function InProgressProductModal({
  product,
  onClose,
  zIndex = 50,
}: {
  product: InProgressProduct;
  onClose: () => void;
  zIndex?: number;
}) {
  const progressPct = Math.round(product.progress);
  const lifecycle = product.lifecycle || "active";

  /* ─── Row 1: lifecycle chip (no risk badge during analysis) ─── */
  const statusChips = (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", lifecycleStyleMap[lifecycle])}>
      {lifecycleLabels[lifecycle]}
    </span>
  );

  const navigation = (
    <ModalNavChips sections={sections} activeSection="overview" onNavigate={() => {}} />
  );

  const footer = (
    <span className="text-xs text-muted-foreground">Анализ в процессе — действия будут доступны после завершения</span>
  );

  /* ─── Right meta panel (mandatory, all fields) ─── */
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
          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", lifecycleStyleMap[lifecycle])}>
            {lifecycleLabels[lifecycle]}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Дата создания</span>
          <span className="text-foreground">{product.createdDate || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Последняя оценка</span>
          <span className="text-foreground">—</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Статус оценки</span>
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-[hsl(var(--status-progress-bg))] text-[hsl(var(--status-progress))]">
            AI анализ
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Риски</span>
          <span className="text-foreground">—</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Документы</span>
          <span className="text-foreground">{product.documents.length}</span>
        </div>
      </div>
    </div>
  );

  return (
    <ProductModalShell
      onClose={onClose}
      zIndex={zIndex}
      statusChips={statusChips}
      title={product.name}
      navigation={navigation}
      footer={footer}
    >
      <ModalBody sidebar={metaSidebar}>
        {/* ── Description block ── */}
        {product.description && (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-foreground leading-relaxed line-clamp-3">{product.description}</p>
          </div>
        )}

        {/* AI Analysis progress */}
        <section className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 space-y-5">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(270_60%_95%)] flex items-center justify-center shrink-0">
                <Loader2 className="h-4 w-4 text-[hsl(270_60%_50%)] animate-spin" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-1">AI анализирует документы</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Изучаю загруженные материалы, проверяю соответствие нормативным требованиям и выявляю потенциальные риски.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Прогресс</span>
                <span className="text-xs font-medium text-foreground tabular-nums">{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {progressPct < 30 ? "Загружаю и обрабатываю документы…" :
                 progressPct < 60 ? "Анализирую содержание…" :
                 progressPct < 90 ? "Формирую выводы…" :
                 "Собираю итоговый отчёт…"}
              </p>
            </div>
            <div className="space-y-2">
              {[
                { threshold: 20, label: "Извлечение данных из документов" },
                { threshold: 50, label: "Анализ операционных рисков" },
                { threshold: 80, label: "Проверка поведенческих рисков" },
                { threshold: 100, label: "Формирование отчёта" },
              ].map((step) => (
                <div key={step.threshold} className="flex items-center gap-3">
                  <div className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0",
                    progressPct > step.threshold ? "bg-[hsl(var(--status-active-bg))]" :
                    progressPct > step.threshold - 30 ? "bg-muted" : "bg-muted/50"
                  )}>
                    {progressPct > step.threshold ? (
                      <Check className="h-3 w-3 text-[hsl(var(--status-active))]" />
                    ) : progressPct > step.threshold - 30 ? (
                      <Loader2 className="h-3 w-3 text-muted-foreground animate-spin" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>
                  <span className={cn("text-xs", progressPct > step.threshold - 30 ? "text-foreground" : "text-muted-foreground")}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Загруженные документы
            </h3>
            <div className="space-y-2">
              {product.documents.length > 0 ? (
                product.documents.map((document, index) => (
                  <div key={`${document.name}-${index}`} className="flex items-center justify-between gap-2 text-xs text-muted-foreground py-1.5 px-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{document.name}</span>
                    </div>
                    <span className="tabular-nums shrink-0">{document.sizeKb} KB</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-1.5 px-3 rounded-lg bg-muted/50">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Документы не загружены</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Empty sections placeholders */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Проявления рисков</h2>
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center">
            <p className="text-sm text-muted-foreground">Проявления появятся после завершения анализа</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Источники</h2>
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center">
            <p className="text-sm text-muted-foreground">Источники не найдены</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Контекст</h2>
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center">
            <p className="text-sm text-muted-foreground">Контекст будет доступен после анализа</p>
          </div>
        </section>

        <section className="space-y-3 pb-4">
          <h2 className="text-sm font-semibold text-foreground">История оценок</h2>
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center">
            <p className="text-sm text-muted-foreground">Оценки ещё не проводились</p>
          </div>
        </section>
      </ModalBody>
    </ProductModalShell>
  );
}
