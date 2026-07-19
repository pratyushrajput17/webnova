"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Ticket,
  BarChart3,
  Clock,
  X,
  Shield,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/redeem", label: "Generate Codes", icon: Ticket },
  { href: "/admin/redeem-codes", label: "Redeem Codes", icon: Ticket },
  { href: "/admin/redeem/history", label: "Redeem History", icon: Clock },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-20 items-center justify-between border-b border-zinc-200 px-6">
          <Link href="/admin" className="flex items-center gap-2 text-xl font-bold">
            <Shield className="h-5 w-5 text-indigo-600" />
            Admin
          </Link>
          <button onClick={onClose} className="lg:hidden" aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="border-b border-zinc-100 px-6 py-3">
          <Link
            href="/dashboard"
            className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-800"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-black"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
