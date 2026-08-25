"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import ThinkingState from "@/components/primitives/ThinkingState";
import { StreamText } from "@/components/atoms/StreamText";

type Role = "user" | "assistant";
type Status = "thinking" | "streaming" | "done";

interface Message {
  id: string;
  role: Role;
  content: string;
  status?: Status;
  variant?: string;
}

/* Canned assistant replies — cycled per turn to fake a token stream. */
const RESPONSES = [
  "Here's a summary based on what I found. The headline numbers held steady quarter over quarter, with the clearest movement in the free-to-paid conversion path — that's where I'd start before drawing broader conclusions.",
  "Good question. The short version: yes, but it depends on where the work runs. I've weighed the trade-offs so you can pick the approach that fits your constraints.",
  "I traced the issue to how state is initialized on the first render. A small change there should resolve it without touching the rest of the flow.",
  "Done. I pulled the data, checked it against the previous period, and the trend is consistent. Let me know if you'd like it broken down by segment.",
];

const VARIANTS = ["Steps", "Search", "Coding", "Reasoning"];

const SUGGESTIONS = [
  "Summarize my open tickets",
  "Write SQL for weekly active users",
  "Explain this stack trace",
  "Draft release notes for v0.3",
];

let idCounter = 0;
const nextId = () => `m${idCounter++}`;

export function ChatPanel({
  initialPrompt,
  onTitle,
}: {
  initialPrompt?: string | null;
  onTitle?: (title: string) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const turnRef = useRef(0);
  const titleSetRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const turn = turnRef.current++;
      const assistantId = nextId();
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "user", content: trimmed },
        {
          id: assistantId,
          role: "assistant",
          content: RESPONSES[turn % RESPONSES.length],
          status: "thinking",
          variant: VARIANTS[turn % VARIANTS.length],
        },
      ]);
      if (!titleSetRef.current) {
        titleSetRef.current = true;
        onTitle?.(trimmed);
      }
      setDraft("");
    },
    [onTitle],
  );

  const settle = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "streaming" } : m)),
    );
  }, []);

  const finish = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "done" } : m)),
    );
  }, []);

  // Auto-send a prompt handed in from the sidebar / a suggestion.
  useEffect(() => {
    if (initialPrompt) send(initialPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const empty = messages.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* messages / empty state */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        {empty ? (
          <div className="flex h-full items-center justify-center p-6">
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
                    onClick={() => send(s)}
                    className="rounded-full bg-inset px-3 py-1.5 text-[13px] font-medium text-ink-2 shadow-hairline transition-colors hover:bg-hover hover:text-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end pl-10">
                  <div className="max-w-[80%] rounded-2xl bg-field px-3.5 py-2 text-[14px] leading-relaxed text-ink">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex flex-col gap-2 pr-10">
                  <ThinkingState
                    variant={m.variant}
                    onSettled={() => settle(m.id)}
                  />
                  {m.status !== "thinking" && (
                    <StreamText
                      text={m.content}
                      caret={m.status === "streaming"}
                      onProgress={scrollToBottom}
                      onDone={() => finish(m.id)}
                      className="text-[14px] leading-relaxed whitespace-pre-wrap text-ink"
                    />
                  )}
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* composer */}
      <div className="shrink-0 px-4 pb-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            send(draft);
          }}
          onClick={() => inputRef.current?.focus()}
          className="mx-auto flex w-full max-w-3xl cursor-text items-center gap-2 rounded-[var(--radius-window)] border border-line bg-field p-2 pl-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.035)] transition-[border-color,box-shadow] duration-150 focus-within:border-line-strong"
        >
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Message Lumen…"
            aria-label="Message"
            className="min-h-6 flex-1 bg-transparent text-[14px] leading-relaxed text-ink outline-none placeholder:text-ink-3"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!draft.trim()}
            className="flex size-8 shrink-0 items-center justify-center rounded-[10px] transition-[background-color,color,transform] duration-200 enabled:active:scale-[0.96]"
            style={{
              background: draft.trim() ? "var(--ink)" : "var(--line-strong)",
              color: draft.trim() ? "var(--surface)" : "var(--ink-2)",
            }}
          >
            <ArrowUp size={17} strokeWidth={2.4} />
          </button>
        </form>
      </div>
    </div>
  );
}
