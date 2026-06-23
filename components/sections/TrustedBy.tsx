import Container from "@/components/shared/Container";
import {
  Search,
  BarChart3,
  ShieldCheck,
  Zap,
  Globe,
  Brain,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "SEO Intelligence",
    description: "Discover hidden SEO issues and opportunities.",
  },
  {
    icon: BarChart3,
    title: "Competitor Insights",
    description: "Compare your website against competitors.",
  },
  {
    icon: ShieldCheck,
    title: "Security Audit",
    description: "Identify vulnerabilities and security risks.",
  },
  {
    icon: Zap,
    title: "Performance Analysis",
    description: "Improve speed and Core Web Vitals.",
  },
  {
    icon: Globe,
    title: "Accessibility",
    description: "Ensure your website works for everyone.",
  },
  {
    icon: Brain,
    title: "AI Recommendations",
    description: "Get actionable AI-powered suggestions.",
  },
];

export default function Features() {
  return (<section className="py-28">
     
      <Container>
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Features
          </p>

          <h2 className="mt-4 text-4xl font-bold">
            Everything you need to grow.
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-zinc-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:border-black hover:shadow-xl"
            >
              <feature.icon className="h-10 w-10" />

              <h3 className="mt-6 text-2xl font-semibold">
                {feature.title}
              </h3>

              <p className="mt-4 text-zinc-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}