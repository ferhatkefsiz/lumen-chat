"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ThinkingState from "@/components/primitives/ThinkingState";
import CodeBlock from "@/components/primitives/CodeBlock";
import ContextCards from "@/components/primitives/ContextCards";
import ApprovalCard from "@/components/primitives/ApprovalCard";
import InsightCards from "@/components/primitives/InsightCards";
import PromptBar from "@/components/primitives/PromptBar";
import { StreamText } from "@/components/atoms/StreamText";
import {
  DEFAULT_REPLY,
  EXAMPLES,
  SUGGESTED_IDS,
  findExample,
  type RichContent,
} from "@/lib/chat-examples";

type Role = "user" | "assistant";
type Status = "thinking" | "streaming" | "done";

interface Message {
  id: string;
  role: Role;
  content: string;
  status?: Status;
  variant?: string;
  rich?: RichContent;
}

const SUGGESTIONS = SUGGESTED_IDS.map(
  (id) => EXAMPLES.find((e) => e.id === id)!.question,
);

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleSetRef = useRef(false);
  const sentInitialRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const example = findExample(trimmed);
      const assistantId = nextId();
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "user", content: trimmed },
        {
          id: assistantId,
          role: "assistant",
          content: example?.answer ?? DEFAULT_REPLY.answer,
          status: "thinking",
          variant: example?.variant ?? DEFAULT_REPLY.variant,
          rich: example?.rich,
        },
      ]);
      if (!titleSetRef.current) {
        titleSetRef.current = true;
        onTitle?.(trimmed);
      }
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
  // The ref guard keeps StrictMode's double-mount from sending it twice.
  useEffect(() => {
    if (initialPrompt && !sentInitialRef.current) {
      sentInitialRef.current = true;
      send(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const empty = messages.length === 0;

  // New chat: the composer sits centered, a little taller, with a scrollable
  // row of suggestions beneath it.
  if (empty) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-10">
        <div className="w-full max-w-3xl">
          <h1 className="mb-6 text-center text-[26px] font-normal tracking-[-0.02em] text-ink">
            <span className="home-reveal block text-ink-3">Hello Ferhat</span>
            <span className="home-reveal block" style={{ animationDelay: "90ms" }}>
              What can I help you with?
            </span>
          </h1>
          <PromptBar
            demo={false}
            tall
            placeholder="Message Lumen…"
            onSend={send}
          />
          <div className="mt-3">
            <div className="fade-x flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="shrink-0 rounded-full bg-inset px-3 py-1.5 text-[13px] font-medium whitespace-nowrap text-ink-2 shadow-hairline transition-colors hover:bg-hover hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* messages */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end pl-10">
                <div className="max-w-[80%] rounded-2xl bg-field px-3.5 py-2 text-[14px] leading-relaxed text-ink">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex flex-col gap-3">
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
                {m.status === "done" && m.rich && (
                  <div className="pt-1">
                    {m.rich.kind === "code" && <CodeBlock {...m.rich.code} />}
                    {m.rich.kind === "context" && <ContextCards />}
                    {m.rich.kind === "approval" && <ApprovalCard />}
                    {m.rich.kind === "insights" && <InsightCards />}
                  </div>
                )}
              </div>
            ),
          )}
        </div>
      </div>

      {/* composer */}
      <div className="shrink-0 px-4 pb-4">
        <div className="mx-auto w-full max-w-3xl">
          <PromptBar demo={false} placeholder="Message Lumen…" onSend={send} />
        </div>
      </div>
    </div>
  );
}
