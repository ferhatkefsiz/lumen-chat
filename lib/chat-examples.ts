/* Curated demo conversations — realistic staff-level frontend/backend prompts
 * paired with hand-written answers. Each answer opts into a rich block where it
 * genuinely helps: code for implementation asks, context for "what do our docs
 * say", an approval card for a decision that needs a human. */

export interface CodePayload {
  filename: string;
  language: string;
  code: string;
}

export type RichContent =
  | { kind: "code"; code: CodePayload }
  | { kind: "context" }
  | { kind: "approval" }
  | { kind: "insights" };

export interface ChatExample {
  id: string;
  question: string;
  /** ThinkingState variant: Steps | Search | Coding | Reasoning */
  variant: string;
  answer: string;
  rich?: RichContent;
  /** extra substrings that should resolve to this example */
  keywords?: string[];
}

const DEBOUNCE = `import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}`;

const WAU = `select
  date_trunc('week', created_at) as week,
  count(distinct user_id) as active_users
from events
where created_at >= now() - interval '8 weeks'
group by week
order by week desc;`;

const RATELIMIT = `import type { Request, Response, NextFunction } from "express";

const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(max = 100, windowMs = 60_000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const entry = hits.get(req.ip);
    if (!entry || now > entry.reset) {
      hits.set(req.ip, { count: 1, reset: now + windowMs });
      return next();
    }
    if (entry.count >= max) {
      return res.status(429).json({ error: "Too many requests" });
    }
    entry.count++;
    next();
  };
}`;

const USE_ONCE = `import { useEffect, useRef } from "react";

export function useOnce(effect: () => void) {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    effect();
  }, []);
}`;

export const EXAMPLES: ChatExample[] = [
  {
    id: "debounce",
    question: "How do I debounce a search input in React?",
    variant: "Coding",
    answer:
      "Wrap the value in a small hook that delays updates, then drive your query off the debounced value. Typing stays responsive while the number of requests drops sharply:",
    rich: {
      kind: "code",
      code: { filename: "useDebouncedValue.ts", language: "ts", code: DEBOUNCE },
    },
    keywords: ["debounce"],
  },
  {
    id: "wau",
    question: "Write SQL for weekly active users",
    variant: "Coding",
    answer:
      "Here's a query that buckets distinct users by ISO week over the last two months, newest first. Swap `events` for your activity table if it lives elsewhere:",
    rich: {
      kind: "code",
      code: {
        filename: "weekly_active_users.sql",
        language: "sql",
        code: WAU,
      },
    },
    keywords: ["sql", "weekly active", "wau", "active users"],
  },
  {
    id: "ratelimit",
    question: "Add rate limiting to my Express API",
    variant: "Coding",
    answer:
      "A fixed-window counter is dependency-free and good enough for most APIs. Register it before your routes; move the Map to Redis once you run more than one instance:",
    rich: {
      kind: "code",
      code: { filename: "rateLimit.ts", language: "ts", code: RATELIMIT },
    },
    keywords: ["rate limit", "ratelimit", "throttle", "express"],
  },
  {
    id: "useeffect",
    question: "Why does my useEffect run twice?",
    variant: "Steps",
    answer:
      "In development, React's StrictMode mounts, unmounts, and remounts every component to surface unsafe effects — so your effect runs twice. It won't happen in production. For a genuinely one-time side effect, guard it with a ref:",
    rich: {
      kind: "code",
      code: { filename: "useOnce.ts", language: "ts", code: USE_ONCE },
    },
    keywords: ["useeffect", "run twice", "twice", "strictmode"],
  },
  {
    id: "portfolio",
    question: "How is my stock portfolio doing this week?",
    variant: "Steps",
    answer:
      "I pulled your positions and ran the weekly numbers. Here's the snapshot — page through returns, an anomaly I flagged, and your current allocation:",
    rich: { kind: "insights" },
    keywords: [
      "portfolio",
      "stock",
      "stocks",
      "market",
      "holdings",
      "returns this week",
      "how is my",
    ],
  },
  {
    id: "deploy-docs",
    question: "What do our docs say about deployments?",
    variant: "Search",
    answer:
      "I pulled the most relevant sources from the workspace. The runbook and the latest metrics export are what apply here:",
    rich: { kind: "context" },
    keywords: ["docs", "deployment", "deploy", "runbook", "context"],
  },
  {
    id: "release",
    question: "Plan the v0.3 release rollout",
    variant: "Reasoning",
    answer: "Before I draft the rollout plan, I need a few decisions from you:",
    rich: { kind: "approval" },
    keywords: ["release", "rollout", "ship", "launch", "deploy v"],
  },
];

/** Questions surfaced as empty-state suggestions (kept diverse across block types). */
export const SUGGESTED_IDS = ["debounce", "portfolio", "deploy-docs", "release"];

export const DEFAULT_REPLY = {
  variant: "Steps",
  answer:
    "Here's how I'd approach that. Give me the specifics — the file, the constraint, or the shape of the data — and I'll turn it into concrete steps or code you can drop in.",
} as const;

export function findExample(text: string): ChatExample | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  const exact = EXAMPLES.find((e) => e.question.toLowerCase() === t);
  if (exact) return exact;
  return (
    EXAMPLES.find((e) =>
      (e.keywords ?? []).some((kw) => t.includes(kw)),
    ) ?? null
  );
}
