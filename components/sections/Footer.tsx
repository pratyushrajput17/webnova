import Link from "next/link";
import Container from "@/components/shared/Container";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-100 py-12">
      <Container>
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">WebNova</h2>
            <p className="mt-1.5 text-sm text-zinc-500">
              AI-Powered SEO Platform
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <a
              href="mailto:dev.webnovaseo@gmail.com?subject=WebNova%20Support%20Request"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Support: dev.webnovaseo@gmail.com
            </a>
            <div className="flex items-center gap-6">
              <Link
                href="/terms"
                className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
              >
                Terms &amp; Conditions
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-zinc-100 pt-6 text-center text-sm text-zinc-400">
          &copy; 2026 WebNova. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
