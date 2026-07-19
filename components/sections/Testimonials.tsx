"use client";

import { motion } from "framer-motion";
import Container from "@/components/shared/Container";

const testimonials = [
  {
    name: "Beta Tester",
    role: "Marketing Director",
    company: "SaaS Company",
    review:
      "WebNova helped us improve our SEO score by 40% in less than two months.",
  },
  {
    name: "Beta Tester",
    role: "Founder",
    company: "Startup",
    review:
      "The AI recommendations are incredibly accurate and easy to implement.",
  },
  {
    name: "Beta Tester",
    role: "Product Manager",
    company: "Tech Company",
    review:
      "We replaced multiple tools with WebNova and saved countless hours.",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-28">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Testimonials
          </p>
          <h2 className="mt-4 text-4xl font-bold">
            What customers are saying
          </h2>
          <p className="mt-6 text-lg text-zinc-600">
            Trusted by agencies, startups and growing businesses.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid gap-8 md:grid-cols-3"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={itemVariants}
              className="rounded-3xl border border-zinc-200 bg-white p-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-lg font-semibold">
                  {getInitials(testimonial.name)}
                </div>
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-zinc-500">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
              <p className="mt-8 leading-relaxed text-zinc-600">
                &ldquo;{testimonial.review}&rdquo;
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
