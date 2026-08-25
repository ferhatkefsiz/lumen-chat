"use client";

import { useState } from "react";
import { MiniChart } from "@/components/primitives/MiniChart";

/* ─────────────────────────────────────────────────────────
 * INSIGHT CARDS
 * Embedded mini-visualizations in an "Insights N ‹ ›" carousel.
 * Wired to a small dependency-free SVG chart. Demo data models a
 * stock portfolio (returns, an anomaly, and allocation).
 * ───────────────────────────────────────────────────────── */

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const formatPercent = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
const formatMoney = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

function Entity({ name, tone }: { name: string; tone: string }) {
  return (
    <span className="inline-flex items-center gap-1 align-baseline font-medium text-ink">
      <span className={`inline-block size-2.5 rounded-full ${tone}`} />@{name}
    </span>
  );
}

function Mono({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "red" | "green";
}) {
  return (
    <code
      className={`font-mono text-[11.5px] ${tone === "red" ? "text-red" : "text-green"}`}
    >
      {children}
    </code>
  );
}

function chartIndexFromPointer(
  event: React.PointerEvent<HTMLDivElement>,
  pointCount: number,
) {
  const rect = event.currentTarget.getBoundingClientRect();
  const progress = Math.max(
    0,
    Math.min(1, (event.clientX - rect.left) / rect.width),
  );
  return Math.round(progress * (pointCount - 1));
}

function ChartTooltip({
  rows,
}: {
  rows: { label: string; value: string; color: string }[];
}) {
  return (
    <div className="insight-chart-tooltip">
      {rows.map((row) => (
        <span key={row.label} className="insight-chart-tooltip-item">
          <span
            className="insight-chart-tooltip-dot"
            style={{ background: row.color }}
          />
          {row.value}
        </span>
      ))}
    </div>
  );
}

