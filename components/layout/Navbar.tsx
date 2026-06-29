import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Container from "@/components/shared/Container";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#faq", label: "FAQ" },
];

export default async function Navbar() {
  const { userId } = await auth();

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            WebNova
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-zinc-500 transition-colors hover:text-black"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {userId ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
                >
                  Dashboard
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-500 transition-colors hover:text-black"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </Container>
    </nav>
  );
}
