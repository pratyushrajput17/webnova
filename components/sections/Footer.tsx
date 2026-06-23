import Container from "@/components/shared/Container";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 py-10">
      <Container>
        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div>
            <h2 className="text-3xl font-bold">WebNova</h2>

            <p className="mt-2 text-zinc-600">
              AI-powered website intelligence platform.
            </p>
          </div>

          {/* Right Side */}
          <a
            href="#"
            className="text-lg text-zinc-600 transition-colors hover:text-black"
          >
            Contact
          </a>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-zinc-200 pt-6 text-center text-zinc-500">
          © 2026 WebNova. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}