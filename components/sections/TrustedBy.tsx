import Container from "@/components/shared/Container";

const companies = [
  { name: "Google" },
  { name: "Microsoft" },
  { name: "Shopify" },
  { name: "Stripe" },
  { name: "Vercel" },
];

export default function TrustedBy() {
  return (
    <section className="border-y border-zinc-100 py-14">
      <Container>
        <p className="mb-10 text-center text-sm font-medium text-zinc-400">
          Trusted by leading companies worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {companies.map((company) => (
            <div
              key={company.name}
              className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white px-6 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-200 hover:shadow-sm"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white">
                {company.name[0]}
              </div>
              <span className="text-base font-semibold text-zinc-700">
                {company.name}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
