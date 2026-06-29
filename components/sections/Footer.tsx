import Container from "@/components/shared/Container";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-100 py-12">
      <Container>
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">WebNova</h2>
            <p className="mt-1.5 text-sm text-zinc-500">
              AI-powered website intelligence platform.
            </p>
          </div>
          <a
            href="#"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
          >
            Contact
          </a>
        </div>
        <div className="mt-8 border-t border-zinc-100 pt-6 text-center text-sm text-zinc-400">
          &copy; 2026 WebNova. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
