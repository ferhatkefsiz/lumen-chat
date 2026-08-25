"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  Home,
  LogOut,
  PanelLeft,
  Search,
  Settings,
  SquarePen,
  UserPlus,
  X,
} from "lucide-react";
import GlideMenu from "@/components/primitives/GlideMenu";

/* ─────────────────────────────────────────────────────────
 * SIDEBAR NAV
 * Brand header, primary navigation, searchable chat history, and
 * a user profile footer whose menu opens Settings. Collapses to a
 * 52px rail while preserving icon alignment.
 * ───────────────────────────────────────────────────────── */

const BRAND = { name: "Lumen", monogram: "L" };
const USER = {
  name: "Ferhat Kefsiz",
  email: "ferhat@lumen.app",
  monogram: "F",
};

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: <Home size={18} /> },
  {
    key: "invite",
    label: "Invite users",
    icon: <UserPlus size={18} />,
    count: "3/10",
  },
];

export type SidebarRecent = {
  id: string;
  label: string;
  prompt?: string;
};

const DEFAULT_RECENTS: SidebarRecent[] = [
  { id: "metrics", label: "Summarize Q3 metrics" },
  { id: "release", label: "Draft release notes" },
  { id: "auth", label: "Debug the auth flow" },
  { id: "sprint", label: "Plan next sprint" },
];

type SidebarNavProps = {
  activeTitle?: string | null;
  className?: string;
  fill?: boolean;
  onNewChat?: () => void;
  onPick?: (id: string, label: string, prompt?: string) => void;
  activeNav?: string;
  onNavigate?: (key: string) => void;
  onOpenSettings?: () => void;
  recents?: SidebarRecent[];
};

const SIDEBAR_MOTION = {
  expandedWidth: 224,
  collapsedWidth: 52,
  duration: 280,
  copyDuration: 180,
  copyOffset: 8,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
};

const CHAT_SEARCH_MOTION = {
  duration: 180,
  closedWidth: 28,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
};

function GlideGroup({ children }: { children: ReactNode }) {
  return (
    <GlideMenu
      rowSelector="[data-row]"
      highlightClassName="sidebar-glide-highlight rounded-[7px] bg-hover-2"
      className="group/glide flex flex-col gap-px"
    >
      {children}
    </GlideMenu>
  );
}

function RailButton({
  icon,
  label,
  active = false,
  count,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  count?: string;
  onClick?: () => void;
}) {
  return (
    <button
      data-row
      type="button"
      onClick={onClick}
      className={`sidebar-row relative z-10 mx-2 flex h-8 items-center rounded-[8px] px-2 text-left
        transition-[width,background-color,color,transform] duration-150 active:scale-[0.98]
        ${active ? "bg-hover-2 group-hover/glide:bg-transparent" : ""}`}
    >
      <span
        className={`flex size-5 shrink-0 items-center justify-center ${active ? "text-ink" : "text-ink-2"}`}
      >
        {icon}
      </span>
      <span
        className={`sidebar-copy ml-1.5 min-w-0 flex-1 truncate text-[14px] font-medium ${active ? "text-ink" : "text-ink-2"}`}
      >
        {label}
      </span>
      {count && (
        <span className="sidebar-copy mr-2 shrink-0 text-[12px] font-medium tabular-nums text-ink-3">
          {count}
        </span>
      )}
    </button>
  );
}

/* user menu — opens upward from the profile footer */
function UserMenu({
  position,
  onClose,
  onOpenSettings,
}: {
  position: { bottom: number; left: number; width: number };
  onClose: () => void;
  onOpenSettings?: () => void;
}) {
  return createPortal(
    <div
      data-user-menu
      className="fixed z-50 rounded-[14px] bg-surface p-1.5 shadow-overlay"
      style={{
        bottom: position.bottom,
        left: position.left,
        width: Math.max(position.width, 220),
        animation: "pop-in 160ms cubic-bezier(0.23,1,0.32,1) both",
        transformOrigin: "bottom left",
      }}
    >
      <div className="flex items-center gap-2 px-2 py-1.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-surface">
          {USER.monogram}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[13px] font-medium text-ink">
            {USER.name}
          </span>
          <span className="truncate text-[11.5px] text-ink-3">{USER.email}</span>
        </span>
      </div>
      <div className="my-1 h-px bg-line" />
      <GlideMenu
        className="flex flex-col gap-px"
        highlightClassName="inset-x-0 rounded-[8px] bg-hover-2"
      >
        <button
          data-menu-row
          type="button"
          onClick={() => {
            onClose();
            onOpenSettings?.();
          }}
          className="relative z-10 flex h-9 w-full items-center gap-2 rounded-[8px] px-2 text-left"
        >
          <span className="flex size-5 shrink-0 items-center justify-center text-ink-2">
            <Settings size={16} />
          </span>
          <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">
            Settings
          </span>
        </button>
        <button
          data-menu-row
          type="button"
          onClick={onClose}
          className="relative z-10 flex h-9 w-full items-center gap-2 rounded-[8px] px-2 text-left"
        >
          <span className="flex size-5 shrink-0 items-center justify-center text-ink-2">
            <LogOut size={16} />
          </span>
          <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">
            Sign out
          </span>
        </button>
      </GlideMenu>
    </div>,
    document.body,
  );
}

