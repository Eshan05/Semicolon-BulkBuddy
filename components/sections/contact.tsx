'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitContactForm } from '@/lib/actions'
import { motion, type Variants } from 'framer-motion'
import { Mail, MessageSquare, Phone, Send } from 'lucide-react'
import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const iconVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export function ContactFormSection() {
  const [state, formAction, isPending] = useActionState(submitContactForm, null)

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message)
    } else if (state?.success === false) {
      toast.error("Please check the form for errors.")
    }
  }, [state])

  return (
    <div className="relative overflow-hidden px-6">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-6 h-130 w-130 -translate-x-1/2 rounded-full bg-foreground/[0.035] blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-90 w-90 rounded-full bg-primary/[0.03] blur-[130px]" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <span className="text-xs text-foreground/60">
            Contact
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Join the BulkBuddy Movement
          </h2>
          <p className="max-w-2xl text-foreground/70">
            Ready to slash your procurement costs? Reach out to our team to
            get your first pool started or to become a verified supplier.
          </p>
        </motion.div>

        <Card className="group relative w-full max-w-4xl overflow-hidden rounded-2xl border border-border/40 bg-background/60 p-0 backdrop-blur transition-all hover:border-border/60 hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.04] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <motion.form
            action={formAction}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="relative grid gap-10 px-6 py-8 md:grid-cols-2 md:px-10 md:py-12"
            aria-label="Contact form"
          >
            <motion.div
              variants={itemVariants}
              className="space-y-8 text-left text-foreground/70"
            >
              <motion.div
                variants={iconVariants}
                className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/50 px-4 py-1.5 text-xs text-foreground/70 backdrop-blur"
                aria-hidden="true"
              >
                <span className="h-2 w-2 rounded-full bg-primary/80" />
                Response within 24 hours
              </motion.div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  Get started with BulkBuddy
                </h3>
                <p className="text-sm text-foreground/70">
                  We’ll schedule a quick call to understand your raw material needs
                  and find the best active pools for your business. Prefer email?
                  Reach us at{" "}
                  <a
                    href="mailto:partners@bulkbuddy.com"
                    className="text-foreground underline decoration-border/70 underline-offset-4 transition-colors hover:text-primary"
                  >
                    partners@bulkbuddy.com
                  </a>
                  .
                </p>
              </div>

              <div className="grid gap-4 text-sm text-foreground/70">
                <div className="flex items-start gap-3 rounded-xl border border-border/40 bg-background/40 p-3">
                  <Mail
                    className="mt-0.5 h-4 w-4 text-foreground/60"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">Email</p>
                    <p>partners@bulkbuddy.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-border/40 bg-background/40 p-3">
                  <Phone
                    className="mt-0.5 h-4 w-4 text-foreground/60"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">Office</p>
                    <p>+1 (555) BULK-BDY</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-xs font-semibold text-foreground/60"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Alex Johnson"
                    className="rounded-xl border border-border/40 bg-background/40 text-sm text-foreground transition-all focus-visible:border-border/60 focus-visible:ring-2 focus-visible:ring-primary/30"
                    aria-required="true"
                    required
                  />
                  {state?.success === false && state.errors?.name && (
                    <p className="text-xs text-red-500">{state.errors.name[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs font-semibold text-foreground/60"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50"
                      aria-hidden="true"
                    />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="alex@factory.com"
                      className="rounded-xl border border-border/40 bg-background/40 pl-10 text-sm text-foreground transition-all focus-visible:border-border/60 focus-visible:ring-2 focus-visible:ring-primary/30"
                      autoComplete="email"
                      aria-required="true"
                      required
                    />
                  </div>
                  {state?.success === false && state.errors?.email && (
                    <p className="text-xs text-red-500">{state.errors.email[0]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-xs font-semibold text-foreground/60"
                >
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50"
                    aria-hidden="true"
                  />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="rounded-xl border border-border/40 bg-background/40 pl-10 text-sm text-foreground transition-all focus-visible:border-border/60 focus-visible:ring-2 focus-visible:ring-primary/30"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="message"
                  className="text-xs font-semibold text-foreground/60"
                >
                  What materials do you buy?
                </Label>
                <div className="relative">
                  <MessageSquare
                    className="absolute left-3 top-3 h-4 w-4 text-foreground/50"
                    aria-hidden="true"
                  />
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us about your raw material requirements and monthly volume."
                    className="min-h-[140px] rounded-xl border border-border/40 bg-background/40 pl-10 text-sm text-foreground transition-all focus-visible:border-border/60 focus-visible:ring-2 focus-visible:ring-primary/30"
                    aria-required="true"
                    required
                  />
                </div>
                {state?.success === false && state.errors?.message && (
                  <p className="text-xs text-red-500">{state.errors.message[0]}</p>
                )}
              </div>

              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isPending}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50"
                >
                  {isPending ? "Sending..." : "Send Message"}
                  {!isPending && (
                    <Send
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  )}
                </Button>
              </motion.div>

              <p className="text-xs text-foreground/60">
                By submitting this form you agree to our{" "}
                <a
                  href="#"
                  className="text-foreground underline decoration-border/70 underline-offset-4 transition-colors hover:text-primary"
                >
                  privacy policy
                </a>
                .
              </p>
            </motion.div>
          </motion.form>
        </Card>
      </div>
    </div>
  );
}
