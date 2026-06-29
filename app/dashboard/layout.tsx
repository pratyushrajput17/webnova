import type { Metadata } from "next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export const metadata: Metadata = {
  title: "Dashboard - WebNova",
  description: "WebNova dashboard",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
