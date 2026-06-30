"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Loader2,
  CheckCheck,
  Trash2,
  FileSearch,
  Ticket,
  Zap,
  Megaphone,
  BarChart3,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, typeof Bell> = {
  audit_completed: FileSearch,
  plan_upgraded: Zap,
  redeem_success: Ticket,
  admin_announcement: Megaphone,
  monthly_report: BarChart3,
};

const typeColors: Record<string, string> = {
  audit_completed: "bg-blue-100 text-blue-600",
  plan_upgraded: "bg-indigo-100 text-indigo-600",
  redeem_success: "bg-emerald-100 text-emerald-600",
  admin_announcement: "bg-amber-100 text-amber-600",
  monthly_report: "bg-violet-100 text-violet-600",
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      try {
        const res = await axios.get("/api/notifications");
        if (cancelled) return;
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      } catch {}
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !bellRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await axios.patch(`/api/notifications/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await axios.patch("/api/notifications");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const wasUnread = notifications.find((n) => n.id === id)?.isRead === false;
    try {
      await axios.delete(`/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const handleClick = (n: Notification) => {
    if (!n.isRead) handleMarkRead(n.id);
    if (n.link) router.push(n.link);
    setOpen(false);
  };

  const unreadDisplay = unreadCount > 9 ? "9+" : unreadCount;

  return (
    <div className="relative">
      <button
        ref={bellRef}
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-xl p-2 transition-colors hover:bg-zinc-100"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadDisplay}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-zinc-800">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700"
              >
                {loading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCheck className="h-3 w-3" />
                )}
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-zinc-300">
                <Bell className="mb-2 h-8 w-8" />
                <p className="text-sm">No notifications yet.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = typeIcons[n.type as keyof typeof typeIcons] ?? Bell;
                const color = typeColors[n.type as keyof typeof typeColors] ?? "bg-zinc-100 text-zinc-600";
                return (
                  <div
                    key={n.id}
                    className={cn(
                      "group border-b border-zinc-50 px-5 py-3.5 transition-colors hover:bg-zinc-50",
                      !n.isRead && "bg-blue-50/40"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          color
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <button
                        onClick={() => handleClick(n)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="text-sm font-medium text-zinc-800">
                          {n.title}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">
                          {n.message}
                        </p>
                        <p className="mt-1 text-[10px] text-zinc-400">
                          {timeAgo(n.createdAt)}
                        </p>
                      </button>
                      <div className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                            title="Mark as read"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(n.id)}
                          className="rounded-lg p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
