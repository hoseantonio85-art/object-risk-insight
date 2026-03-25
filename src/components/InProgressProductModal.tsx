import { Loader2, Sparkles, FileText, Bot, Check } from "lucide-react";
import { ProductModalShell, ModalBody, ModalCenteredContent } from "@/components/ProductModalShell";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface InProgressProduct {
  id: string;
  name: string;
  startedAt: number;
  progress: number;
  done: boolean;
  documents: Array<{ name: string; sizeKb: number }>;
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

  const statusChips = (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-[hsl(var(--status-progress-bg))] text-[hsl(var(--status-progress))]">
      AI анализ
    </span>
  );

  return (
    <ProductModalShell
      onClose={onClose}
      zIndex={zIndex}
      statusChips={statusChips}
      title={product.name}
    >
      <ModalBody
        sidebar={
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Информация</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Тип</span>
                <span className="font-medium text-foreground">Продукт</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Статус</span>
                <span className="font-medium text-[hsl(var(--status-progress))]">AI анализ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Документы</span>
                <span className="text-foreground">{product.documents.length}</span>
              </div>
            </div>
          </div>
        }
      >
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
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Прогресс анализа</span>
            <span className="text-sm font-semibold text-foreground tabular-nums">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {progressPct < 30 ? "Загружаю и обрабатываю документы…" :
             progressPct < 60 ? "Анализирую содержание…" :
             progressPct < 90 ? "Формирую выводы…" :
             "Собираю итоговый отчёт…"}
          </p>
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

        {/* Risks placeholder */}
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6">
          <div className="text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              Результаты появятся после завершения анализа
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              После завершения анализа здесь появятся обнаруженные проявления рисков
            </p>
          </div>
        </div>
      </ModalBody>
    </ProductModalShell>
  );
}
