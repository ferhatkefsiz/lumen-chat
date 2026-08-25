"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * CODE BLOCK
 * Agent-written code streams line by line; copy is live.
 * Lightweight tokenizer so any snippet gets syntax colors.
 * ───────────────────────────────────────────────────────── */

const LINE_MS = 200;

type Tok = { t: string; c?: "kw" | "str" | "num" | "fn" | "dim" };

const COLORS: Record<string, string> = {
  kw: "var(--accent-ink)",
  str: "var(--green)",
  num: "var(--orange)",
  fn: "var(--ink)",
  dim: "var(--ink-3)",
};

const JS_KEYWORDS = new Set([
  "const", "let", "var", "function", "async", "await", "return", "if", "else",
  "for", "while", "new", "throw", "import", "export", "from", "default", "type",
  "interface", "extends", "class", "of", "in", "typeof", "as", "void", "yield",
  "switch", "case", "break", "continue", "true", "false", "null", "undefined",
]);

const SQL_KEYWORDS = new Set([
  "select", "from", "where", "group", "by", "order", "having", "join", "left",
  "right", "inner", "outer", "on", "as", "and", "or", "not", "in", "distinct",
  "count", "sum", "avg", "min", "max", "date_trunc", "interval", "limit", "desc",
  "asc", "with", "over", "partition", "between", "case", "when", "then", "end", "now",
]);

const LANG_LABELS: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TypeScript",
  js: "JavaScript",
  jsx: "JavaScript",
  sql: "SQL",
};

function tokenizeLine(line: string, lang: string): Tok[] {
  const isSql = lang === "sql";
  const keywords = isSql ? SQL_KEYWORDS : JS_KEYWORDS;
  const commentMark = isSql ? "--" : "//";
  const toks: Tok[] = [];
  const push = (t: string, c?: Tok["c"]) => t && toks.push({ t, c });
  const isWord = (ch: string) => /[A-Za-z0-9_$]/.test(ch);
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    if (line.startsWith(commentMark, i)) {
      push(line.slice(i), "dim");
      break;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      let j = i + 1;
      while (j < line.length && line[j] !== ch) {
        if (line[j] === "\\") j++;
        j++;
      }
      push(line.slice(i, Math.min(j + 1, line.length)), "str");
      i = j + 1;
      continue;
    }

    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < line.length && /[0-9._]/.test(line[j])) j++;
      push(line.slice(i, j), "num");
      i = j;
      continue;
    }

    if (/[A-Za-z_$]/.test(ch)) {
      let j = i;
      while (j < line.length && isWord(line[j])) j++;
      const word = line.slice(i, j);
      if (keywords.has(isSql ? word.toLowerCase() : word)) {
        push(word, "kw");
      } else {
        let k = j;
        while (k < line.length && line[k] === " ") k++;
        push(word, line[k] === "(" ? "fn" : undefined);
      }
      i = j;
      continue;
    }

    // punctuation / whitespace run
    let j = i;
    while (
      j < line.length &&
      !isWord(line[j]) &&
      line[j] !== '"' &&
      line[j] !== "'" &&
      line[j] !== "`" &&
      !line.startsWith(commentMark, j)
    ) {
      j++;
    }
    push(line.slice(i, j), "dim");
    i = j;
  }

  return toks;
}

export default function CodeBlock({
  filename,
  language,
  code,
}: {
  filename: string;
  language: string;
  code: string;
}) {
  const lines = useMemo(
    () => code.split("\n").map((line) => tokenizeLine(line, language)),
    [code, language],
  );
  const [count, setCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const done = count >= lines.length;

  /* stream in once, then hold — replaying reads as noise */
  useEffect(() => {
    if (done) return;
    const t = setTimeout(
      () => setCount((c) => c + 1),
      count === 0 ? 300 : LINE_MS,
    );
    return () => clearTimeout(t);
  }, [count, done]);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [code]);

  return (
    <div className="w-full overflow-hidden rounded-card bg-surface shadow-card">
      {/* header */}
      <div className="primitive-card-bar flex items-center justify-between border-b border-line">
        <span className="flex items-center gap-2">
          <svg
            aria-hidden
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-ink-3"
          >
            <path d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
          </svg>
          <span className="font-mono text-[12px] font-medium text-ink">
            {filename}
          </span>
          <span className="text-[11.5px] text-ink-3">
            {LANG_LABELS[language] ?? language}
          </span>
        </span>
        <button
          aria-label="Copy code"
          onClick={copy}
          className={`flex h-6 items-center gap-1 rounded-[6px] px-1.5 text-[11.5px]
            font-medium transition-colors duration-100 hover:bg-hover
            ${copied ? "text-green" : "text-ink-3 hover:text-ink"}`}
        >
          {copied ? (
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="12" height="12" rx="2.5" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* code */}
      <pre className="overflow-x-auto bg-inset px-3 py-2.5 font-mono text-[11.5px] leading-[1.7]">
        {lines.slice(0, count).map((line, i) => (
          <div
            key={i}
            className="flex"
            style={{ animation: "fade-up 250ms cubic-bezier(0.23,1,0.32,1) both" }}
          >
            <span className="w-7 shrink-0 border-r border-line pr-2 text-right text-[10.5px] leading-[1.86] text-ink-3/60 select-none">
              {i + 1}
            </span>
            <span className="pl-3 whitespace-pre">
              {line.length === 0 ? (
                <span> </span>
              ) : (
                line.map((tok, j) => (
                  <span
                    key={j}
                    style={{ color: tok.c ? COLORS[tok.c] : "var(--ink-2)" }}
                  >
                    {tok.t}
                  </span>
                ))
              )}
              {i === count - 1 && !done && (
                <span className="ml-0.5 inline-block h-3 w-[3px] translate-y-0.5 rounded-full bg-accent" />
              )}
            </span>
          </div>
        ))}
      </pre>
    </div>
  );
}
