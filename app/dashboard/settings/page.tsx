"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { User, Bell, Lock, Palette, Eye, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BrandingData {
  companyName: string;
  logoUrl: string;
  preparedBy: string;
  websiteUrl: string;
  supportEmail: string;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.1 },
  }),
};

export default function SettingsPage() {
  const { user } = useUser();
  const [branding, setBranding] = useState<BrandingData>({
    companyName: "",
    logoUrl: "",
    preparedBy: "",
    websiteUrl: "",
    supportEmail: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios
      .get("/api/user/branding")
      .then((res) => {
        if (res.data) {
          setBranding({
            companyName: res.data.companyName || "",
            logoUrl: res.data.logoUrl || "",
            preparedBy: res.data.preparedBy || "",
            websiteUrl: res.data.websiteUrl || "",
            supportEmail: res.data.supportEmail || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await axios.put("/api/user/branding", branding);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof BrandingData, value: string) => {
    setBranding((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateField("logoUrl", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

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
                defaultValue={user?.fullName ?? ""}
                className="h-11 rounded-xl border-zinc-200 bg-zinc-50 px-4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.primaryEmailAddress?.emailAddress ?? ""}
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
            <Palette className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Report Branding</h2>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
              Professional
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            Customise your white-label PDF reports. If no branding is set, reports
            use a clean neutral design with WebNova branding.
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company / Agency Name</Label>
              <Input
                id="companyName"
                value={branding.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                placeholder="Your Agency Name"
                className="h-11 rounded-xl border-zinc-200 bg-zinc-50 px-4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preparedBy">Report Prepared By</Label>
              <Input
                id="preparedBy"
                value={branding.preparedBy}
                onChange={(e) => updateField("preparedBy", e.target.value)}
                placeholder="e.g. John Smith, SEO Specialist"
                className="h-11 rounded-xl border-zinc-200 bg-zinc-50 px-4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandWebsite">Company Website</Label>
              <Input
                id="brandWebsite"
                value={branding.websiteUrl}
                onChange={(e) => updateField("websiteUrl", e.target.value)}
                placeholder="https://youragency.com"
                className="h-11 rounded-xl border-zinc-200 bg-zinc-50 px-4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support / Contact Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={branding.supportEmail}
                onChange={(e) => updateField("supportEmail", e.target.value)}
                placeholder="support@youragency.com"
                className="h-11 rounded-xl border-zinc-200 bg-zinc-50 px-4"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Company Logo</Label>
              <div className="flex items-center gap-4">
                {branding.logoUrl ? (
                  <div className="h-16 w-40 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- User-uploaded logo preview */}
                    <img
                      src={branding.logoUrl}
                      alt="Logo preview"
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-40 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-xs text-zinc-400">
                    No logo uploaded
                  </div>
                )}
                <div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    Upload Logo
                  </label>
                  <p className="mt-1 text-xs text-zinc-400">
                    PNG, JPG or SVG. Max 2MB.
                  </p>
                  {branding.logoUrl && (
                    <button
                      onClick={() => updateField("logoUrl", "")}
                      className="mt-1 text-xs text-red-500 hover:underline"
                    >
                      Remove logo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : null}
              {saving ? "Saving..." : saved ? "Saved!" : "Save Branding"}
            </button>
            <button
              onClick={() => {
                setBranding({
                  companyName: "",
                  logoUrl: "",
                  preparedBy: "",
                  websiteUrl: "",
                  supportEmail: "",
                });
              }}
              className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
            >
              Reset to Default
            </button>
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
            <Eye className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Preview Report</h2>
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            See how your branded report will look before downloading.
          </p>
          <button className="mt-4 inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50">
            <Eye className="h-4 w-4" />
            Preview White-Label Report
          </button>
        </motion.div>

        <motion.div
          custom={3}
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
          custom={4}
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