/* 1 — return comparison: 2 series, legend + big deltas + line chart */
function CompareCard() {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const nvda = [0, 2.1, 3.4, 2.9, 5.2, 7.8, 9.6, 12.4];
  const aapl = [0, -0.6, -1.2, -0.8, -1.9, -2.4, -2.9, -3.2];
  const latestNvda = nvda.at(-1)!;
  const latestAapl = aapl.at(-1)!;

  return (
    <div className="min-h-[278px] rounded-card bg-surface p-3 shadow-hairline">
      <div className="flex items-center gap-4">
        {[
          {
            name: "NVDA",
            delta: formatPercent(latestNvda),
            sub: "+$8,420.00",
            tone: "green",
            dot: "bg-green",
          },
          {
            name: "AAPL",
            delta: formatPercent(latestAapl),
            sub: "-$1,180.00",
            tone: "red",
            dot: "bg-red",
          },
        ].map((s) => (
          <div key={s.name} className="flex-1">
            <span className="flex items-center gap-1.5 text-[11.5px] text-ink-2">
              <span className={`size-2 rounded-full ${s.dot}`} />
              {s.name}
            </span>
            <span
              className={`block text-[17px] font-semibold tracking-[-0.01em] tabular-nums ${s.tone === "red" ? "text-red" : "text-green"}`}
            >
              {s.delta}
            </span>
            <Mono tone={s.tone as "red" | "green"}>{s.sub}</Mono>
          </div>
        ))}
      </div>
      <div className="mt-2 overflow-hidden rounded-control bg-inset shadow-hairline">
        <div className="flex items-center justify-between border-b border-line px-2.5 py-1.5">
          <span className="text-[11px] text-ink-3 tabular-nums">
            5-day return
          </span>
          <span className="rounded-full bg-field px-2 py-0.5 text-[10.5px] font-medium text-ink-2">
            Snapshot
          </span>
        </div>
        <div
          className="insight-chart-stage relative h-[166px]"
          onPointerDown={(event) =>
            setHoverIndex(chartIndexFromPointer(event, nvda.length))
          }
          onPointerMove={(event) =>
            setHoverIndex(chartIndexFromPointer(event, nvda.length))
          }
          onPointerLeave={() => setHoverIndex(null)}
          onPointerCancel={() => setHoverIndex(null)}
          onPointerUp={() => setHoverIndex(null)}
        >
          <MiniChart
            series={[
              { color: "var(--green)", values: nvda },
              { color: "var(--red)", values: aapl },
            ]}
            padding={{ top: 40, right: 0, bottom: 22, left: 0 }}
          />
          {hoverIndex !== null && (
            <>
              <span
                className="insight-chart-cursor"
                style={{
                  left: `${(hoverIndex / (nvda.length - 1)) * 100}%`,
                }}
              />
              <span
                className="insight-chart-tooltip-anchor"
                style={{
                  left: `${Math.min(Math.max((hoverIndex / (nvda.length - 1)) * 100, 28), 72)}%`,
                }}
              >
                <ChartTooltip
                  rows={[
                    {
                      label: "NVDA",
                      value: formatPercent(nvda[hoverIndex]),
                      color: "var(--green)",
                    },
                    {
                      label: "AAPL",
                      value: formatPercent(aapl[hoverIndex]),
                      color: "var(--red)",
                    },
                  ]}
                />
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* 2 — anomaly: single series with threshold + big value */
function AnomalyCard() {
  const [metric, setMetric] = useState<"volume" | "price">("volume");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const volume = [42, 38, 45, 41, 47, 52, 98, 131];
  const price = [188, 191, 187, 193, 196, 201, 214, 238];

  const data = metric === "volume" ? volume : price;
  const label = metric === "volume" ? "3.1× avg" : "$238.10";
  const fmt = (v: number) =>
    metric === "volume" ? `${Math.round(v)}M sh` : formatMoney(v);

  return (
    <div className="min-h-[278px] rounded-card bg-surface p-3 shadow-hairline">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-ink">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--red)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          Unusual TSLA volume
        </span>
        <span className="rounded-full bg-field px-2 py-0.5 text-[10.5px] font-medium text-ink-2">
          Snapshot
        </span>
      </div>
      <div className="mt-2 overflow-hidden rounded-control bg-inset shadow-hairline">
        <div className="flex items-center justify-between border-b border-line px-2.5 py-1.5">
          <span className="text-[11px] text-ink-3 tabular-nums">
            {hoverIndex !== null ? fmt(data[hoverIndex]) : `${label} threshold`}
          </span>
          <span className="flex rounded-full bg-field p-0.5">
            {(["volume", "price"] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={metric === item}
                onClick={() => setMetric(item)}
                className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.96] ${
                  metric === item
                    ? "bg-surface text-ink shadow-btn"
                    : "text-ink-3 hover:text-ink-2"
                }`}
              >
                {item === "volume" ? "Volume" : "Price"}
              </button>
            ))}
          </span>
        </div>
        <div
          className="insight-chart-stage relative h-[166px]"
          onPointerDown={(event) =>
            setHoverIndex(chartIndexFromPointer(event, data.length))
          }
          onPointerMove={(event) =>
            setHoverIndex(chartIndexFromPointer(event, data.length))
          }
          onPointerLeave={() => setHoverIndex(null)}
          onPointerCancel={() => setHoverIndex(null)}
          onPointerUp={() => setHoverIndex(null)}
        >
          <MiniChart
            series={[{ color: "var(--red)", values: data, fill: true }]}
            grid
            padding={{ top: 34, right: 0, bottom: 22, left: 0 }}
          />
          {hoverIndex !== null && (
            <>
              <span
                className="insight-chart-cursor"
                style={{ left: `${(hoverIndex / (data.length - 1)) * 100}%` }}
              />
              <span
                className="insight-chart-tooltip-anchor"
                style={{
                  left: `${Math.min(Math.max((hoverIndex / (data.length - 1)) * 100, 28), 72)}%`,
                }}
              >
                <ChartTooltip
                  rows={[
                    {
                      label: metric,
                      value: fmt(data[hoverIndex]),
                      color: "var(--red)",
                    },
                  ]}
                />
              </span>
            </>
          )}
        </div>
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-[17px] font-semibold tracking-[-0.01em] text-ink tabular-nums">
          131M shares
        </span>
        <Mono tone="red">3.1× avg</Mono>
        <span className="text-[11px] text-ink-3">vs 30 days</span>
      </div>
    </div>
  );
}

/* 3 — allocation: hero number + segmented bar + legend */
function AllocationCard() {
  const segments = [
    {
      name: "NVDA",
      label: "NVIDIA",
      pct: 41,
      amount: "$84,050",
      cls: "bg-accent",
      tone: "text-accent-ink",
    },
    {
      name: "MSFT",
      label: "Microsoft",
      pct: 34,
      amount: "$69,700",
      cls: "bg-line-strong",
      tone: "text-ink-2",
    },
    {
      name: "AAPL",
      label: "Apple",
      pct: 25,
      amount: "$51,250",
      cls: "bg-line",
      tone: "text-ink-3",
    },
  ];
  const [selected, setSelected] = useState(segments[0].name);
  const active = segments.find((segment) => segment.name === selected) ?? segments[0];

  return (
    <div className="min-h-[278px] rounded-card bg-surface p-3 shadow-hairline">
      <span className="flex items-center gap-1.5 text-[12px] font-medium text-ink">
        <span className="flex size-3.5 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-on-accent">
          N
        </span>
        NVIDIA allocation
      </span>
      <span className="mt-1 block text-[20px] font-semibold tracking-[-0.01em] text-ink tabular-nums">
        {active.amount}
      </span>
      <div
        className="mt-3 flex h-9 gap-0.5 overflow-hidden rounded-full bg-field p-0.5"
        role="group"
        aria-label="Allocation segments"
      >
        {segments.map((s) => (
          <button
            key={s.name}
            type="button"
            aria-pressed={selected === s.name}
            aria-label={`${s.label}: ${s.pct}%`}
            onClick={() => setSelected(s.name)}
            className={`relative h-full overflow-hidden rounded-full ${s.cls} transition-[opacity,transform,box-shadow] duration-300 active:scale-[0.98]`}
            style={{
              width: `${s.pct}%`,
              opacity: selected === s.name ? 1 : 0.58,
              boxShadow:
                selected === s.name
                  ? "inset 0 0 0 1px rgba(255,255,255,0.22)"
                  : undefined,
              transitionTimingFunction: EASE,
            }}
          >
            <span
              className="absolute inset-y-1 left-1 rounded-full bg-white/20 transition-[width,opacity] duration-500"
              style={{
                width: selected === s.name ? "calc(100% - 8px)" : "0%",
                opacity: selected === s.name ? 1 : 0,
                transitionTimingFunction: EASE,
              }}
            />
          </button>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        {segments.map((s) => (
          <button
            key={s.name}
            type="button"
            aria-pressed={selected === s.name}
            onClick={() => setSelected(s.name)}
            className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] transition-[background-color,color,transform] duration-150 active:scale-[0.96] ${
              selected === s.name
                ? "bg-field text-ink"
                : "text-ink-2 hover:bg-hover hover:text-ink"
            }`}
          >
            <span className={`size-1.5 rounded-full ${s.cls}`} />
            {s.name} <span className="tabular-nums">{s.pct}%</span>
          </button>
        ))}
      </div>
      <div className="mt-3 min-h-16 rounded-control bg-inset px-2.5 py-2 shadow-hairline">
        <span className={`block text-[11.5px] font-medium ${active.tone}`}>
          {active.label}
        </span>
        <span className="mt-1 block text-[11px] leading-relaxed text-ink-3">
          Share of current portfolio value. Selecting a holding changes the
          inspected position without moving the card.
        </span>
      </div>
    </div>
  );
}

const PAGES = [
  {
    key: "compare",
    prose: (
      <>
        Your standout this week is <Entity name="NVDA" tone="bg-green" /> — up{" "}
        <Mono tone="green">+12.40%</Mono> or <Mono tone="green">+$8,420</Mono>.
      </>
    ),
    Card: CompareCard,
    pill: "Should I rebalance the book?",
  },
  {
    key: "anomaly",
    prose: (
      <>
        Unusual volume on <span className="font-medium text-ink">TSLA</span> —{" "}
        <Mono tone="red">3.1×</Mono> its 30-day average.
      </>
    ),
    Card: AnomalyCard,
    pill: "What's driving the TSLA spike?",
  },
  {
    key: "allocation",
    prose: (
      <>
        You’re heavily weighted in <Entity name="NVDA" tone="bg-accent" /> — it’s{" "}
        <span className="font-medium text-ink">41%</span> of the book.
      </>
    ),
    Card: AllocationCard,
    pill: "Model a more balanced allocation",
  },
];

export default function InsightCards() {
  const [page, setPage] = useState(0);

  const move = (direction: -1 | 1) => {
    setPage((current) => (current + direction + PAGES.length) % PAGES.length);
  };

  const { prose, Card, pill } = PAGES[page];

  return (
    <div className="min-h-[408px] w-full max-w-86">
      {/* pager header */}
      <div className="flex items-center justify-between">
        <span className="flex items-baseline gap-1.5">
          <span className="text-[13px] font-semibold text-ink">Insights</span>
          <span className="text-[13px] text-ink-3 tabular-nums">
            {PAGES.length}
          </span>
        </span>
        <span className="flex items-center gap-0.5">
          {(["M15 18l-6-6 6-6", "M9 6l6 6-6 6"] as const).map((d, i) => (
            <button
              key={i}
              aria-label={i === 0 ? "Previous insight" : "Next insight"}
              onClick={() => move(i === 0 ? -1 : 1)}
              className="flex size-6 items-center justify-center rounded-[6px] text-ink-3
                transition-[background-color,color,transform] duration-100 hover:bg-hover
                hover:text-ink active:scale-[0.96]"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={d} />
              </svg>
            </button>
          ))}
        </span>
      </div>

      {/* page content */}
      <div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">{prose}</p>
        <div className="mt-2">
          <Card />
        </div>
        <button
          className="mt-2 rounded-full bg-surface px-3 py-1.5 text-left text-[12px] text-ink
            shadow-btn transition-colors duration-100 hover:bg-hover"
        >
          {pill}
        </button>
      </div>
    </div>
  );
}
