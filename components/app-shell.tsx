"use client";

import { useState } from "react";
import SidebarNav from "@/components/primitives/SidebarNav";
import { ChatPanel } from "@/components/chat-panel";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppShell() {
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  // Bumping the key remounts ChatPanel with a fresh conversation.
  const [convo, setConvo] = useState<{ key: number; prompt: string | null }>({
    key: 0,
    prompt: null,
  });

  const newChat = () => {
    setActiveTitle(null);
    setConvo((c) => ({ key: c.key + 1, prompt: null }));
  };

  const pick = (_id: string, label: string) => {
    setActiveTitle(label);
    setConvo((c) => ({ key: c.key + 1, prompt: label }));
  };

  return (
    <div className="flex h-dvh w-full gap-1 bg-canvas p-2">
      <div className="pl-1">
        <SidebarNav
          fill
          activeTitle={activeTitle}
          onNewChat={newChat}
          onPick={pick}
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

        <ChatPanel
          key={convo.key}
          initialPrompt={convo.prompt}
          onTitle={setActiveTitle}
        />
      </main>
    </div>
  );
}
