"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Pricing() {
  return (
    <section id="pricing" className="py-28">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
            Pricing
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Simple pricing for everyone.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-500">
            Choose the plan that fits your needs. Upgrade anytime.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid gap-8 lg:grid-cols-3"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={itemVariants}
              className={`relative rounded-3xl border p-10 transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl ${
                plan.popular
                  ? "border-zinc-900 bg-zinc-900 text-white shadow-xl"
                  : "border-zinc-200 bg-white"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-5 py-1.5 text-sm font-medium text-zinc-900 shadow-sm">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p
                className={`mt-3 text-sm ${
                  plan.popular ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                {plan.description}
              </p>
              <div className="mt-8">
                <span className="text-5xl font-bold">{plan.price}</span>
                {plan.price !== "Custom" && (
                  <span
                    className={`ml-1 text-sm ${
                      plan.popular ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    /month
                  </span>
                )}
              </div>
              <ul className="mt-10 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check
                      className={`h-4 w-4 shrink-0 ${
                        plan.popular ? "text-zinc-300" : "text-zinc-900"
                      }`}
                    />
                    <span
                      className={
                        plan.popular ? "text-zinc-300" : "text-zinc-600"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-12 w-full rounded-xl py-4 text-sm font-medium transition-all ${
                  plan.popular
                    ? "bg-white text-zinc-900 hover:bg-zinc-200"
                    : "bg-zinc-900 text-white hover:bg-zinc-800"
                }`}
              >
                Get Started
              </button>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
