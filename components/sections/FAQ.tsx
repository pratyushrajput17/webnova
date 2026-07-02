"use client";

import { motion } from "framer-motion";
import Container from "@/components/shared/Container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    value: "item-1",
    question: "How does WebNova analyze websites?",
    answer:
      "WebNova uses AI and automated auditing tools to analyze SEO, performance, accessibility and security.",
  },
  {
    value: "item-2",
    question: "Do I need technical knowledge?",
    answer:
      "No. Recommendations are written in simple language anyone can understand.",
  },
  {
    value: "item-3",
    question: "Can I compare competitors?",
    answer:
      "Yes. WebNova allows you to compare your website with competitors.",
  },
  {
    value: "item-4",
    question: "Is there a free plan?",
    answer:
      "Yes. New users get 3 free audits to try WebNova. Upgrade to Starter for 300 audits per year.",
  },
  {
    value: "item-5",
    question: "How often should I audit my website?",
    answer:
      "We recommend running audits weekly for best results.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-28">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            FAQ
          </p>
          <h2 className="mt-4 text-4xl font-bold">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-16 max-w-3xl"
        >
          <Accordion type="single" collapsible defaultValue="item-1">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.value}
                value={faq.value}
                className="rounded-2xl border border-zinc-200 bg-white mb-4 px-8 py-2"
              >
                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline [&[data-state=open]>[data-slot=accordion-trigger-icon]]:rotate-180">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-zinc-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </Container>
    </section>
  );
}
