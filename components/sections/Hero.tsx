import Container from "@/components/shared/Container";

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-28">
      <Container>
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-600">
            🚀 AI-Powered Website Intelligence
          </div>

          <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Analyze, Optimize and Grow Your Website.
          </h1>

          <p className="mx-auto mt-10 max-w-2xl text-xl leading-9 text-zinc-600">
            WebNova helps businesses improve SEO, performance,
            accessibility and security with intelligent recommendations
            that actually help.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button className="rounded-xl bg-black px-8 py-4 text-white transition hover:opacity-90">
              Start Free
            </button>

            <button className="rounded-xl border border-zinc-300 px-8 py-4 transition hover:bg-zinc-100">
              Live Demo
            </button>
          </div>
        </div>

        <div className="mt-20 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>

          <div className="space-y-4">
            <div className="h-6 w-1/3 rounded bg-zinc-200"></div>
            <div className="h-4 w-full rounded bg-zinc-100"></div>
            <div className="h-4 w-5/6 rounded bg-zinc-100"></div>
            <div className="h-4 w-4/6 rounded bg-zinc-100"></div>

            <div className="grid gap-4 pt-6 md:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 p-6">
                <h3 className="text-3xl font-bold">92</h3>
                <p className="text-zinc-500">SEO Score</p>
              </div>

              <div className="rounded-2xl border border-zinc-200 p-6">
                <h3 className="text-3xl font-bold">88</h3>
                <p className="text-zinc-500">Performance</p>
              </div>

              <div className="rounded-2xl border border-zinc-200 p-6">
                <h3 className="text-3xl font-bold">95</h3>
                <p className="text-zinc-500">Accessibility</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}