'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, HelpCircle, MessageCircle, Plus } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: "How do procurement pools actually work?",
    answer:
      "BulkBuddy identifies SMEs in close proximity who need the same raw materials. We group your demand into a 'Pool'. Once the pool reaches the supplier's bulk threshold, the order is placed automatically at the discounted rate.",
    category: "Basics"
  },
  {
    question: "What happens if a pool doesn't hit the target?",
    answer:
      "If a pool doesn't hit the target by the deadline, you have three options: extend the deadline, pay a slightly higher 'mid-tier' rate if available, or cancel your part of the order with no penalty.",
    category: "Orders"
  },
  {
    question: "How much can I really save with BulkBuddy?",
    answer:
      "On average, our members save between 15% and 35% compared to individual retail procurement. The larger the pool grows, the lower the price-per-unit drops for everyone.",
    category: "Pricing"
  },
  {
    question: "Is there a membership fee to join?",
    answer:
      "BulkBuddy is free to join. We only take a small 'Success Fee' (typically 1-2%) which is already factored into the discounted price you see on your dashboard.",
    category: "Pricing"
  },
  {
    question: "How is logistics and shipping handled?",
    answer:
      "We partner with regional freight tech companies. Since pools are geographically clustered, the supplier makes one large drop at a local hub, or a multi-stop delivery within a small radius, significantly cutting shipping costs.",
    category: "Logistics"
  },
  {
    question: "What types of raw materials are supported?",
    answer:
      "We currently support Steel (various grades), Aluminum, Polymer Resins, Industrial Chemicals, and Paper/Packaging materials. We are constantly adding new categories based on member demand.",
    category: "Materials"
  },
];

export function FAQAccordionBlock() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="relative overflow-hidden py-10">
      {/* Background Decorative Elements */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-40 h-72 w-72 rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Sidebar / Header */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 lg:h-fit">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 w-fit" variant="secondary">
                <HelpCircle className="mr-1 h-3 w-3" />
                FAQ
              </Badge>
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Common questions
              </h2>
              <p className="mb-8 text-base text-muted-foreground">
                Everything you need to know about bulk pooling, pricing, and logistics. 
                Can't find the answer you're looking for?
              </p>
              
              <div className="hidden lg:block">
                 <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20 p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">Still have questions?</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Our procurement specialists are ready to help you set up your first pool.
                  </p>
                  <Button className="w-full">Chat with us</Button>
                 </Card>
              </div>
            </motion.div>
          </div>

          {/* Accordion List */}
          <div className="lg:col-span-8">
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                  >
                    <div
                      className={cn(
                        "group overflow-hidden rounded-2xl border bg-card transition-all duration-300",
                        isOpen 
                          ? "border-primary/20 shadow-lg shadow-primary/5" 
                          : "border-border/40 hover:border-primary/20 hover:bg-muted/10"
                      )}
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="flex w-full items-start justify-between p-5 text-left md:p-6"
                      >
                        <div className="flex gap-4">
                           <span className={cn(
                             "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium transition-colors",
                             isOpen 
                               ? "border-primary/50 bg-primary text-primary-foreground" 
                               : "border-border text-muted-foreground group-hover:border-primary/30"
                           )}>
                             {index + 1}
                           </span>
                           <div>
                             <h3 className={cn(
                               "text-base font-semibold leading-relaxed transition-colors md:text-lg",
                               isOpen ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
                             )}>
                               {faq.question}
                             </h3>
                             <div className={cn(
                               "mt-1 text-xs text-muted-foreground transition-opacity",
                               isOpen ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
                             )}>
                               Category: {faq.category}
                             </div>
                           </div>
                        </div>
                        <div className={cn(
                          "ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                          isOpen 
                            ? "rotate-45 border-primary/20 bg-primary/10 text-primary" 
                            : "rotate-0 border-transparent bg-muted/50 text-muted-foreground group-hover:bg-muted"
                        )}>
                          <Plus className="h-4 w-4" />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                          >
                            <div className="px-5 pb-5 md:px-6 md:pb-6 md:pl-16">
                              <p className="text-base leading-relaxed text-muted-foreground">
                                {faq.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Mobile CTA (visible only on small screens) */}
             <div className="mt-8 block lg:hidden">
                 <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20 p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">Still have questions?</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Our procurement specialists are ready to help you set up your first pool.
                  </p>
                  <Button className="w-full">Chat with us</Button>
                 </Card>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
