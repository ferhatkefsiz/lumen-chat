import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-6 rounded-[var(--radius-chip)] bg-accent shadow-btn" />
          <span className="text-base font-semibold tracking-tight text-ink">
            Lumen
          </span>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Foundations are in place
        </h1>
        <p className="max-w-prose text-ink-2">
          Design tokens, theming and the base layer are wired up. The chat
          dashboard is built on top of these, step by step.
        </p>
      </div>

      {/* Token smoke test — surfaces, accent, ink ramp, semantic pills. */}
      <section className="rounded-[var(--radius-card)] bg-surface p-5 shadow-card">
        <div className="mb-4 flex flex-wrap gap-2">
          <button className="rounded-[var(--radius-control)] bg-accent px-3 py-1.5 text-sm font-medium text-on-accent shadow-btn">
            Primary action
          </button>
          <button className="rounded-[var(--radius-control)] bg-surface px-3 py-1.5 text-sm font-medium text-ink shadow-btn">
            Secondary
          </button>
          <span className="inline-flex items-center rounded-full bg-green-tint px-2.5 py-1 text-xs font-medium text-green">
            Success
          </span>
          <span className="inline-flex items-center rounded-full bg-orange-tint px-2.5 py-1 text-xs font-medium text-orange">
            Warning
          </span>
          <span className="inline-flex items-center rounded-full bg-red-tint px-2.5 py-1 text-xs font-medium text-red">
            Error
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-ink">Primary ink — the main reading color.</p>
          <p className="text-ink-2">Secondary ink — supporting text.</p>
          <p className="text-ink-3">Tertiary ink — hints and metadata.</p>
        </div>
      </section>
    </main>
  );
}
