"use client";

import { useId } from "react";

/* ─────────────────────────────────────────────────────────
 * MINI CHART — a small, self-contained SVG line/area chart.
 * Replaces the exotic charting dep with a dependency-free SVG
 * that scales to its container (non-scaling strokes) and draws
 * smooth Catmull-Rom curves. Powers the Insight cards.
 * ───────────────────────────────────────────────────────── */

const W = 300;
const H = 166;

type Series = { color: string; values: number[]; fill?: boolean };

type Padding = { top: number; right: number; bottom: number; left: number };

function toPoints(
  values: number[],
  min: number,
  max: number,
  pad: Padding,
): { x: number; y: number }[] {
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const span = max - min || 1;
  const n = values.length;
  return values.map((v, i) => ({
    x: pad.left + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW),
    y: pad.top + (1 - (v - min) / span) * innerH,
  }));
}

/* Catmull-Rom → cubic bezier path for a smooth curve through every point. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

export function MiniChart({
  series,
  padding = { top: 34, right: 6, bottom: 22, left: 6 },
  grid = false,
  lineWidth = 2.25,
}: {
  series: Series[];
  padding?: Padding;
  grid?: boolean;
  lineWidth?: number;
}) {
  const uid = useId();
  const all = series.flatMap((s) => s.values);
  const min = Math.min(...all);
  const max = Math.max(...all);

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="block"
      aria-hidden
    >
      {grid &&
        [0.25, 0.5, 0.75].map((f) => {
          const y = padding.top + f * (H - padding.top - padding.bottom);
          return (
            <line
              key={f}
              x1={0}
              x2={W}
              y1={y}
              y2={y}
              stroke="var(--line)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

      {series.map((s, i) => {
        const pts = toPoints(s.values, min, max, padding);
        const line = smoothPath(pts);
        const gradId = `${uid}-fill-${i}`;
        const bottom = H - padding.bottom;
        const area = `${line} L ${pts[pts.length - 1].x} ${bottom} L ${pts[0].x} ${bottom} Z`;
        return (
          <g key={i}>
            {s.fill && (
              <>
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={area} fill={`url(#${gradId})`} stroke="none" />
              </>
            )}
            <path
              d={line}
              fill="none"
              stroke={s.color}
              strokeWidth={lineWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        );
      })}
    </svg>
  );
}
