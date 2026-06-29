"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col lg:pl-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
