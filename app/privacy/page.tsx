import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - WebNova",
  description: "WebNova privacy policy and data handling practices.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-zinc-400">Last updated: July 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-zinc-600">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-800">1. Information We Collect</h2>
            <p>
              We collect information you provide when creating an account, including your name and
              email address. We also collect website URLs you submit for auditing and usage data
              necessary to operate the Platform.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-800">2. How We Use Your Information</h2>
            <p>
              Your information is used to provide and improve the Platform, process payments, send
              service notifications, and communicate with you about your account.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-800">3. Data Sharing</h2>
            <p>
              We do not sell your personal information. We may share data with trusted third-party
              service providers (payment processing, email delivery) who are bound by confidentiality
              agreements.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-800">4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data. However, no
              method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-800">5. Your Rights</h2>
            <p>
              You may access, update, or delete your account information at any time through your
              account settings. You may also contact us to request data deletion.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-800">6. Cookies</h2>
            <p>
              We use essential cookies for authentication and platform functionality. We do not use
              tracking cookies for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-800">7. Contact</h2>
            <p>
              For privacy-related concerns, contact us at{" "}
              <a
                href="mailto:dev.webnovaseo@gmail.com?subject=WebNova%20Privacy%20Inquiry"
                className="text-zinc-800 underline underline-offset-2 hover:text-zinc-600"
              >
                dev.webnovaseo@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
