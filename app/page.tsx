import { AtomsShowcase } from "@/components/atoms-showcase";
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
          Atoms
        </h1>
        <p className="max-w-prose text-ink-2">
          The building blocks — buttons, pills, chips, switches and more, all
          wired to the Lumen token system.
        </p>
      </div>

      <AtomsShowcase />
    </main>
  );
}