export default function SidebarNav({
  activeTitle,
  className = "",
  fill = false,
  onNewChat,
  onPick,
  activeNav,
  onNavigate,
  onOpenSettings,
  recents = DEFAULT_RECENTS,
}: SidebarNavProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [internalNav, setInternalNav] = useState("chats");
  const currentNav = activeNav ?? internalNav;
  const selectNav = (key: string) => {
    setInternalNav(key);
    onNavigate?.(key);
  };
  const [demoActiveTitle, setDemoActiveTitle] = useState<string | null>(null);
  const [userOpen, setUserOpen] = useState(false);
  const [userPosition, setUserPosition] = useState({
    bottom: 0,
    left: 0,
    width: 0,
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedTitle =
    activeTitle === undefined ? demoActiveTitle : activeTitle;
  const visibleRecents = recents.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  useEffect(() => {
    if (!userOpen) return;
    const close = (event: PointerEvent) => {
      const target = event.target as Element;
      if (
        !target.closest("[data-user-trigger]") &&
        !target.closest("[data-user-menu]")
      ) {
        setUserOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [userOpen]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const collapse = () => {
    setCollapsed(true);
    setUserOpen(false);
    setSearchOpen(false);
    setQuery("");
  };

  const toggleUser = () => {
    if (!userOpen && userButtonRef.current) {
      const rect = userButtonRef.current.getBoundingClientRect();
      setUserPosition({
        bottom: window.innerHeight - rect.top + 6,
        left: rect.left,
        width: rect.width,
      });
    }
    setUserOpen((open) => !open);
  };

  return (
    <aside
      data-sidebar-collapsed={collapsed}
      aria-label="Workspace navigation"
      className={`relative flex shrink-0 overflow-hidden transition-[width] ${fill ? "h-full" : "h-[600px]"} ${className}`}
      style={
        {
          width: collapsed
            ? SIDEBAR_MOTION.collapsedWidth
            : SIDEBAR_MOTION.expandedWidth,
          transitionDuration: `${SIDEBAR_MOTION.duration}ms`,
          transitionTimingFunction: SIDEBAR_MOTION.easing,
          "--sidebar-copy-duration": `${SIDEBAR_MOTION.copyDuration}ms`,
          "--sidebar-copy-offset": `${SIDEBAR_MOTION.copyOffset}px`,
          "--sidebar-easing": SIDEBAR_MOTION.easing,
        } as CSSProperties
      }
    >
      <div className="flex min-h-0 w-[224px] shrink-0 flex-col">
        {/* brand header */}
        <div className="relative mb-2.5 h-10 shrink-0">
          <div className="sidebar-workspace-control absolute left-2 top-1 flex h-8 w-[164px] items-center px-2">
            <span className="sidebar-logo flex size-5 shrink-0 items-center justify-center rounded-[6px] bg-ink text-[10px] font-semibold text-surface">
              {BRAND.monogram}
            </span>
            <span className="sidebar-copy ml-1.5 min-w-0 flex-1 truncate text-[14px] font-semibold tracking-tight text-ink">
              {BRAND.name}
            </span>
          </div>

          <button
            type="button"
            aria-label="Collapse sidebar"
            aria-hidden={collapsed}
            tabIndex={collapsed ? -1 : 0}
            onClick={collapse}
            className="sidebar-collapse-control absolute right-2 top-1 flex size-8 items-center justify-center rounded-[8px] text-ink-3 transition-[opacity,background-color,color] duration-150 hover:bg-hover-2 hover:text-ink"
          >
            <PanelLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Expand sidebar"
            aria-hidden={!collapsed}
            tabIndex={collapsed ? 0 : -1}
            onClick={() => setCollapsed(false)}
            className="sidebar-expand-control absolute left-2 top-0.5 flex size-9 items-center justify-center rounded-[8px] text-ink-3 transition-[opacity,background-color,color] duration-150 hover:bg-hover-2 hover:text-ink"
          >
            <PanelLeft size={18} />
          </button>
        </div>

        <GlideGroup>
          <RailButton
            icon={<SquarePen size={18} />}
            label="New chat"
            onClick={() => {
              if (activeTitle === undefined) setDemoActiveTitle(null);
              selectNav("chats");
              onNewChat?.();
            }}
          />
          {NAV_ITEMS.map((item) => (
            <RailButton
              key={item.key}
              icon={item.icon}
              label={item.label}
              count={item.count}
              active={currentNav === item.key}
              onClick={() => selectNav(item.key)}
            />
          ))}
        </GlideGroup>

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
          <div className="sidebar-copy relative mx-2 mb-1 h-8">
            <div
              aria-hidden={searchOpen}
              className={`absolute inset-0 flex items-center gap-1.5 px-2 text-[12.5px] font-medium text-ink-3 transition-[opacity,transform] ${searchOpen ? "pointer-events-none -translate-x-1 opacity-0" : "translate-x-0 opacity-100"}`}
              style={{
                transitionDuration: `${CHAT_SEARCH_MOTION.duration}ms`,
                transitionTimingFunction: CHAT_SEARCH_MOTION.easing,
              }}
            >
              <ChevronDown size={16} />
              <span>Chats</span>
            </div>

            <button
              type="button"
              aria-label="Search chats"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen(true)}
              className={`absolute right-0 top-0 z-10 flex size-8 items-center justify-center rounded-[8px] text-ink-3 transition-[opacity,background-color,color,transform] hover:bg-hover-2 hover:text-ink active:scale-[0.96] ${searchOpen ? "pointer-events-none opacity-0" : "opacity-100"}`}
              style={{ transitionDuration: `${CHAT_SEARCH_MOTION.duration}ms` }}
            >
              <Search size={16} />
            </button>

            <div
              className={`absolute right-0 top-0 z-20 flex h-8 items-center overflow-hidden rounded-[8px] bg-field text-ink-3 shadow-hairline transition-[width,opacity] focus-within:text-ink-2 ${searchOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
              style={{
                width: searchOpen ? "100%" : CHAT_SEARCH_MOTION.closedWidth,
                transitionDuration: `${CHAT_SEARCH_MOTION.duration}ms`,
                transitionTimingFunction: CHAT_SEARCH_MOTION.easing,
              }}
            >
              <span className="ml-2 flex shrink-0 items-center justify-center">
                <Search size={15} />
              </span>
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setSearchOpen(false);
                    setQuery("");
                  }
                }}
                placeholder="Search chats"
                aria-label="Search chat history"
                className="ml-1.5 min-w-0 flex-1 bg-transparent text-[13px] font-medium text-ink outline-none placeholder:text-ink-3"
              />
              <button
                type="button"
                aria-label="Close chat search"
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                }}
                className="flex size-8 shrink-0 items-center justify-center rounded-[8px] text-ink-3 transition-[background-color,color,transform] duration-150 hover:bg-hover-2 hover:text-ink active:scale-[0.96]"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <GlideGroup>
            {visibleRecents.map((item) => {
              const active = item.label === selectedTitle;
              return (
                <button
                  key={item.id}
                  data-row
                  type="button"
                  title={item.label}
                  onClick={() => {
                    selectNav("chats");
                    if (activeTitle === undefined) setDemoActiveTitle(item.label);
                    onPick?.(item.id, item.label, item.prompt);
                  }}
                  className={`sidebar-row relative z-10 mx-2 flex h-8 items-center rounded-[8px] px-2 text-left transition-[width,background-color,color,transform] duration-150 active:scale-[0.98] ${
                    active ? "bg-hover-2 group-hover/glide:bg-transparent" : ""
                  }`}
                >
                  <span
                    className={`sidebar-copy min-w-0 flex-1 truncate text-[14px] font-medium ${active ? "text-ink" : "text-ink-2"}`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
            {query && visibleRecents.length === 0 && (
              <div className="sidebar-copy mx-2 px-2 py-2 text-[12.5px] text-ink-3">
                No chats found
              </div>
            )}
          </GlideGroup>
        </div>

        {/* footer — upgrade CTA + user profile */}
        <div className="mt-3 shrink-0 border-t border-line px-2 pt-2 pb-1">
          <button
            type="button"
            className="sidebar-copy mb-1 flex h-8 w-[208px] items-center justify-center gap-1.5 rounded-control bg-hover-2 text-[12.5px] font-medium text-ink transition-[background-color,transform] duration-150 hover:bg-line-strong active:scale-[0.98]"
          >
            Upgrade
          </button>

          <button
            ref={userButtonRef}
            data-user-trigger
            type="button"
            aria-expanded={userOpen}
            aria-label="Account menu"
            onClick={toggleUser}
            className="flex h-11 w-full items-center gap-2 rounded-[10px] px-1.5 text-left transition-colors duration-100 hover:bg-hover-2 aria-expanded:bg-hover-2"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-surface">
              {USER.monogram}
            </span>
            <span className="sidebar-copy flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px] font-medium text-ink">
                {USER.name}
              </span>
              <span className="truncate text-[11.5px] text-ink-3">
                {USER.email}
              </span>
            </span>
            <span className="sidebar-copy shrink-0 text-ink-3">
              <ChevronDown size={15} className="rotate-180" />
            </span>
          </button>

          {userOpen && (
            <UserMenu
              position={userPosition}
              onClose={() => setUserOpen(false)}
              onOpenSettings={onOpenSettings}
            />
          )}
        </div>
      </div>
    </aside>
  );
}
