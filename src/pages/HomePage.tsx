import { useState, useRef } from "react";
import { MessageSquare, ArrowUpRight, ChevronRight, ChevronLeft, Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ── mock news data ── */
const newsCards = [
  {
    type: "Законодательство" as const,
    title: "Название закона",
    description:
      "Ужесточились требования к обработке персональных данных и существенно выросли штрафы за выявленные нарушения.",
  },
  {
    type: "Новость" as const,
    title: "Название новости",
    description:
      "Невский районный суд Петербурга закрыл магазин-склад ООО 'Соки и воды' в Ростове-на-Дону по иску Роспотребнадзор…",
  },
  {
    type: "Законодательство" as const,
    title: "Ужесточение требований к обработке персональных данных",
    description:
      "Ужесточились требования к обработке персональных данных и существенно выросли штрафы за выявленные нарушения.",
  },
  {
    type: "Новость" as const,
    title: "Новые требования к контрагентам",
    description:
      "Введены дополнительные требования к проверке контрагентов при заключении крупных контрактов.",
  },
];

const limitCards = [
  { label: "Прямые потери", amount: "142 500 ₽", limit: "из 1 000 000", monthly: "16 320 ₽ за май", pct: 50, color: "hsl(30, 90%, 55%)" },
  { label: "Косвенные потери", amount: "142 500 ₽", limit: "из 1 000 000", monthly: "16 320 ₽ за май", pct: 85, color: "hsl(0, 72%, 55%)" },
  { label: "Кредитные потери", amount: "142 500 ₽", limit: "из 1 000 000", monthly: "16 320 ₽ за май", pct: 49, color: "hsl(160, 60%, 45%)" },
];

/* ── Donut ── */
function DonutChart({ pct, color, size = 64 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={6} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="rotate-90 origin-center fill-foreground text-xs font-semibold"
      >
        {pct}%
      </text>
    </svg>
  );
}

/* ── News type badge colors ── */
function typeBadgeClass(type: string) {
  if (type === "Законодательство") return "bg-emerald-50 text-emerald-700";
  return "bg-amber-50 text-amber-700";
}

export default function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  return (
    <div className="space-y-10 max-w-[960px] mx-auto">
      {/* ─── 1. AI Welcome ─── */}
      <section className="animate-fade-up text-center pt-4">
        <h1 className="text-2xl md:text-3xl font-semibold leading-tight text-foreground tracking-tight">
          — Привет, Кирилл! Меня зовут{" "}
          <span className="text-emerald-500">Норм</span>.
          <br />
          Я твой <span className="text-emerald-500">виртуальный помощник</span>.
        </h1>

        {/* AI input */}
        <div className="mt-8 relative group">
          <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-emerald-200 via-emerald-100 to-violet-200 opacity-60 group-hover:opacity-90 transition-opacity blur-[2px]" />
          <div className="relative flex items-center gap-3 bg-card rounded-2xl border border-border px-5 py-4">
            <MessageSquare className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Я твой ИИ помощник"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        </div>

        {/* CTA buttons */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button className="flex items-center justify-between rounded-xl bg-emerald-400 hover:bg-emerald-500 text-white px-5 py-3 text-sm font-medium transition-colors active:scale-[0.98]">
            Зарегистрировать событие
            <ArrowUpRight className="h-4 w-4" />
          </button>
          <button className="flex items-center justify-between rounded-xl bg-emerald-400 hover:bg-emerald-500 text-white px-5 py-3 text-sm font-medium transition-colors active:scale-[0.98]">
            Запросить аналитику
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ─── 2. News / Changes ─── */}
      <section className="animate-fade-up stagger-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Я собрал важные изменения в законах и СМИ
          </h2>
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Смотреть все <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="relative">
          {/* scroll buttons */}
          <button
            onClick={() => scroll(-1)}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar pb-1"
          >
            {newsCards.map((card, i) => (
              <div
                key={i}
                className="min-w-[280px] max-w-[300px] shrink-0 rounded-2xl border border-border bg-card p-5 flex flex-col gap-3 transition-shadow hover:shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(270 40% 97%) 100%)",
                }}
              >
                <span
                  className={`self-start text-[11px] font-medium px-2.5 py-1 rounded-full ${typeBadgeClass(card.type)}`}
                >
                  {card.type === "Законодательство" ? "⚖ " : "📰 "}
                  {card.type}
                </span>
                <h3 className="text-sm font-semibold text-foreground leading-snug">
                  {card.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {card.description}
                </p>
                <button className="mt-auto self-start flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                  Принять меры <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. Limit utilization ─── */}
      <section className="animate-fade-up stagger-2">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          Утилизация лимита <Flame className="h-5 w-5 text-orange-400" />
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {limitCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between gap-4 transition-shadow hover:shadow-md"
            >
              <div className="space-y-1.5 min-w-0">
                <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                <p className="text-lg font-bold text-foreground tabular-nums">{card.amount}</p>
                <p className="text-[11px] text-muted-foreground">{card.limit}</p>
                <p className="text-[11px] text-muted-foreground">{card.monthly}</p>
              </div>
              <DonutChart pct={card.pct} color={card.color} size={68} />
            </div>
          ))}
        </div>
      </section>

      {/* ─── 4. Events work ─── */}
      <section className="animate-fade-up stagger-3 pb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          Работа с событиями <Zap className="h-5 w-5 text-yellow-500" />
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {/* In progress */}
          <div className="rounded-2xl border border-border p-5 transition-shadow hover:shadow-md" style={{ background: "linear-gradient(135deg, hsl(152 60% 97%) 0%, hsl(var(--card)) 100%)" }}>
            <h3 className="text-sm font-semibold text-foreground">У тебя в работе</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Не завершена работа над несколькими событиями.
            </p>
            <button className="mt-4 flex items-center gap-2 text-xs font-medium text-foreground hover:text-emerald-600 transition-colors">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              103 события <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          {/* New tasks */}
          <div className="rounded-2xl border border-border p-5 transition-shadow hover:shadow-md" style={{ background: "linear-gradient(135deg, hsl(38 92% 97%) 0%, hsl(var(--card)) 100%)" }}>
            <h3 className="text-sm font-semibold text-foreground">Появились новые задачи</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Эти события требуют утверждения риск-менеджером.
            </p>
            <button className="mt-4 flex items-center gap-2 text-xs font-medium text-foreground hover:text-orange-600 transition-colors">
              <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
              103 события <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
