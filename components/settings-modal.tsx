"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Bell,
  Keyboard,
  Database,
  Palette,
  Search,
  Settings2,
  Shield,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { SegmentedControl } from "@/components/atoms/SegmentedControl";
import { Switch } from "@/components/atoms/Switch";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

type CategoryKey =
  | "general"
  | "appearance"
  | "notifications"
  | "personalization"
  | "data"
  | "security"
  | "account"
  | "keyboard";

const CATEGORIES: {
  key: CategoryKey;
  label: string;
  icon: React.ReactNode;
  desc: string;
}[] = [
  { key: "general", label: "General", icon: <Settings2 size={17} />, desc: "Account basics and defaults" },
  { key: "appearance", label: "Appearance", icon: <Palette size={17} />, desc: "Theme, accent and motion" },
  { key: "notifications", label: "Notifications", icon: <Bell size={17} />, desc: "How Lumen reaches you" },
  { key: "personalization", label: "Personalization", icon: <Sparkles size={17} />, desc: "Custom instructions and memory" },
  { key: "data", label: "Data controls", icon: <Database size={17} />, desc: "Export or clear your data" },
  { key: "security", label: "Security", icon: <Shield size={17} />, desc: "Sign-in and sessions" },
  { key: "account", label: "Account", icon: <User size={17} />, desc: "Profile and plan" },
  { key: "keyboard", label: "Keyboard", icon: <Keyboard size={17} />, desc: "Shortcuts" },
];

function Field({
  label,
  desc,
  control,
}: {
  label: string;
  desc?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3.5 last:border-0">
      <div className="flex min-w-0 flex-col">
        <span className="text-[14px] text-ink">{label}</span>
        {desc && <span className="text-[12.5px] text-ink-3">{desc}</span>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-control bg-field py-1.5 pr-8 pl-3 text-[13px] font-medium text-ink shadow-btn outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-ink-3">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
    </div>
  );
}

function SecureAccountCard() {
  return (
    <div className="mb-5 flex flex-col items-start gap-3 rounded-card bg-inset p-4 shadow-hairline">
      <span className="flex size-9 items-center justify-center rounded-[10px] bg-accent-tint text-accent-ink">
        <Shield size={18} />
      </span>
      <div className="flex flex-col gap-1">
        <span className="text-[14px] font-semibold text-ink">
          Secure your account
        </span>
        <span className="max-w-md text-[12.5px] leading-relaxed text-ink-2">
          Add multi-factor authentication (MFA) — like an authenticator app — to
          help protect your account when you sign in.
        </span>
      </div>
      <Button variant="secondary" size="sm">
        Set up MFA
      </Button>
    </div>
  );
}

function GeneralPanel() {
  const [lang, setLang] = useState("Auto-detect");
  const [smart, setSmart] = useState(true);
  const [suggest, setSuggest] = useState(true);
  return (
    <>
      <SecureAccountCard />
      <Field
        label="Language"
        desc="Interface language"
        control={
          <Select
            value={lang}
            onChange={setLang}
            options={["Auto-detect", "English", "Türkçe", "Deutsch"]}
          />
        }
      />
      <Field
        label="Higher intelligence"
        desc="Use a more capable model for complex questions"
        control={<Switch checked={smart} onChange={setSmart} label="Higher intelligence" />}
      />
      <Field
        label="Follow-up suggestions"
        desc="Show suggested prompts after a reply"
        control={<Switch checked={suggest} onChange={setSuggest} label="Follow-up suggestions" />}
      />
    </>
  );
}

function AppearancePanel() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current =
    !mounted || theme === "system"
      ? "System"
      : theme === "dark"
        ? "Dark"
        : "Light";

  const [accent, setAccent] = useState("Indigo");
  const [reduceMotion, setReduceMotion] = useState(false);

  return (
    <>
      <Field
        label="Appearance"
        desc="Light, dark, or match your system"
        control={
          <SegmentedControl
            options={["Light", "Dark", "System"] as const}
            value={current}
            onChange={(v) => setTheme(v.toLowerCase())}
          />
        }
      />
      <Field
        label="Accent color"
        control={
          <Select
            value={accent}
            onChange={setAccent}
            options={["Indigo", "Blue", "Amber", "Neutral"]}
          />
        }
      />
      <Field
        label="Reduce motion"
        desc="Minimize non-essential animations"
        control={<Switch checked={reduceMotion} onChange={setReduceMotion} label="Reduce motion" />}
      />
    </>
  );
}

function ToggleList({
  items,
}: {
  items: { label: string; desc?: string; default: boolean }[];
}) {
  const [state, setState] = useState(items.map((i) => i.default));
  return (
    <>
      {items.map((item, i) => (
        <Field
          key={item.label}
          label={item.label}
          desc={item.desc}
          control={
            <Switch
              checked={state[i]}
              onChange={(v) =>
                setState((s) => s.map((x, j) => (j === i ? v : x)))
              }
              label={item.label}
            />
          }
        />
      ))}
    </>
  );
}

function AccountPanel() {
  return (
    <>
      <Field label="Name" control={<span className="text-[13px] text-ink-2">Ferhat Kefsiz</span>} />
      <Field label="Email" control={<span className="text-[13px] text-ink-2">ferhat@lumen.app</span>} />
      <Field
        label="Plan"
        desc="Billed monthly"
        control={
          <span className="rounded-full bg-accent-tint px-2.5 py-1 text-[12px] font-medium text-accent-ink">
            Pro
          </span>
        }
      />
      <Field
        label="Delete account"
        desc="Permanently remove your account and data"
        control={
          <button className="rounded-control px-3 py-1.5 text-[13px] font-medium text-red transition-colors hover:bg-red-tint">
            Delete
          </button>
        }
      />
    </>
  );
}

