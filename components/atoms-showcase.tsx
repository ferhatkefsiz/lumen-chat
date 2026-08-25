"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Chip } from "@/components/atoms/Chip";
import { StatusPill } from "@/components/atoms/StatusPill";
import { Switch } from "@/components/atoms/Switch";
import { Shimmer } from "@/components/atoms/Shimmer";
import { SegmentedControl } from "@/components/atoms/SegmentedControl";

const VIEWS = ["Chat", "Runs", "Insights"] as const;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-t border-line py-5 first:border-t-0 sm:flex-row sm:items-center">
      <span className="w-32 shrink-0 text-[13px] font-medium text-ink-3">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2.5">{children}</div>
    </div>
  );
}

export function AtomsShowcase() {
  const [on, setOn] = useState(true);
  const [view, setView] = useState<(typeof VIEWS)[number]>("Chat");

  return (
    <section className="rounded-[var(--radius-card)] bg-surface px-5 shadow-card">
      <Row label="Button">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="accent">Accent</Button>
        <Button variant="success">Success</Button>
        <Button variant="secondary" size="sm">
          Small
        </Button>
      </Row>

      <Row label="StatusPill">
        <StatusPill tone="green">Ready</StatusPill>
        <StatusPill tone="orange">Running</StatusPill>
        <StatusPill tone="red">Failed</StatusPill>
        <StatusPill tone="accent">Beta</StatusPill>
        <StatusPill tone="neutral">Draft</StatusPill>
      </Row>

      <Row label="Chip">
        <Chip>updated_at</Chip>
        <Chip tone="accent">model</Chip>
        <Chip tone="orange">temperature</Chip>
      </Row>

      <Row label="Switch">
        <Switch checked={on} onChange={setOn} label="Toggle setting" />
        <span className="text-[13px] text-ink-2">{on ? "On" : "Off"}</span>
      </Row>

      <Row label="Segmented">
        <SegmentedControl options={VIEWS} value={view} onChange={setView} />
      </Row>

      <Row label="Shimmer">
        <Shimmer className="text-sm font-medium">Thinking…</Shimmer>
      </Row>
    </section>
  );
}
