"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Globe,
  Users,
  FileText,
  CreditCard,
  Settings,
  Clock,
  Ticket,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/audits", label: "Website Audits", icon: Globe },
  { href: "/dashboard/history", label: "Audit History", icon: Clock },
  { href: "/dashboard/competitors", label: "Competitors", icon: Users },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/redeem", label: "Redeem Code", icon: Ticket },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
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
          <Link href="/" className="text-2xl font-bold">
            WebNova
          </Link>
          <button onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-100 text-black"
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
