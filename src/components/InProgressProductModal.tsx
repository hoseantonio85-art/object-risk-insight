import { X, Loader2, Sparkles, FileText, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface InProgressProduct {
  name: string;
  startedAt: number;
  progress: number;
  done: boolean;
}

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

  return (
    <div className="fixed inset-0 flex items-start justify-center pt-[5vh]" style={{ zIndex }}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[1320px] max-h-[90vh] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col animate-fade-up">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[hsl(var(--status-progress-bg))] flex items-center justify-center">
              {product.done ? (
                <Sparkles className="h-4.5 w-4.5 text-[hsl(var(--brand-green))]" />
              ) : (
                <Loader2 className="h-4.5 w-4.5 text-[hsl(var(--status-progress))] animate-spin" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{product.name}</h2>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium mt-0.5 bg-[hsl(var(--status-progress-bg))] text-[hsl(var(--status-progress))]">
                AI анализ
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* AI Message */}
          <div className="rounded-xl border border-[hsl(var(--status-progress)/0.2)] bg-[hsl(var(--status-progress-bg))] p-5">
            <div className="flex items-start gap-3">
              <Bot className="h-5 w-5 text-[hsl(var(--status-progress))] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Я анализирую загруженные документы. Скоро покажу результат.
                </p>
                <p className="text-xs text-muted-foreground">
                  Изучаю загруженные материалы, проверяю соответствие нормативным требованиям и выявляю потенциальные риски.
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}
          {!product.done && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">Прогресс анализа</span>
                <span className="text-sm font-semibold text-foreground tabular-nums">{progressPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-[hsl(var(--status-progress))] transition-all duration-700 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {progressPct < 30 ? "Загружаю и обрабатываю документы…" :
                 progressPct < 60 ? "Анализирую содержание…" :
                 progressPct < 90 ? "Формирую выводы…" :
                 "Собираю итоговый отчёт…"}
              </p>
            </div>
          )}

          {/* Documents placeholder */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Загруженные документы
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-1.5 px-3 rounded-lg bg-muted/50">
                <FileText className="h-3.5 w-3.5" />
                <span>Описание продукта.pdf</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-1.5 px-3 rounded-lg bg-muted/50">
                <FileText className="h-3.5 w-3.5" />
                <span>Тарифы и условия.xlsx</span>
              </div>
            </div>
          </div>

          {/* Risks placeholder */}
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6">
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                {product.done ? "Проявления рисков готовы к просмотру" : "Проявления рисков появятся здесь"}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {product.done
                  ? "Откройте полную карточку продукта для просмотра результатов"
                  : "После завершения анализа здесь появятся обнаруженные проявления рисков"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
