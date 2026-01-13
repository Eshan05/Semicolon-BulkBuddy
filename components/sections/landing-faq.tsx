'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  {
    question: "How do procurement pools actually work?",
    answer:
      "BulkBuddy identifies SMEs in close proximity who need the same raw materials. We group your demand into a 'Pool'. Once the pool reaches the supplier's bulk threshold, the order is placed automatically at the discounted rate.",
  },
  {
    question: "What happens if a pool doesn't hit the target weight?",
    answer:
      "If a pool doesn't hit the target by the deadline, you have three options: extend the deadline, pay a slightly higher 'mid-tier' rate if available, or cancel your part of the order with no penalty.",
  },
  {
    question: "How much can I really save with BulkBuddy?",
    answer:
      "On average, our members save between 15% and 35% compared to individual retail procurement. The larger the pool grows, the lower the price-per-unit drops for everyone.",
  },
  {
    question: "Is there a membership fee to join?",
    answer:
      "BulkBuddy is free to join. We only take a small 'Success Fee' (typically 1-2%) which is already factored into the discounted price you see on your dashboard.",
  },
  {
    question: "How is logistics and shipping handled?",
    answer:
      "We partner with regional freight tech companies. Since pools are geographically clustered, the supplier makes one large drop at a local hub, or a multi-stop delivery within a small radius, significantly cutting shipping costs.",
  },
  {
    question: "What types of raw materials are currently supported?",
    answer:
      "We currently support Steel (various grades), Aluminum, Polymer Resins, Industrial Chemicals, and Paper/Packaging materials. We are constantly adding new categories based on member demand.",
  },
];

export function FAQAccordionBlock() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-4xl px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center md:mb-16"
      >
        <Badge className="mb-4" variant="secondary">
          <HelpCircle className="mr-1 h-3 w-3" />
          FAQ
        </Badge>
        <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          Frequently Asked Questions
        </h2>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
          Have a question? We've got answers. If you don't find what you're
          looking for, feel free to contact us.
        </p>
      </motion.div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card className="overflow-hidden border-border/50 bg-card transition-all hover:border-primary/50 hover:shadow-md">
                <motion.button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-4 text-left md:p-6"
                  whileHover={{
                    backgroundColor: "rgba(var(--primary), 0.03)",
                  }}
                >
                  <span className="pr-4 text-base font-semibold md:text-lg">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border/50 p-4 md:p-6">
                        <motion.p
                          initial={{ y: -10 }}
                          animate={{ y: 0 }}
                          className="text-sm text-muted-foreground md:text-base"
                        >
                          {faq.answer}
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-center md:mt-16"
      >
        <Card className="border-border/50 bg-gradient-to-br from-card to-muted/30 p-6 md:p-8">
          <MessageCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h3 className="mb-2 text-xl font-bold md:text-2xl">
            Still have questions?
          </h3>
          <p className="mb-6 text-sm text-muted-foreground md:text-base">
            Our team is here to help. Get in touch and we'll respond as soon
            as possible.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg">Contact Support</Button>
            <Button size="lg" variant="outline">
              View Documentation
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}