import Container from "@/components/shared/Container";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <h1 className="text-2xl font-bold">WebNova</h1>

          <div className="hidden md:flex items-center gap-8">
            <a href="#">Features</a>
            <a href="#">Pricing</a>
            <a href="#">Docs</a>
            <a href="#">Contact</a>
          </div>

          <button className="rounded-lg bg-black px-5 py-2.5 text-white">
            Get Started
          </button>
        </div>
      </Container>
    </nav>
  );
}