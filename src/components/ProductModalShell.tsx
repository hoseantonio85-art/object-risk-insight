import { forwardRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Two-column body helper ─── */
export function ModalBody({ children, sidebar }: { children: React.ReactNode; sidebar?: React.ReactNode }) {
  return (
    <div className="flex gap-6 p-8">
      <div className="flex-1 min-w-0 space-y-6">{children}</div>
      {sidebar && <div className="w-[260px] shrink-0 space-y-4">{sidebar}</div>}
    </div>
  );
}

/* ─── Nav chips ─── */
export function ModalNavChips({
  sections,
  activeSection,
  onNavigate,
}: {
  sections: ReadonlyArray<{ id: string; label: string }>;
  activeSection: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 -mb-1">
      {sections.map((s) => (
        <button
          key={s.id}
          onClick={() => onNavigate(s.id)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
            activeSection === s.id
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Main Shell ─── */
interface ProductModalShellProps {
  onClose: () => void;
  zIndex?: number;
  /** Row 1: Status chips (lifecycle, risk level) */
  statusChips?: React.ReactNode;
  /** Row 2: Modal title */
  title: string;
  /** Row 3: Navigation chips row */
  navigation?: React.ReactNode;
  /** Extra header content (activation banner, etc.) */
  headerExtra?: React.ReactNode;
  /** Main scrollable body */
  children: React.ReactNode;
  /** Footer actions */
  footer?: React.ReactNode;
  /** Drawers rendered inside the modal container (absolute positioned) */
  drawers?: React.ReactNode;
}

export const ProductModalShell = forwardRef<HTMLDivElement, ProductModalShellProps>(
  ({ onClose, zIndex = 50, statusChips, title, navigation, headerExtra, children, footer, drawers }, ref) => {
    return (
      <div className="fixed inset-0 flex items-start justify-center" style={{ zIndex }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <div className="relative z-10 w-full max-w-[1320px] max-h-[92vh] mt-[4vh] bg-background rounded-2xl shadow-2xl border border-border flex flex-col animate-in fade-in-0 zoom-in-95 duration-200">
          {/* ── Sticky Header ── */}
          <div className="sticky top-0 z-20 bg-background rounded-t-2xl border-b border-border px-8 py-4 shrink-0">
            {/* Row 1: Status chips (lifecycle + risk level) */}
            {statusChips && (
              <div className="flex items-center gap-2 mb-2">{statusChips}</div>
            )}

            {/* Row 2: Title + close */}
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              <button
                onClick={onClose}
                className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Row 3: Navigation */}
            {navigation}

            {/* Extra (activation banner, etc.) */}
            {headerExtra}
          </div>

          {/* ── Scrollable Body ── */}
          <div ref={ref} className="overflow-y-auto flex-1 no-scrollbar">
            {children}
          </div>

          {/* ── Footer ── */}
          {footer && (
            <div className="border-t border-border px-8 py-4 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}

          {/* ── Drawers (absolute positioned inside modal) ── */}
          {drawers}
        </div>
      </div>
    );
  }
);
ProductModalShell.displayName = "ProductModalShell";
