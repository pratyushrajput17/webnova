import Container from "@/components/shared/Container";

const plans = [
  {
    name: "Starter",
    price: "$29",
    description: "Perfect for small websites and startups.",
    features: [
      "10 Website Audits",
      "SEO Analysis",
      "Performance Reports",
      "Email Support",
    ],
  },
  {
    name: "Pro",
    price: "$79",
    description: "For growing businesses and agencies.",
    features: [
      "Unlimited Audits",
      "Competitor Analysis",
      "AI Recommendations",
      "Priority Support",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Advanced solutions for large teams.",
    features: [
      "Unlimited Everything",
      "Custom Integrations",
      "Dedicated Manager",
      "24/7 Support",
    ],
  },
];

export default function Pricing() {
  return (
    <section className="py-28">
      <Container>
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Pricing
          </p>

          <h2 className="mt-4 text-5xl font-bold">
            Simple pricing for everyone.
          </h2>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border p-10 transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl ${
                plan.popular
                  ? "border-black bg-black text-white"
                  : "border-zinc-200 bg-white"
              }`}
            >
              {plan.popular && (
                <div className="mb-6 inline-block rounded-full bg-white px-4 py-1 text-sm font-medium text-black">
                  Most Popular
                </div>
              )}

              <h3 className="text-3xl font-bold">{plan.name}</h3>

              <p
                className={`mt-4 ${
                  plan.popular ? "text-zinc-300" : "text-zinc-600"
                }`}
              >
                {plan.description}
              </p>

              <div className="mt-8 text-6xl font-bold">
                {plan.price}
              </div>

              <ul className="mt-10 space-y-5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`mt-12 w-full rounded-xl py-4 font-medium transition-all ${
                  plan.popular
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "bg-black text-white hover:bg-zinc-800"
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}