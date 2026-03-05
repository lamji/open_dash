"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bot,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  Loader2,
  X,
  Search,
  Bell,
  Mail,
  ChevronDown,
  Eye,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DevTooltip } from "@/components/shared/DevTooltip";
import { HtmlWithTooltips } from "@/components/shared/HtmlWithTooltips";
import { CodeBlock } from "@/components/shared/CodeBlock";
import { useAdminStore } from "./useAdmin";
import { PageRenderer } from "@/lib/component-registry";
import { cn } from "@/lib/utils";
import type {
  HeaderComponentData,
  SearchConfig,
  NotificationConfig,
  NotificationItem,
  ProfileConfig,
  ProfileMenuItem,
  MessageConfig,
  GenericHeaderConfig,
  GenericHeaderMenuItem,
} from "@/domain/admin/types";


/* ─── Message Content Renderer ────────────────────────── */

function renderMessageContent(content: string) {
  console.log(`Debug flow: renderMessageContent fired with`, { contentLength: content.length });
  
  // Parse markdown code blocks
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const textBefore = content.substring(lastIndex, match.index);
      if (textBefore.trim()) {
        parts.push(
          <p key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {textBefore}
          </p>
        );
      }
    }

    // Add code block
    const language = match[1] || 'text';
    const code = match[2].trim();
    parts.push(
      <CodeBlock key={`code-${match.index}`} code={code} language={language} />
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last code block
  if (lastIndex < content.length) {
    const textAfter = content.substring(lastIndex);
    if (textAfter.trim()) {
      parts.push(
        <p key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {textAfter}
        </p>
      );
    }
  }

  // If no code blocks found, return plain text
  if (parts.length === 0) {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  return <>{parts}</>;
}

/* ─── Header Component Renderers ────────────────────────── */

function HeaderSearch({ config }: { config: SearchConfig }) {
  return (
    <div
      className={cn("relative flex items-center", config.className)}
      style={{ width: config.width ?? "320px" }}
      data-test-id="header-search"
    >
    
      {(config.showIcon !== false) && config.iconPosition !== "right" && (
        <Search size={16} className={cn("absolute left-3 text-[var(--muted-foreground)]", config.iconClassName)} />
      )}
      <Input
        data-test-id="header-search-input"
        type="text"
        placeholder={config.placeholder ?? "Search"}
        className={cn(
          "h-9 w-full rounded-lg text-sm placeholder:text-[var(--muted-foreground)]",
          config.showIcon !== false && config.iconPosition !== "right" ? "pl-9" : "pl-3",
          config.showIcon !== false && config.iconPosition === "right" ? "pr-9" : "pr-3",
          !config.inputClassName && "border-[var(--border)] bg-[var(--muted)] focus-visible:ring-1 focus-visible:ring-[var(--primary)]",
          config.inputClassName
        )}
      />
      {(config.showIcon !== false) && config.iconPosition === "right" && (
        <Search size={16} className={cn("absolute right-3 text-[var(--muted-foreground)]", config.iconClassName)} />
      )}
    </div>
  );
}


function HeaderNotification({ config, devMode, onNotificationClick, onViewAll }: { config: NotificationConfig; devMode: boolean; onNotificationClick: (notification: NotificationItem) => void; onViewAll: () => void }) {
  const [open, setOpen] = useState(false);
  const count = config.count ?? config.items?.filter((i) => !i.read).length ?? 0;
  const items = config.items ?? [];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        data-test-id="header-notification-btn"
        onClick={() => setOpen(!open)}
        className={cn(
          "relative h-9 w-9 rounded-lg",
          !config.className && "text-[var(--foreground)] hover:bg-[var(--muted)]",
          config.className
        )}
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </Button>

      {open && (
        <div className={cn(
          "animate-dropdown-in absolute right-0 top-11 z-50 w-80 rounded-xl shadow-lg",
          !config.dropdownClassName && "border border-[var(--border)] bg-white",
          config.dropdownClassName
        )}>
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <span className="text-sm font-semibold text-[var(--foreground)]">Notifications</span>
            {count > 0 && (
              <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                {count} new
              </span>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                No notifications
              </div>
            ) : (
              items.slice(0, 5).map((item) => (
                <DevTooltip key={item.id} id={item.id} enabled={devMode} type="notification">
                  <button
                    onClick={() => {
                      setOpen(false);
                      onNotificationClick(item);
                    }}
                    data-test-id={`notification-item-${item.id}`}
                    className={cn(
                      "flex w-full gap-3 px-4 py-3 text-left transition-colors cursor-pointer",
                      !config.itemClassName && "border-b border-[var(--border)]/50 hover:bg-[var(--muted)]/50",
                      !config.itemClassName && !item.read && "bg-[var(--primary)]/[0.03]",
                      config.itemClassName
                    )}
                  >
                    <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${!item.read ? "bg-[var(--primary)]" : "bg-transparent"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--foreground)]">{item.title}</p>
                      <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">{item.description}</p>
                      <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">{item.time}</p>
                    </div>
                  </button>
                </DevTooltip>
              ))
            )}
          </div>
          {(config.showViewAll !== false) && items.length > 0 && (
            <div className="border-t border-[var(--border)] px-4 py-2.5">
              <Button
                variant="ghost"
                onClick={() => { setOpen(false); onViewAll(); }}
                data-test-id="header-notification-view-all"
                className="h-auto w-full py-1 text-xs font-medium text-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5"
              >
                <Eye size={12} className="mr-1" /> View All Notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HeaderProfile({ config, onMenuItemClick }: { config: ProfileConfig; onMenuItemClick: (item: ProfileMenuItem) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const defaultMenuItems: ProfileMenuItem[] = [
    { id: "my-profile", label: "My Profile", type: "builtin", viewType: "my-profile", action: "view" },
    { id: "settings", label: "Settings", type: "builtin", viewType: "settings", action: "view" },
    { id: "logout", label: "Log Out", type: "builtin", action: "logout" },
  ];

  const menuItems = config.menuItems ?? defaultMenuItems;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        data-test-id="header-profile-btn"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-9 items-center gap-2 rounded-lg px-2",
          !config.className && "text-[var(--foreground)] hover:bg-[var(--muted)]",
          config.className
        )}
      >
        {config.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={config.avatar} alt="" className={cn(
            "h-7 w-7 rounded-full",
            !config.avatarClassName && "object-cover",
            config.avatarClassName
          )} />
        ) : (
          <div className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full",
            !config.avatarClassName && "bg-[var(--primary)] text-xs font-bold text-white",
            config.avatarClassName
          )}>
            {(config.name ?? "U").charAt(0).toUpperCase()}
          </div>
        )}
        {config.name && (
          <span className="text-sm font-medium">{config.name}</span>
        )}
        <ChevronDown size={14} className="text-[var(--muted-foreground)]" />
      </Button>

      {open && config.showDropdown !== false && (
        <div className={cn(
          "animate-dropdown-in absolute right-0 top-11 z-50 w-48 rounded-xl py-1 shadow-lg",
          !config.dropdownClassName && "border border-[var(--border)] bg-white",
          config.dropdownClassName
        )}>
          <div className="border-b border-[var(--border)] px-4 py-2.5">
            <p className="text-sm font-semibold text-[var(--foreground)]">{config.name ?? "User"}</p>
            {config.role && <p className="text-xs text-[var(--muted-foreground)]">{config.role}</p>}
          </div>
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => {
                setOpen(false);
                onMenuItemClick(item);
              }}
              data-test-id={`header-profile-${item.id}`}
              className="h-auto w-full justify-start rounded-none px-4 py-2 text-sm font-normal text-[var(--foreground)] hover:bg-[var(--muted)]"
            >
              {item.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

function HeaderMessage({ config, devMode }: { config: MessageConfig; devMode: boolean }) {
  const [open, setOpen] = useState(false);
  const count = config.count ?? config.items?.filter((i) => !i.read).length ?? 0;
  const items = config.items ?? [];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        data-test-id="header-message-btn"
        onClick={() => setOpen(!open)}
        className={cn(
          "relative h-9 w-9 rounded-lg",
          !config.className && "text-[var(--foreground)] hover:bg-[var(--muted)]",
          config.className
        )}
      >
        <Mail size={18} />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </Button>

      {open && (
        <div className={cn(
          "animate-dropdown-in absolute right-0 top-11 z-50 w-80 rounded-xl shadow-lg",
          !config.dropdownClassName && "border border-[var(--border)] bg-white",
          config.dropdownClassName
        )}>
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <span className="text-sm font-semibold text-[var(--foreground)]">Messages</span>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                No messages
              </div>
            ) : (
              items.slice(0, 5).map((item) => (
                <DevTooltip key={item.id} id={item.id} enabled={devMode} type="message">
                  <div
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 transition-colors",
                      !config.itemClassName && "border-b border-[var(--border)]/50 hover:bg-[var(--muted)]/50",
                      !config.itemClassName && !item.read && "bg-[var(--primary)]/[0.03]",
                      config.itemClassName
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--foreground)]">
                      {item.from.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--foreground)]">{item.from}</p>
                      <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">{item.text}</p>
                      <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">{item.time}</p>
                    </div>
                  </div>
                </DevTooltip>
              ))
            )}
          </div>
          {(config.showViewAll !== false) && items.length > 0 && (
            <div className="border-t border-[var(--border)] px-4 py-2.5">
              <Button
                variant="ghost"
                data-test-id="header-message-view-all"
                className="h-auto w-full py-1 text-xs font-medium text-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5"
              >
                <Eye size={12} className="mr-1" /> View All Messages
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Generic Header Component ─────────────────────────── */

function GenericHeaderComponent({
  comp,
  config,
  devMode,
  onMenuItemAction,
}: {
  comp: HeaderComponentData;
  config: GenericHeaderConfig;
  devMode: boolean;
  onMenuItemAction: (item: GenericHeaderMenuItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const menuItems = config.menuItems ?? [];
  const hasMenu = config.hasDropdown !== false && menuItems.length > 0;

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        data-test-id={`header-${comp.type}-btn`}
        onClick={() => {
          if (hasMenu) {
            setOpen(!open);
          } else {
            onMenuItemAction({ id: comp.id, label: comp.type, action: "view", viewType: comp.type });
          }
        }}
        className={cn(
          "relative h-9 w-9 rounded-lg",
          !config.className && "text-[var(--foreground)] hover:bg-[var(--muted)]",
          config.className
        )}
      >
        <span className="text-lg">🔍</span>
        {config.badge != null && config.badge > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-bold text-white">
            {config.badge}
          </span>
        )}
      </Button>

      {config.showLabel && config.label && (
        <span className="ml-1 text-sm font-medium text-[var(--foreground)]">{config.label}</span>
      )}

      {open && hasMenu && (
        <div className={cn(
          "animate-dropdown-in absolute right-0 top-11 z-50 w-48 rounded-xl py-1 shadow-lg",
          !config.dropdownClassName && "border border-[var(--border)] bg-white",
          config.dropdownClassName
        )}>
          {menuItems.map((item) => (
            <DevTooltip key={item.id} id={item.tooltipId ?? item.id} enabled={devMode}>
              <Button
                variant="ghost"
                onClick={() => {
                  setOpen(false);
                  onMenuItemAction(item);
                }}
                data-test-id={`header-${comp.type}-menu-${item.id}`}
                className="h-auto w-full justify-start rounded-none px-4 py-2 text-sm font-normal text-[var(--foreground)] hover:bg-[var(--muted)]"
              >
                {item.label}
              </Button>
            </DevTooltip>
          ))}
        </div>
      )}
    </div>
  );
}

function renderHeaderComponent(
  comp: HeaderComponentData,
  devMode: boolean,
  onNotificationClick: (notification: NotificationItem) => void,
  onNotificationViewAll: () => void,
  onProfileMenuItemClick: (item: ProfileMenuItem) => void,
  onGenericMenuItemAction: (item: GenericHeaderMenuItem) => void
) {
  const component = (() => {
    switch (comp.type) {
      case "search":
        return <HeaderSearch config={comp.config as unknown as SearchConfig} />;
      case "notification":
        return <HeaderNotification config={comp.config as unknown as NotificationConfig} devMode={devMode} onNotificationClick={onNotificationClick} onViewAll={onNotificationViewAll} />;
      case "profile":
        return <HeaderProfile config={comp.config as unknown as ProfileConfig} onMenuItemClick={onProfileMenuItemClick} />;
      case "message":
        return <HeaderMessage config={comp.config as unknown as MessageConfig} devMode={devMode} />;
      default:
        return <GenericHeaderComponent comp={comp} config={comp.config as unknown as GenericHeaderConfig} devMode={devMode} onMenuItemAction={onGenericMenuItemAction} />;
    }
  })();

  if (!component) return null;

  return (
    <DevTooltip key={comp.id} id={comp.id} enabled={devMode}>
      {component}
    </DevTooltip>
  );
}

/* ─── Notification Modal ───────────────────────────────── */

function NotificationModal({ notification, onClose }: { notification: NotificationItem | null; onClose: () => void }) {
  if (!notification) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="relative w-full max-w-lg rounded-xl border border-[var(--border)] bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">{notification.title}</h3>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{notification.time}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-test-id="notification-modal-close"
            className="h-8 w-8 rounded-lg hover:bg-[var(--muted)]"
          >
            <X size={16} />
          </Button>
        </div>
        <div className="mt-4">
          <p className="text-sm text-[var(--foreground)]">{notification.description}</p>
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={onClose}
            data-test-id="notification-modal-ok"
            className="bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Profile View Renderer ────────────────────────────── */

function ProfileViewRenderer({ viewType, onClose }: { viewType: string; onClose: () => void }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)] capitalize">
            {viewType.replace(/-/g, " ")}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Customize this view with your own content
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-test-id="profile-view-close"
          className="h-9 w-9 rounded-lg hover:bg-[var(--muted)]"
        >
          <X size={18} />
        </Button>
      </div>

      <div className="rounded-lg border-2 border-dashed border-[var(--border)] p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)]">
          <Bot size={32} className="text-[var(--muted-foreground)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--foreground)]">Empty View</h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          This is a customizable view. You can add any content you want here.
        </p>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          View Type: <code className="rounded bg-[var(--muted)] px-1.5 py-0.5">{viewType}</code>
        </p>
      </div>
    </div>
  );
}

/* ─── Full Notification View ───────────────────────────── */

function FullNotificationView({ onClose, onNotificationClick }: { onClose: () => void; onNotificationClick: (notification: NotificationItem) => void }) {
  const store = useAdminStore();
  const notificationComp = store.headerComponents.find((c) => c.type === "notification");
  const config = notificationComp?.config as unknown as NotificationConfig | undefined;
  const items = config?.items ?? [];
  const unreadCount = items.filter((i) => !i.read).length;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Notifications</h2>
            <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-test-id="notification-view-close"
            className="h-9 w-9 rounded-lg hover:bg-[var(--muted)]"
          >
            <X size={18} />
          </Button>
        </div>
      </div>

      {/* Notification List */}
      <div className="divide-y divide-[var(--border)]">
        {items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--muted)]">
              <Bell size={24} className="text-[var(--muted-foreground)]" />
            </div>
            <p className="text-sm font-medium text-[var(--foreground)]">No notifications</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">You&apos;re all caught up</p>
          </div>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              onClick={() => onNotificationClick(item)}
              data-test-id={`notification-full-view-item-${item.id}`}
              className={cn(
                "flex w-full items-start gap-4 px-6 py-4 text-left transition-colors hover:bg-[var(--muted)]/50",
                !item.read && "bg-[var(--primary)]/[0.02]"
              )}
            >
              <div className="flex-shrink-0 pt-1">
                {!item.read ? (
                  <div className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                ) : (
                  <div className="h-2 w-2 rounded-full border border-[var(--border)]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className={cn(
                    "text-sm",
                    !item.read ? "font-semibold text-[var(--foreground)]" : "font-medium text-[var(--foreground)]"
                  )}>
                    {item.title}
                  </p>
                  <span className="flex-shrink-0 text-xs text-[var(--muted-foreground)]">{item.time}</span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted-foreground)] line-clamp-2">{item.description}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Main Shell ────────────────────────────────────────── */

