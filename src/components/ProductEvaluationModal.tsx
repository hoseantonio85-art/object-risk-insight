import { useState, useRef } from "react";
import { X, Upload, FileText, Sparkles, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalStep = "upload" | "started";

interface ProductEvaluationModalProps {
  onClose: () => void;
  onStarted: (productName: string) => void;
  zIndex?: number;
}

const lifecycleOptions = [
  { value: "creation", label: "Создание / пилот" },
  { value: "modification", label: "Модификация" },
  { value: "closing", label: "Закрытие" },
];

export function ProductEvaluationModal({ onClose, onStarted, zIndex = 50 }: ProductEvaluationModalProps) {
  const [step, setStep] = useState<ModalStep>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [productName, setProductName] = useState("");
  const [lifecycle, setLifecycle] = useState("");
  const [launchDate, setLaunchDate] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...dropped]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleStart = () => {
    setStep("started");
  };

  const handleClose = () => {
    if (step === "started" && productName.trim()) {
      onStarted(productName.trim());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center" style={{ zIndex }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative z-10 w-full max-w-[720px] max-h-[88vh] mt-[6vh] bg-background rounded-2xl shadow-2xl border border-border flex flex-col animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 py-5 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Оценить продукт</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Анализ рисков на основе документов</p>
            </div>
            <button onClick={handleClose} className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
          {step === "upload" && (
            <div className="space-y-6">
              {/* Agent message */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[hsl(270_60%_95%)] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="h-4 w-4 text-[hsl(270_60%_50%)]" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground leading-relaxed">
                      Для качественного анализа мне помогут следующие материалы:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                        Описание продукта и целевой аудитории
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                        Ценовые параметры и тарифы
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                        Путь клиента (customer journey)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                        Недавние изменения в продукте
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                        Сопроводительные документы
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Product name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Название продукта</label>
                <input
                  type="text"
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  placeholder="Например: Кредитная карта Premium"
                  className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Lifecycle + date row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Стадия жизненного цикла</label>
                  <select
                    value={lifecycle}
                    onChange={e => setLifecycle(e.target.value)}
                    className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Выберите</option>
                    {lifecycleOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Дата запуска / изменения</label>
                  <input
                    type="date"
                    value={launchDate}
                    onChange={e => setLaunchDate(e.target.value)}
                    className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Upload zone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Документы</label>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative rounded-xl border-2 border-dashed bg-card p-8 text-center cursor-pointer transition-all",
                    dragOver
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.04)]"
                      : "border-border hover:border-[hsl(var(--primary)/0.4)] hover:bg-accent/30"
                  )}
                >
                  <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
                  <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Перетащите файлы сюда
                  </p>
                  <p className="text-xs text-muted-foreground">
                    или нажмите для выбора · PDF, DOCX, XLSX
                  </p>
                </div>
              </div>

              {/* Uploaded files list */}
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5">
                      <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                        className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === "started" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-2xl bg-[hsl(var(--status-active-bg))] flex items-center justify-center mb-5">
                <Check className="h-7 w-7 text-[hsl(var(--status-active))]" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Документы приняты</h2>
              <p className="text-sm text-muted-foreground mb-1">Анализ уже начался</p>
              <p className="text-sm text-muted-foreground mb-8">Скоро покажу результат</p>

              <div className="rounded-xl border border-border bg-card p-4 max-w-sm w-full">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[hsl(270_60%_95%)] flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-[hsl(270_60%_50%)]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-foreground font-medium">{productName || "Продукт"}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Loader2 className="h-3 w-3 text-[hsl(var(--status-progress))] animate-spin" />
                      <span className="text-xs text-muted-foreground">Анализирую документы…</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-8 py-4 flex items-center justify-end gap-3 shrink-0">
          {step === "upload" && (
            <>
              <button onClick={handleClose} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Отменить
              </button>
              <button
                onClick={handleStart}
                disabled={!productName.trim() || files.length === 0}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all",
                  productName.trim() && files.length > 0
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <Sparkles className="h-4 w-4" />
                Начать анализ
              </button>
            </>
          )}
          {step === "started" && (
            <button
              onClick={handleClose}
              className="inline-flex items-center gap-2 rounded-lg bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              Закрыть
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
