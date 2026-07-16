import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions - WebNova",
  description: "WebNova terms and conditions of service.",
};

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold tracking-tight">Terms &amp; Conditions</h1>
        <p className="mt-2 text-sm text-zinc-400">Last updated: July 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-zinc-600">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-800">1. Acceptance of Terms</h2>
            <p>
              By accessing or using WebNova (&ldquo;the Platform&rdquo;), you agree to be bound by these
              Terms &amp; Conditions. If you do not agree, you may not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-800">2. Description of Service</h2>
            <p>
              WebNova provides AI-powered website auditing, SEO analysis, competitor insights, and
              related tools. The Platform is offered on a subscription basis with varying plan
              tiers.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-800">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activity under your account. You must provide accurate information when
              creating an account.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-800">4. Payments &amp; Billing</h2>
            <p>
              Paid plans are billed annually or as a one-time payment for Lifetime plans. All
              payments are processed securely through our payment provider. Refunds are handled in
              accordance with our 14-day money-back guarantee.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-800">5. Acceptable Use</h2>
            <p>
              You agree not to use the Platform for any unlawful purpose or in violation of any
              applicable laws. Automated scraping, abuse of the audit system, or any activity that
              disrupts the Platform is prohibited.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-800">6. Limitation of Liability</h2>
            <p>
              WebNova is provided &ldquo;as is&rdquo; without warranty of any kind. We are not liable for any
              damages arising from your use of the Platform.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-800">7. Changes to Terms</h2>
            <p>
              We reserve the right to update these terms at any time. Continued use of the Platform
              after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-800">8. Contact</h2>
            <p>
              For questions about these terms, contact us at{" "}
              <a
                href="mailto:dev.webnovaseo@gmail.com?subject=WebNova%20Legal%20Inquiry"
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
