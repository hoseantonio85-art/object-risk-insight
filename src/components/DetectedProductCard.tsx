import { Sparkles, FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { lifecycleLabels, type ProductLifecycle } from "@/data/mock";
import type { DetectedProduct } from "@/data/detectedProducts";

const lifecycleStyleMap: Record<ProductLifecycle, string> = {
  planned: "bg-[hsl(var(--lifecycle-planned-bg))] text-[hsl(var(--lifecycle-planned))]",
  active: "bg-[hsl(var(--lifecycle-active-bg))] text-[hsl(var(--lifecycle-active))]",
  closed: "bg-[hsl(var(--lifecycle-closed-bg))] text-[hsl(var(--lifecycle-closed))]",
};

interface DetectedProductCardProps {
  product: DetectedProduct;
  onClick: () => void;
}

export function DetectedProductCard({ product, onClick }: DetectedProductCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 w-[200px] rounded-xl border border-[hsl(var(--brand-green)/0.25)] bg-[hsl(var(--brand-green-bg))]",
        "p-3 text-left transition-all hover:shadow-md hover:border-[hsl(var(--brand-green)/0.5)] hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      {/* Tags row */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--brand-green)/0.15)] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--brand-green))]">
          <Sparkles className="h-2.5 w-2.5" />
          Обнаружен
        </span>
        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", lifecycleStyleMap[product.lifecycle])}>
          {lifecycleLabels[product.lifecycle]}
        </span>
      </div>

      {/* Name */}
      <h4 className="text-sm font-semibold text-foreground truncate mb-1.5">
        {product.name}
      </h4>

      {/* Source hint */}
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <FileSearch className="h-3 w-3 shrink-0" />
        <span className="truncate">{product.sourceHint}</span>
      </div>
    </button>
  );
}
