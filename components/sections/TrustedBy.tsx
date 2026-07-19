import Container from "@/components/shared/Container";

const categories = [
  { name: "E-Commerce", icon: "EC" },
  { name: "SaaS", icon: "SA" },
  { name: "Enterprise", icon: "EN" },
  { name: "Agencies", icon: "AG" },
  { name: "Startups", icon: "ST" },
];

export default function TrustedBy() {
  return (
    <section className="border-y border-zinc-100 py-14">
      <Container>
        <p className="mb-10 text-center text-sm font-medium text-zinc-400">
          Built for businesses of every size
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {categories.map((category) => (
            <div
              key={category.name}
              className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white px-6 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-200 hover:shadow-sm"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white">
                {category.icon}
              </div>
              <span className="text-base font-semibold text-zinc-700">
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
