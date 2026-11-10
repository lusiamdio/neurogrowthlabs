import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is NeuroGrowth Labs?",
    answer:
      "NeuroGrowth Labs is a premier AI infrastructure and applied intelligence ecosystem. We specialize in developing sovereign AI platforms, enterprise machine learning solutions, and secure data infrastructures.",
  },
  {
    question: "How can I partner with NeuroGrowth Labs?",
    answer:
      "We partner with governments, enterprises, and institutions globally. You can reach out to us via our Contact page or Partnership Portal to initiate discussions.",
  },
  {
    question: "Are your AI solutions customizable?",
    answer:
      "Yes, our enterprise AI architectures and autonomous agents are highly customizable and designed to integrate seamlessly into your existing workflows and secure environments.",
  },
  {
    question: "Where are you located?",
    answer:
      "We operate globally with a strong focus on empowering digital transformation across Africa. We deploy cloud-native and edge-based infrastructures scalable worldwide.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 px-6 relative bg-midnight-black z-10 border-t border-glass-border">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,rgba(0,229,255,0.05),transparent_70%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-quantum-silver font-light">
            Quick answers to common inquiries about our ecosystem and AI
            capabilities.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border border-glass-border rounded-xl bg-deep-charcoal/50 overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="text-lg font-medium text-white">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-ai-cyan" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 py-4 pt-0 text-quantum-silver leading-relaxed border-t border-glass-border/50">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
