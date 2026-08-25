"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import {
  ChevronDown,
  Home,
  LogOut,
  Moon,
  MoreHorizontal,
  PanelLeft,
  Pencil,
  Pin,
  PinOff,
  Search,
  Settings,
  SquarePen,
  Sun,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import GlideMenu from "@/components/primitives/GlideMenu";

/* ─────────────────────────────────────────────────────────
 * SIDEBAR NAV
 * Brand header, primary navigation, a ⌘K search palette, a
 * pinnable/deletable chat history (right-click a chat), and a
 * user profile footer with Settings and theme controls.
 * ───────────────────────────────────────────────────────── */

const BRAND = { name: "Lumen", monogram: "L" };
const USER = {
  name: "Ferhat Kefsiz",
  email: "ferhat@lumen.app",
  monogram: "F",
};

const NAV_ITEMS = [{ key: "home", label: "Home", icon: <Home size={18} /> }];

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
  count?: ReactNode;
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
        <span className="sidebar-copy mr-1 shrink-0 text-[12px] font-medium tabular-nums text-ink-3">
          {count}
        </span>
      )}
    </button>
  );
}

/* right-click context menu for a chat row */
function ChatContextMenu({
  x,
  y,
  pinned,
  onPin,
  onRename,
  onDelete,
  onClose,
}: {
  x: number;
  y: number;
  pinned: boolean;
  onPin: () => void;
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const close = () => onClose();
    document.addEventListener("pointerdown", close);
    document.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const left = Math.min(x, window.innerWidth - 180);
  const top = Math.min(y, window.innerHeight - 100);

  return createPortal(
    <div
      data-chat-menu
      className="fixed z-50 w-44 rounded-[10px] bg-surface p-1 shadow-overlay"
      style={{
        left,
        top,
        animation: "pop-in 130ms cubic-bezier(0.23,1,0.32,1) both",
        transformOrigin: "top left",
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => {
          onPin();
          onClose();
        }}
        className="flex h-8 w-full items-center gap-2 rounded-[7px] px-2 text-left text-[13px] text-ink transition-colors hover:bg-hover-2"
      >
        <span className="text-ink-2">
          {pinned ? <PinOff size={15} /> : <Pin size={15} />}
        </span>
        {pinned ? "Unpin" : "Pin"}
      </button>
      <button
        type="button"
        onClick={() => {
          onRename();
          onClose();
        }}
        className="flex h-8 w-full items-center gap-2 rounded-[7px] px-2 text-left text-[13px] text-ink transition-colors hover:bg-hover-2"
      >
        <span className="text-ink-2">
          <Pencil size={15} />
        </span>
        Rename
      </button>
      <button
        type="button"
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="flex h-8 w-full items-center gap-2 rounded-[7px] px-2 text-left text-[13px] text-red transition-colors hover:bg-red-tint"
      >
        <Trash2 size={15} />
        Delete
      </button>
    </div>,
    document.body,
  );
}

/* delete confirmation — a small danger dialog */
function DeleteDialog({
  label,
  onConfirm,
  onClose,
}: {
  label: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[oklch(0_0_0/0.45)] p-4"
      style={{ animation: "fade-in 130ms ease-out both" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[var(--radius-window)] bg-surface p-5 shadow-overlay"
        style={{ animation: "pop-in 180ms cubic-bezier(0.23,1,0.32,1) both" }}
      >
        <div className="flex gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-tint text-red">
            <Trash2 size={17} />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="text-[15px] font-semibold text-ink">Delete chat?</h2>
            <p className="text-[13px] leading-relaxed text-ink-2">
              This will permanently remove{" "}
              <span className="font-medium text-ink">“{label}”</span>. This
              action can’t be undone.
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center rounded-full bg-red px-4 py-[9px] text-sm font-medium text-white transition-[transform,filter] duration-150 hover:brightness-95 active:scale-[0.96]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ⌘K search palette */
function SearchPalette({
  chats,
  onPick,
  onClose,
}: {
  chats: SidebarRecent[];
  onPick: (id: string, label: string, prompt?: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results = chats.filter((c) =>
    c.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[oklch(0_0_0/0.45)] p-4 pt-[12vh]"
      style={{ animation: "fade-in 120ms ease-out both" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[60vh] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius-window)] bg-surface shadow-overlay"
        style={{ animation: "pop-in 160ms cubic-bezier(0.23,1,0.32,1) both" }}
      >
        <div className="flex items-center gap-2 border-b border-line px-3.5">
          <Search size={16} className="shrink-0 text-ink-3" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats…"
            aria-label="Search chats"
            className="h-12 min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-3"
          />
          <kbd className="rounded-md bg-inset px-1.5 py-0.5 font-mono text-[11px] text-ink-3 shadow-hairline">
            Esc
          </kbd>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <div className="px-2.5 py-6 text-center text-[13px] text-ink-3">
              No chats found
            </div>
          ) : (
            results.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onPick(c.id, c.label, c.prompt);
                  onClose();
                }}
                className="flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[13.5px] text-ink transition-colors hover:bg-hover-2"
              >
                <Search size={15} className="shrink-0 text-ink-3" />
                <span className="min-w-0 flex-1 truncate">{c.label}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
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
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  return createPortal(
    <div
      data-user-menu
      className="fixed z-50 rounded-[14px] bg-surface p-1.5 shadow-overlay"
      style={{
        bottom: position.bottom,
        left: position.left,
        width: Math.max(position.width, 232),
        animation: "pop-in 160ms cubic-bezier(0.23,1,0.32,1) both",
        transformOrigin: "bottom left",
      }}
    >
      <div className="flex items-center gap-2 px-2 py-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-surface">
          {USER.monogram}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[13px] font-medium text-ink">
            {USER.name}
          </span>
          <span className="truncate text-[11.5px] text-ink-3">{USER.email}</span>
        </span>
      </div>

      <div className="mx-1 my-1 h-px bg-line" />

      {/* theme switch */}
      <div className="mx-1 mb-1 flex items-center gap-1 rounded-[9px] bg-inset p-0.5">
        {[
          { key: "light", label: "Light", icon: <Sun size={14} /> },
          { key: "dark", label: "Dark", icon: <Moon size={14} /> },
        ].map((opt) => {
          const selected = mounted && (opt.key === "dark") === isDark;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setTheme(opt.key)}
              aria-pressed={selected}
              className={`flex h-7 flex-1 items-center justify-center gap-1.5 rounded-[7px] text-[12.5px] font-medium transition-colors ${
                selected
                  ? "bg-surface text-ink shadow-btn"
                  : "text-ink-2 hover:text-ink"
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="mx-1 my-1 h-px bg-line" />

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
  const [userPosition, setUserPosition] = useState({ bottom: 0, left: 0, width: 0 });
  const [searchOpen, setSearchOpen] = useState(false);

  // Ephemeral pin/delete state — a refresh restores the original list.
  // Two chats start pinned by default.
  const [pinnedIds, setPinnedIds] = useState<string[]>(() =>
    recents.slice(0, 2).map((r) => r.id),
  );
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [renames, setRenames] = useState<Record<string, string>>({});
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<SidebarRecent | null>(null);
  const [ctxMenu, setCtxMenu] = useState<{
    item: SidebarRecent;
    x: number;
    y: number;
  } | null>(null);

  const labelOf = (item: SidebarRecent) => renames[item.id] ?? item.label;

  const startRename = (item: SidebarRecent) => {
    setRenameDraft(renames[item.id] ?? item.label);
    setRenamingId(item.id);
  };
  const commitRename = (id: string) => {
    const next = renameDraft.trim();
    if (next) setRenames((prev) => ({ ...prev, [id]: next }));
    setRenamingId(null);
  };

  const userButtonRef = useRef<HTMLButtonElement>(null);

  const selectedTitle =
    activeTitle === undefined ? demoActiveTitle : activeTitle;

  const visible = useMemo(
    () => recents.filter((r) => !deletedIds.includes(r.id)),
    [recents, deletedIds],
  );
  const pinned = useMemo(
    () =>
      pinnedIds
        .map((id) => visible.find((r) => r.id === id))
        .filter((r): r is SidebarRecent => Boolean(r)),
    [pinnedIds, visible],
  );
  const unpinned = useMemo(
    () => visible.filter((r) => !pinnedIds.includes(r.id)),
    [visible, pinnedIds],
  );

  const togglePin = (id: string) =>
    setPinnedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  const deleteChat = (id: string) => {
    setDeletedIds((prev) => [...prev, id]);
    setPinnedIds((prev) => prev.filter((p) => p !== id));
  };

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

  // ⌘K opens the search palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const collapse = () => {
    setCollapsed(true);
    setUserOpen(false);
    setCtxMenu(null);
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

  const renderChat = (item: SidebarRecent) => {
    const active = labelOf(item) === selectedTitle;
    const isPinned = pinnedIds.includes(item.id);
    const renaming = renamingId === item.id;
    return (
      <div
        key={item.id}
        data-row
        onContextMenu={(e) => {
          e.preventDefault();
          setCtxMenu({ item, x: e.clientX, y: e.clientY });
        }}
        className={`sidebar-row group/row relative z-10 mx-2 flex h-8 items-center rounded-[8px] transition-[width,background-color,color] duration-150 ${
          active ? "bg-hover-2 group-hover/glide:bg-transparent" : ""
        }`}
      >
        {renaming ? (
          <input
            autoFocus
            value={renameDraft}
            onChange={(e) => setRenameDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename(item.id);
              if (e.key === "Escape") setRenamingId(null);
            }}
            onBlur={() => commitRename(item.id)}
            className="sidebar-copy mx-1 min-w-0 flex-1 rounded-[6px] bg-field px-1.5 py-0.5 text-[14px] font-medium text-ink shadow-hairline outline-none"
          />
        ) : (
          <>
            <button
              type="button"
              title={labelOf(item)}
              onClick={() => {
                selectNav("chats");
                if (activeTitle === undefined) setDemoActiveTitle(labelOf(item));
                onPick?.(item.id, labelOf(item), item.label);
              }}
              className={`min-w-0 flex-1 truncate px-2 text-left text-[14px] font-medium ${active ? "text-ink" : "text-ink-2"}`}
            >
              <span className="sidebar-copy block truncate">
                {labelOf(item)}
              </span>
            </button>

            {/* hover actions */}
            <div
              className="absolute inset-y-0 right-0 flex items-center gap-0.5 rounded-r-[8px] pr-1 pl-6 opacity-0 transition-opacity duration-100 group-hover/row:opacity-100"
              style={{
                background:
                  "linear-gradient(to right, transparent, var(--hover-2) 45%)",
              }}
            >
              <button
                type="button"
                aria-label={isPinned ? "Unpin chat" : "Pin chat"}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePin(item.id);
                }}
                className="flex size-6 items-center justify-center rounded-[6px] text-ink-3 transition-colors hover:bg-hover-2 hover:text-ink"
              >
                {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
              </button>
              <button
                type="button"
                aria-label="Chat options"
                onClick={(e) => {
                  e.stopPropagation();
                  setCtxMenu({ item, x: e.clientX, y: e.clientY });
                }}
                className="flex size-6 items-center justify-center rounded-[6px] text-ink-3 transition-colors hover:bg-hover-2 hover:text-ink"
              >
                <MoreHorizontal size={15} />
              </button>
            </div>
          </>
        )}
      </div>
    );
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
          <RailButton
            icon={<Search size={18} />}
            label="Search"
            count="⌘K"
            onClick={() => setSearchOpen(true)}
          />
          {NAV_ITEMS.map((item) => (
            <RailButton
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={currentNav === item.key}
              onClick={() => selectNav(item.key)}
            />
          ))}
        </GlideGroup>

        <div className="sidebar-chats mt-3 min-h-0 flex-1 overflow-y-auto">
          {pinned.length > 0 && (
            <>
              <div className="sidebar-copy mx-2 mb-1 flex items-center gap-1.5 px-2 text-[12.5px] font-medium text-ink-3">
                <Pin size={13} />
                <span>Pinned</span>
              </div>
              <GlideGroup>{pinned.map(renderChat)}</GlideGroup>
              <div className="my-2.5 mx-4 h-px bg-line" />
            </>
          )}

          <div className="sidebar-copy mx-2 mb-1 flex items-center gap-1.5 px-2 text-[12.5px] font-medium text-ink-3">
            <ChevronDown size={16} />
            <span>Chats</span>
          </div>
          <GlideGroup>
            {unpinned.map(renderChat)}
            {unpinned.length === 0 && pinned.length === 0 && (
              <div className="sidebar-copy mx-2 px-2 py-2 text-[12.5px] text-ink-3">
                No chats yet
              </div>
            )}
          </GlideGroup>
        </div>

        {/* footer — user profile */}
        <div className="mt-3 shrink-0 border-t border-line px-2 pt-2 pb-1">
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
            <span className="sidebar-copy min-w-0 flex-1 truncate text-[13.5px] font-medium text-ink">
              {USER.name}
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

      {ctxMenu && (
        <ChatContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          pinned={pinnedIds.includes(ctxMenu.item.id)}
          onPin={() => togglePin(ctxMenu.item.id)}
          onRename={() => startRename(ctxMenu.item)}
          onDelete={() => setConfirmDelete(ctxMenu.item)}
          onClose={() => setCtxMenu(null)}
        />
      )}

      {confirmDelete && (
        <DeleteDialog
          label={labelOf(confirmDelete)}
          onConfirm={() => {
            deleteChat(confirmDelete.id);
            setConfirmDelete(null);
          }}
          onClose={() => setConfirmDelete(null)}
        />
      )}

      {searchOpen && (
        <SearchPalette
          chats={visible}
          onPick={(id, label, prompt) => {
            selectNav("chats");
            if (activeTitle === undefined) setDemoActiveTitle(label);
            onPick?.(id, label, prompt);
          }}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </aside>
  );
}
