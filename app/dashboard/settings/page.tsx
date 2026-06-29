"use client";

import { motion } from "framer-motion";
import { User, Bell, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.1 },
  }),
};

export default function SettingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-bold">Account Settings</h1>
      <p className="mt-2 text-zinc-600">
        Manage your account settings and preferences.
      </p>

      <div className="mt-8 space-y-8">
        <motion.div
          custom={0}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-zinc-200 bg-white p-8"
        >
          <div className="flex items-center gap-3">
            <User className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Profile Settings</h2>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                defaultValue="John Doe"
                className="h-11 rounded-xl border-zinc-200 bg-zinc-50 px-4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                defaultValue="john@webnova.com"
                className="h-11 rounded-xl border-zinc-200 bg-zinc-50 px-4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                defaultValue="WebNova Inc."
                className="h-11 rounded-xl border-zinc-200 bg-zinc-50 px-4"
              />
            </div>
          </div>
          <button className="mt-6 rounded-xl bg-black px-6 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90">
            Save Changes
          </button>
        </motion.div>

        <motion.div
          custom={1}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-zinc-200 bg-white p-8"
        >
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          <div className="mt-6 space-y-5">
            {[
              {
                label: "Email Notifications",
                desc: "Receive email notifications about your account.",
              },
              {
                label: "Weekly Reports",
                desc: "Get weekly summaries of your website audits.",
              },
              {
                label: "Marketing Emails",
                desc: "Stay informed about new features and promotions.",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start justify-between gap-4"
              >
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="mt-0.5 text-sm text-zinc-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full border border-zinc-300 bg-zinc-100 transition-colors peer-checked:border-black peer-checked:bg-black" />
                  <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                </label>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          custom={2}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-zinc-200 bg-white p-8"
        >
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Security</h2>
          </div>
          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="current">Current Password</Label>
              <Input
                id="current"
                type="password"
                placeholder="Enter current password"
                className="h-11 rounded-xl border-zinc-200 bg-zinc-50 px-4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New Password</Label>
              <Input
                id="new"
                type="password"
                placeholder="Enter new password"
                className="h-11 rounded-xl border-zinc-200 bg-zinc-50 px-4"
              />
            </div>
          </div>
          <button className="mt-6 rounded-xl bg-black px-6 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90">
            Update Password
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
