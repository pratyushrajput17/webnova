"use client";

import { Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import GlobalSearch from "./GlobalSearch";
import NotificationBell from "./NotificationBell";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-md lg:px-8">
      <button
        onClick={onMenuClick}
        className="shrink-0 rounded-xl p-2 hover:bg-zinc-100 lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <GlobalSearch />
      <div className="ml-auto flex items-center gap-4">
        <NotificationBell />
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "h-9 w-9",
              userButtonPopoverCard:
                "rounded-2xl border border-zinc-200 shadow-lg",
              userButtonPopoverActionButton:
                "text-zinc-700 hover:bg-zinc-50 transition-colors",
              userButtonPopoverActionButtonText: "text-sm font-medium",
            },
          }}
        />
      </div>
    </header>
  );
}
