import type { Metadata } from "next";
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata: Metadata = {
  title: "Admin - WebNova",
  description: "WebNova admin panel",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
