export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-2xl font-semibold text-foreground tracking-tight">{title}</h1>
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Раздел в разработке
      </div>
    </div>
  );
}