function DataPanel() {
  return (
    <>
      <Field
        label="Export data"
        desc="Download a copy of your conversations"
        control={<Button variant="secondary" size="sm">Export</Button>}
      />
      <Field
        label="Clear conversations"
        desc="Remove all chats from this workspace"
        control={
          <button className="rounded-control px-3 py-1.5 text-[13px] font-medium text-red transition-colors hover:bg-red-tint">
            Clear all
          </button>
        }
      />
      <Field
        label="Improve the model for everyone"
        desc="Allow your content to be used to train Lumen"
        control={<Switch checked={false} onChange={() => {}} label="Training" />}
      />
    </>
  );
}

function KeyboardPanel() {
  const shortcuts = [
    { label: "New chat", keys: "⌘ N" },
    { label: "Search chats", keys: "⌘ K" },
    { label: "Toggle sidebar", keys: "⌘ B" },
    { label: "Toggle theme", keys: "⌘ ⇧ L" },
  ];
  return (
    <>
      {shortcuts.map((s) => (
        <Field
          key={s.label}
          label={s.label}
          control={
            <kbd className="rounded-md bg-inset px-2 py-1 font-mono text-[12px] text-ink-2 shadow-hairline">
              {s.keys}
            </kbd>
          }
        />
      ))}
    </>
  );
}

function Panel({ category }: { category: CategoryKey }) {
  switch (category) {
    case "general":
      return <GeneralPanel />;
    case "appearance":
      return <AppearancePanel />;
    case "notifications":
      return (
        <ToggleList
          items={[
            { label: "Email notifications", desc: "Product updates and tips", default: true },
            { label: "Push notifications", desc: "Replies and mentions", default: false },
            { label: "Weekly summary", desc: "A digest of your activity", default: true },
          ]}
        />
      );
    case "personalization":
      return (
        <ToggleList
          items={[
            { label: "Custom instructions", desc: "Tailor replies to your preferences", default: true },
            { label: "Memory", desc: "Let Lumen remember details across chats", default: true },
          ]}
        />
      );
    case "data":
      return <DataPanel />;
    case "security":
      return (
        <ToggleList
          items={[
            { label: "Two-factor authentication", desc: "Require a code at sign-in", default: false },
            { label: "Log out other sessions", desc: "Sign out everywhere else", default: false },
          ]}
        />
      );
    case "account":
      return <AccountPanel />;
    case "keyboard":
      return <KeyboardPanel />;
  }
}

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState<CategoryKey>("general");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const filtered = CATEGORIES.filter((c) =>
    c.label.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const activeMeta = CATEGORIES.find((c) => c.key === active)!;

  const searchBox = (
    <div className="flex h-9 items-center gap-2 rounded-control bg-field px-2.5 shadow-hairline">
      <Search size={15} className="shrink-0 text-ink-3" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search settings"
        aria-label="Search settings"
        className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3"
      />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex bg-[oklch(0_0_0/0.45)] md:items-center md:justify-center md:p-6"
      style={{ animation: "fade-in 150ms ease-out both" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full flex-col overflow-hidden bg-surface md:h-[600px] md:max-h-[86vh] md:w-[880px] md:max-w-[94vw] md:flex-row md:rounded-[var(--radius-window)] md:shadow-overlay"
        style={{ animation: "pop-in 200ms cubic-bezier(0.23,1,0.32,1) both" }}
      >
        {/* Desktop rail */}
        <aside className="hidden shrink-0 flex-col gap-3 border-r border-line p-3 md:flex md:w-[248px]">
          <div className="flex items-center">
            <button
              type="button"
              aria-label="Close settings"
              onClick={onClose}
              className="primitive-icon-button text-ink-3 transition-colors hover:bg-hover hover:text-ink"
            >
              <X size={18} />
            </button>
          </div>
          {searchBox}
          <nav className="flex flex-col gap-0.5">
            {filtered.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setActive(c.key)}
                className={cn(
                  "flex items-center gap-2.5 rounded-control px-2.5 py-2 text-left text-[13.5px] transition-colors",
                  c.key === active
                    ? "bg-hover-2 text-ink"
                    : "text-ink-2 hover:bg-hover hover:text-ink",
                )}
              >
                <span className="shrink-0 text-ink-3">{c.icon}</span>
                {c.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile header */}
          <div className="flex shrink-0 flex-col gap-3 border-b border-line p-4 md:hidden">
            <div className="flex items-center justify-between">
              <span className="text-[17px] font-semibold text-ink">
                Settings
              </span>
              <button
                type="button"
                aria-label="Close settings"
                onClick={onClose}
                className="primitive-icon-button text-ink-3 transition-colors hover:bg-hover hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>
            {searchBox}
            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {filtered.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setActive(c.key)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                    c.key === active
                      ? "bg-ink text-canvas"
                      : "bg-inset text-ink-2 hover:text-ink",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-y-auto p-5 md:p-6">
            <div className="mb-4 flex flex-col gap-0.5">
              <h2 className="text-[18px] font-semibold tracking-tight text-ink">
                {activeMeta.label}
              </h2>
              <p className="text-[13px] text-ink-3">{activeMeta.desc}</p>
            </div>
            <Panel category={active} />
          </div>
        </div>
      </div>
    </div>
  );
}
