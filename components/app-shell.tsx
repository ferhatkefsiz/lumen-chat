"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import SidebarNav from "@/components/primitives/SidebarNav";
import { ChatPanel } from "@/components/chat-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { EXAMPLES } from "@/lib/chat-examples";
import { cn } from "@/lib/utils";

const RECENTS = EXAMPLES.map((e) => ({ id: e.id, label: e.question }));

interface Tab {
  id: number;
  title: string | null;
  initialPrompt: string | null;
}

export function AppShell() {
  const router = useRouter();
  const seqRef = useRef(1);
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 0, title: null, initialPrompt: null },
  ]);
  const [activeId, setActiveId] = useState(0);

  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0];

  const newChat = () => {
    const id = seqRef.current++;
    setTabs((prev) => [...prev, { id, title: null, initialPrompt: null }]);
    setActiveId(id);
  };

  // Reopening a recent focuses its tab if already open, else opens a new one.
  const pick = (_id: string, label: string) => {
    const existing = tabs.find((t) => t.title === label);
    if (existing) {
      setActiveId(existing.id);
      return;
    }
    const id = seqRef.current++;
    setTabs((prev) => [
      ...prev,
      { id, title: label, initialPrompt: label },
    ]);
    setActiveId(id);
  };

  const setTabTitle = (id: number, title: string) =>
    setTabs((prev) =>
      prev.map((t) => (t.id === id && !t.title ? { ...t, title } : t)),
    );

  const closeTab = (id: number) => {
    const remaining = tabs.filter((t) => t.id !== id);
    if (remaining.length === 0) {
      const nid = seqRef.current++;
      setTabs([{ id: nid, title: null, initialPrompt: null }]);
      setActiveId(nid);
      return;
    }
    setTabs(remaining);
    if (id === activeId) setActiveId(remaining[remaining.length - 1].id);
  };

  return (
    <div className="flex h-dvh w-full gap-2 bg-canvas py-2 pr-2">
      <SidebarNav
        fill
        activeTitle={activeTab.title}
        recents={RECENTS}
        onNewChat={newChat}
        onPick={pick}
        onOpenSettings={() => router.push("/settings")}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-window)] bg-surface shadow-card">
        {/* Tab bar */}
        <header className="flex h-11 shrink-0 items-center gap-1 border-b border-line pr-3 pl-2">
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={cn(
                  "group/tab flex h-7 w-36 shrink-0 items-center gap-0.5 rounded-[7px] pr-1 pl-2.5 text-[12.5px] font-medium transition-colors duration-100",
                  tab.id === activeId
                    ? "bg-hover-2 text-ink"
                    : "text-ink-2 hover:bg-hover hover:text-ink",
                )}
              >
                <button
                  type="button"
                  aria-pressed={tab.id === activeId}
                  onClick={() => setActiveId(tab.id)}
                  title={tab.title ?? "New chat"}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block truncate">
                    {tab.title ?? "New chat"}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="Close tab"
                  onClick={() => closeTab(tab.id)}
                  className="-my-1 flex size-6 shrink-0 items-center justify-center rounded-[5px] text-ink-3 transition-[background-color,color] duration-100 hover:bg-hover-2 hover:text-ink"
                >
                  <X size={11} strokeWidth={2.4} />
                </button>
              </div>
            ))}
            <button
              type="button"
              aria-label="New chat"
              onClick={newChat}
              className="ml-0.5 flex size-7 shrink-0 items-center justify-center rounded-[7px] text-ink-3 transition-colors duration-100 hover:bg-hover hover:text-ink"
            >
              <Plus size={15} />
            </button>
          </div>
          <ThemeToggle />
        </header>

        {/* One ChatPanel per tab; inactive tabs stay mounted to preserve state */}
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "min-h-0 flex-1 flex-col",
              tab.id === activeId ? "flex" : "hidden",
            )}
          >
            <ChatPanel
              initialPrompt={tab.initialPrompt}
              onTitle={(t) => setTabTitle(tab.id, t)}
            />
          </div>
        ))}
      </main>
    </div>
  );
}
