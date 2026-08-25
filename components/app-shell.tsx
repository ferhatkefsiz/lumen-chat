"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import SidebarNav from "@/components/primitives/SidebarNav";
import { ThemeToggle } from "@/components/theme-toggle";

const SUGGESTIONS = [
  "Summarize my open tickets",
  "Write SQL for weekly active users",
  "Explain this stack trace",
  "Draft release notes for v0.3",
];

export function AppShell() {
  const [activeTitle, setActiveTitle] = useState<string | null>(null);

  return (
    <div className="flex h-dvh w-full gap-1 bg-canvas p-2">
      <div className="pl-1">
        <SidebarNav
          fill
          activeTitle={activeTitle}
          onNewChat={() => setActiveTitle(null)}
          onPick={(_id, label) => setActiveTitle(label)}
        />
      </div>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-window)] bg-surface shadow-card">
        {/* Topbar */}
        <header className="flex h-13 shrink-0 items-center justify-between border-b border-line px-4">
          <span className="truncate text-sm font-medium text-ink">
            {activeTitle ?? "New chat"}
          </span>
          <ThemeToggle />
        </header>

        {/* Content — chat panel lands here in the next phase. */}
        <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
          <div className="flex max-w-md flex-col items-center gap-5 text-center">
            <div className="flex size-12 items-center justify-center rounded-[var(--radius-card)] bg-accent text-on-accent shadow-btn">
              <Sparkles size={22} />
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-xl font-semibold tracking-tight text-ink">
                How can I help you today?
              </h1>
              <p className="text-ink-2">
                Ask a question, run a task, or pick up a recent conversation
                from the sidebar.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="rounded-full bg-inset px-3 py-1.5 text-[13px] font-medium text-ink-2 shadow-hairline transition-colors hover:bg-hover hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
