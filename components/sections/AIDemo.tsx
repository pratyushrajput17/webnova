import Container from "@/components/shared/Container";

export default function AIDemo() {
  return (
    <section className="py-28">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              AI Insights
            </p>

            <h2 className="mt-4 text-5xl font-bold">
              Recommendations that actually help.
            </h2>

            <p className="mt-8 text-lg leading-8 text-zinc-600">
              {"WebNova doesn't just show scores. It explains why issues exist, how they impact your business, and what to fix first."}
            </p>

            <ul className="mt-10 space-y-4 text-zinc-700">
              <li>✓ Prioritized recommendations</li>
              <li>✓ AI-generated explanations</li>
              <li>✓ Competitor comparisons</li>
              <li>✓ Actionable improvements</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="rounded-2xl bg-zinc-50 p-6">
              <h3 className="font-semibold">
                AI Recommendation
              </h3>

              <p className="mt-4 text-zinc-600">
                Your homepage image is 2.4MB and delays page load by
                approximately 1.8 seconds. Compressing it could improve
                performance by 18%.
              </p>

              <div className="mt-6 rounded-xl bg-black px-4 py-3 text-white">
                Estimated Impact: +18% Performance
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}