export default function AdminShell() {
  const store = useAdminStore();
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const isPreview = params["preview"] === "true";
  const projectId = params["projectId"] ?? null;
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [chatInput, setChatInput] = useState("");
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  useEffect(() => {
    if (projectId) {
      store.setProjectId(projectId);
    }
    store.hydrateDevMode();
    store.loadSidebar();
    store.loadHeaderComponents();
    store.loadConfig("logo");
    store.loadConfig("header");
    store.loadConfig("primaryColor");
    store.loadConfig("page_html_content");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [store.chatMessages]);

  // Auto-focus chat input when chat opens (useLayoutEffect for immediate sync focus)
  React.useLayoutEffect(() => {
    if (store.isChatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [store.isChatOpen]);

  // Re-focus input after AI finishes thinking
  React.useLayoutEffect(() => {
    if (!store.isAiThinking && store.isChatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [store.isAiThinking, store.isChatOpen]);

  const handleSend = () => {
    const msg = chatInput.trim();
    if (!msg || store.isAiThinking) return;
    setChatInput("");
    store.sendAiMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleProfileMenuClick = (item: ProfileMenuItem) => {
    if (item.action === "logout") {
      console.log("Logout clicked");
      return;
    }
    if (item.action === "view" && item.viewType) {
      store.setActiveProfileView(item.viewType);
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    setSelectedNotification(notification);
  };

  const handleGenericMenuItemAction = (item: GenericHeaderMenuItem) => {
    switch (item.action) {
      case "view":
        if (item.viewType) store.setActiveView(item.viewType);
        break;
      case "alert":
        alert(item.alertMessage ?? item.label);
        break;
      case "logout":
        console.log("Logout triggered");
        break;
      case "link":
        if (item.href) window.open(item.href, "_blank");
        break;
      case "custom":
        console.log("Custom action:", item.id);
        break;
    }
  };

  const sortedHeader = [...store.headerComponents].sort((a, b) => a.position - b.position);

  const searchComp = sortedHeader.find((c) => c.type === "search");
  const searchAlign = ((searchComp?.config as unknown as SearchConfig | undefined)?.align ?? "start") as
    | "start"
    | "end";

  const searchTypes = new Set(["search"]);
  const searchComps = sortedHeader.filter((c) => searchTypes.has(c.type));
  const nonSearchComps = sortedHeader.filter((c) => !searchTypes.has(c.type));

  const leftComps = searchAlign === "end" ? nonSearchComps : searchComps;
  const rightComps = searchAlign === "end" ? searchComps : nonSearchComps;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* ─── Sidebar ──────────────────────────────────────── */}
      <aside
        className={`flex flex-col bg-[#fafbfc] transition-all duration-300 ${
          store.isSidebarCollapsed ? "w-[68px]" : "w-60"
        }`}
      >
        {/* Logo area */}
        <div className="flex h-14 items-center gap-2.5 px-4">
          {!store.isSidebarCollapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]">
                <span className="text-sm font-bold text-white">
                    {(store.logo?.text ?? "O").charAt(0)}
                  </span>
              </div>
              <span className="truncate text-sm font-bold text-[var(--foreground)]">
                {store.logo?.text || "OpenDash"}
              </span>
            </div>
          ) : (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]">
              <span className="text-sm font-bold text-white">
                {(store.logo?.text ?? "O").charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {store.sidebarItems.length === 0 ? (
            <div className="px-2 py-8 text-center">
              {!store.isSidebarCollapsed && (
                <p className="text-xs text-[var(--muted-foreground)]">
                  No pages yet. Use AI to add pages.
                </p>
              )}
            </div>
          ) : (
            <>
              {!store.isSidebarCollapsed && (
                <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Menu
                </p>
              )}
              <div className="space-y-0.5">
                {store.sidebarItems.map((item) => {
                  const isActive = store.activePage === item.slug;
                  return (
                    <DevTooltip key={item.id} id={item.slug} enabled={store.devMode}>
                      <Button
                        variant="ghost"
                        data-test-id={`sidebar-${item.slug}`}
                        onClick={() => store.loadPage(item.slug)}
                        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all h-auto justify-start ${
                          isActive
                            ? "bg-[var(--primary)]/10 text-[var(--primary)] font-medium"
                            : "text-[var(--sidebar-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                        } ${store.isSidebarCollapsed ? "justify-center px-0" : ""}`}
                        title={item.label}
                      >
                        <span className="text-lg">📄</span>
                        {!store.isSidebarCollapsed && (
                          <span className="truncate text-sm">{item.label}</span>
                        )}
                      </Button>
                    </DevTooltip>
                  );
                })}
              </div>
            </>
          )}
        </nav>

        {/* Sidebar footer */}
        <div className="space-y-2 p-3">
          {!store.isSidebarCollapsed && !isPreview && (
            <div className="flex items-center justify-between rounded-lg bg-[var(--muted)]/50 px-3 py-2">
              <div className="flex items-center gap-2">
                <Code size={14} className="text-[var(--muted-foreground)]" />
                <span className="text-xs font-medium text-[var(--foreground)]">
                  {store.devMode ? "Develop" : "Preview"}
                </span>
              </div>
              <Switch
                checked={store.devMode}
                onCheckedChange={store.toggleDevMode}
                data-test-id="dev-mode-toggle"
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            data-test-id="sidebar-toggle"
            onClick={() => store.toggleSidebar()}
            className="flex w-full items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            {store.isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </Button>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between bg-white px-6">
          <div className="flex items-center gap-4">
            {leftComps.map((comp) => renderHeaderComponent(comp, store.devMode, handleNotificationClick, store.toggleNotificationView, handleProfileMenuClick, handleGenericMenuItemAction))}
          </div>

          <div className="flex items-center gap-2">
            {rightComps.map((comp) => renderHeaderComponent(comp, store.devMode, handleNotificationClick, store.toggleNotificationView, handleProfileMenuClick, handleGenericMenuItemAction))}
            {/* AI toggle button — always rightmost, hidden in preview mode */}
            {!isPreview && (
              <Button
                variant="ghost"
                data-test-id="ai-toggle"
                onClick={() => store.toggleChat()}
                className={`flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-all ${
                  store.isChatOpen
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <Bot size={16} />
                {!store.isChatOpen && <span className="text-xs">AI</span>}
              </Button>
            )}
          </div>
        </header>

        {/* Page title bar */}
        <div className="bg-white px-6 py-4">
          <h1 className="text-lg font-bold text-[var(--foreground)]">
            {store.header?.title || "Dashboard"}
          </h1>
          {store.header?.subtitle && (
            <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
              {store.header.subtitle}
            </p>
          )}
        </div>

        {/* Body */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="w-full">
            {store.activeProfileView ? (
              <ProfileViewRenderer viewType={store.activeProfileView} onClose={() => store.setActiveProfileView(null)} />
            ) : store.activeView ? (
              <ProfileViewRenderer viewType={store.activeView} onClose={() => store.setActiveView(null)} />
            ) : store.showNotificationView ? (
              <FullNotificationView onClose={store.toggleNotificationView} onNotificationClick={handleNotificationClick} />
            ) : store.activePage ? (
              // Check if we have HTML content to render
              store.htmlContent ? (
                <HtmlWithTooltips html={store.htmlContent} devMode={store.devMode} />
              ) : (
                <PageRenderer components={store.pageComponents} devMode={store.devMode} />
              )
            ) : (
              <div className="flex h-full min-h-[50vh] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/10">
                    <Bot size={24} className="text-[var(--primary)]" />
                  </div>
                  <h2 className="text-lg font-bold text-[var(--foreground)]">
                    Welcome to OpenDash
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Open the AI assistant to start building your dashboard
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ─── AI Chat Panel (hidden in preview mode) ──────────── */}
      {store.isChatOpen && !isPreview && (
        <aside className="flex w-[380px] shrink-0 flex-col border-l border-[var(--border)] bg-white animate-slide-in-right">
          {/* Chat header */}
          <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                <Bot size={16} className="text-[var(--primary)]" />
              </div>
              <div>
                <span className="text-sm font-semibold text-[var(--foreground)]">AI Assistant</span>
                <p className="text-[10px] text-[var(--muted-foreground)]">Build with prompts</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              data-test-id="ai-close"
              onClick={() => store.toggleChat()}
              className="h-8 w-8 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <X size={16} />
            </Button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {store.chatMessages.length === 0 && (
              <div className="flex h-full items-center justify-center">
                <div className="text-center px-4">
                  <Bot size={28} className="mx-auto mb-3 text-[var(--primary)] opacity-30" />
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    What would you like to build?
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Try these prompts:
                  </p>
                  <div className="mt-3 space-y-1.5">
                    {[
                      "Add a search bar to the header",
                      "Add notifications with 5 items",
                      "Add a profile menu",
                      "Add messages to the header",
                    ].map((suggestion, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        data-test-id={`ai-suggestion-${i}`}
                        onClick={() => {
                          setChatInput(suggestion);
                          inputRef.current?.focus();
                        }}
                        className="block w-full h-auto rounded-lg border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-xs text-[var(--foreground)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5 transition-all"
                      >
                        &ldquo;{suggestion}&rdquo;
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {store.chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`animate-fade-in-up ${
                  msg.role === "user" ? "flex justify-end" : "flex justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--muted)] text-[var(--foreground)]"
                  }`}
                >
                  {renderMessageContent(msg.content)}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className={`mt-2 border-t pt-2 ${msg.role === "user" ? "border-white/20" : "border-[var(--border)]"}`}>
                      <p className={`text-[10px] ${msg.role === "user" ? "text-white/70" : "text-[var(--primary)]"}`}>
                        {msg.actions.length} action{msg.actions.length > 1 ? "s" : ""} executed
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {store.isAiThinking && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="flex items-center gap-2 rounded-xl bg-[var(--muted)] px-3.5 py-2.5">
                  <Loader2 size={14} className="animate-spin text-[var(--primary)]" />
                  <span className="text-xs text-[var(--muted-foreground)]">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div className="border-t border-[var(--border)] p-3">
            <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 focus-within:border-[var(--primary)]/50 transition-colors">
              <Input
                ref={inputRef}
                data-test-id="ai-input"
                type="text"
                placeholder="Tell me what to build..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={store.isAiThinking}
                className="flex-1 border-0 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] shadow-none focus-visible:ring-0 disabled:opacity-50"
              />
              <Button
                variant="ghost"
                size="icon"
                data-test-id="ai-send"
                onClick={handleSend}
                disabled={!chatInput.trim() || store.isAiThinking}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 disabled:opacity-30 transition-all"
              >
                <Send size={14} />
              </Button>
            </div>
          </div>
        </aside>
      )}

      {/* Notification Modal */}
      <NotificationModal 
        notification={selectedNotification} 
        onClose={() => setSelectedNotification(null)} 
      />
    </div>
  );
}
