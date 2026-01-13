'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion, type Variants } from 'motion/react'
import { ArrowUpRight, PlayCircle, Sparkles } from 'lucide-react'

interface AvatarProfile {
  src: string;
  alt: string;
}

interface Metric {
  label: string;
  value: string;
  caption: string;
}

interface ProcessStep {
  label: string;
  progress: number;
}

interface GalleryImage {
  src: string;
  alt: string;
}

interface ReelStat {
  label: string;
}

const avatarProfiles: AvatarProfile[] = [
  {
    src: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&h=200&fit=crop&q=80",
    alt: "Portrait of a motion designer smiling at the camera",
  },
  {
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&q=80",
    alt: "Portrait of a product strategist in a studio",
  },
  {
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&q=80",
    alt: "Portrait of a UX researcher wearing headphones",
  },
];

const keyMetrics: Metric[] = [
  {
    label: "Avg. Savings",
    value: "24%",
    caption: "Per order",
  },
  {
    label: "Pool Velocity",
    value: "4.2d",
    caption: "Avg. fill time",
  },
  {
    label: "Supplier Reach",
    value: "500+",
    caption: "Verified bulk",
  },
];

const motionProcess: ProcessStep[] = [
  {
    label: "Demand Aggregation",
    progress: 95,
  },
  {
    label: "Supplier Bidding",
    progress: 88,
  },
  {
    label: "Logistics Sync",
    progress: 92,
  },
];

const inspirationGallery: GalleryImage[] = [
  {
    src: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=400&h=320&fit=crop&q=80",
    alt: "Collage of lighting references for motion design",
  },
  {
    src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=320&fit=crop&q=80",
    alt: "Creative workspace with monitors and sketchbook",
  },
  {
    src: "https://images.unsplash.com/photo-1515169067865-5387ec356754?w=400&h=320&fit=crop&q=80",
    alt: "Colorful motion design storyboard pinned to a wall",
  },
  {
    src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=320&fit=crop&q=80",
    alt: "Designer adjusting camera lighting in a studio",
  },
];

const reelStats: ReelStat[] = [
  { label: "3:42 min" },
  { label: "4.2K views" },
  { label: "Dynamic timing curves" },
];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export function BentoGridBlock() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-130 w-130 -translate-x-1/2 rounded-full bg-foreground/[0.035] blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-90 w-90 rounded-full bg-primary/[0.035] blur-[120px]" />
        <div className="absolute left-1/4 top-1/2 h-100 w-100 rounded-full bg-foreground/[0.02] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <motion.header
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <Badge
            variant="outline"
            className="inline-flex items-center gap-2 rounded-full border-border/50 bg-background/60 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-foreground/70 backdrop-blur"
          >
            THE BULK HACK
            <span
              className="h-2 w-2 rounded-full bg-primary"
              aria-hidden="true"
            />
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Aggregate. Negotiate. Dominate.
          </h2>
          <p className="max-w-2xl text-base text-foreground/70 md:text-lg">
            BulkBuddy uses advanced geographical clustering and real-time demand 
            aggregation to unlock enterprise-grade pricing for local manufacturers.
          </p>
        </motion.header>

        <motion.div
          className="mt-12 grid auto-rows-[minmax(200px,auto)] gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0, y: 24 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.6,
                ease: "easeOut",
                staggerChildren: 0.08,
                delayChildren: 0.12,
              },
            },
          }}
        >
          <motion.article
            variants={cardVariants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="group relative col-span-1 flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/40 bg-background/70 p-6 backdrop-blur transition-all hover:border-border/60 hover:shadow-lg sm:col-span-2 lg:row-span-2"
            role="article"
            aria-label="Dynamic Pricing Engine"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.05] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="space-y-4">
                <Badge
                  variant="secondary"
                  className="w-fit rounded-full border-border/40 bg-background/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70"
                >
                  Dynamic Pricing Engine
                </Badge>
                <h3 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
                  Watch the price drop as the pool grows
                </h3>
                <p className="text-sm text-foreground/70 md:text-base">
                  As more SMEs join a pool, our algorithm renegotiates with suppliers in real-time. 
                  Every new kilogram added to the pool lowers the price for everyone involved.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between gap-4">
                <div
                  className="flex -space-x-3"
                  role="list"
                  aria-label="Project team avatars"
                >
                  {avatarProfiles.map((profile) => (
                    <div
                      key={profile.src}
                      role="listitem"
                      className="relative h-11 w-11 overflow-hidden rounded-full border border-border/50 bg-background/80 transition-transform duration-300 group-hover:scale-[1.04]"
                    >
                      <img
                        src={profile.src}
                        alt={profile.alt}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  className="group/cta gap-2 rounded-lg bg-background/70 px-4 py-2 text-sm text-foreground hover:bg-background/80"
                  aria-label="View the featured case study"
                >
                  See Pools
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
                </Button>
              </div>
            </div>
          </motion.article>

          <motion.article
            variants={cardVariants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="group col-span-1 flex h-full flex-col rounded-2xl border border-border/40 bg-background/70 p-6 backdrop-blur transition-all hover:border-border/60 hover:shadow-lg sm:col-span-2"
            role="article"
            aria-label="Key performance metrics"
          >
            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className="w-fit rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary"
              >
                Performance
              </Badge>
              <motion.div
                animate={{ rotate: [0, -6, 0, 6, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 10,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
              </motion.div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {keyMetrics.map((metric) => (
                <div key={metric.label} className="">
                  <p className="text-xs uppercase tracking-[0.18em] text-foreground/60">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                    {metric.value}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-2 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {metric.caption}
                  </p>
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article
            variants={cardVariants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="group relative col-span-1 overflow-hidden rounded-2xl border border-border/40 bg-background/70 backdrop-blur hover:border-border/60 hover:shadow-lg sm:col-span-2 lg:row-span-3"
            role="article"
            aria-label="Geographical Clusters"
          >
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80"
                alt="Industrial factory cluster aerial view"
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            </div>
            <div className="relative flex h-full flex-col justify-end space-y-4 p-6 md:p-8">
              <Badge
                variant="outline"
                className="w-fit rounded-full border-border/60 bg-background/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70"
              >
                Geographical Clusters
              </Badge>
              <h3 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                Grouped by location for efficient logistics
              </h3>
              <p className="max-w-sm text-sm text-foreground/70 md:text-base">
                We group businesses that are close to each other. This reduces last-mile delivery costs 
                and allows for easy split-shipment fulfillment.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {["Regional Hubs", "Shared Logistics", "Local Growth"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border/40 bg-background/70 px-3 py-1 text-xs uppercase tracking-[0.18em] text-foreground/60"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
          </motion.article>

          <motion.article
            variants={cardVariants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="group col-span-1 flex h-full flex-col rounded-2xl border border-border/40 bg-background/70 p-6 backdrop-blur transition-all hover:border-border/60 hover:shadow-lg sm:col-span-2 lg:row-span-2"
            role="article"
            aria-label="Verified Supplier Network"
          >
            <div className="space-y-4">
              <Badge
                variant="outline"
                className="w-fit rounded-full border-primary/50 bg-background/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary"
              >
                Verified Suppliers
              </Badge>
              <h3 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                Direct access to Tier-1 bulk suppliers
              </h3>
              <p className="text-sm text-foreground/70 md:text-base">
                Skip the middlemen. BulkBuddy connects your pool directly to major manufacturers 
                and wholesalers who usually only deal with corporate giants.
              </p>
            </div>
            <div className="mt-6 space-y-4">
              {motionProcess.map((step, index) => (
                <div key={step.label} className="space-y-2">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-foreground/60">
                    <span>{step.label}</span>
                    <span aria-label={`${step.progress}% complete`}>
                      {step.progress}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${step.progress}%` }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.8,
                        ease: "easeOut",
                        delay: index * 0.1,
                      }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="mt-8 w-fit gap-2 px-0 text-sm text-primary hover:text-primary/90"
              aria-label="View Supplier Network"
            >
              <PlayCircle className="h-4 w-4" aria-hidden="true" />
              Supplier Network
            </Button>
          </motion.article>

          <motion.article
            variants={cardVariants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="group col-span-1 flex h-full flex-col overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-primary/15 via-background/70 to-background/90 p-0 backdrop-blur transition-all hover:border-border/60 hover:shadow-lg sm:col-span-2"
            role="article"
            aria-label="Procurement AI"
          >
            <div className="relative h-full">
              <img
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=600&fit=crop&q=80"
                alt="AI circuit board concept"
                className="absolute inset-0 h-full w-full object-cover opacity-30 transition-opacity duration-500 group-hover:opacity-40"
              />
              <div className="relative flex h-full flex-col justify-between bg-gradient-to-br from-background/90 via-background/70 to-transparent p-6 md:p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="w-fit rounded-full border-border/50 bg-background/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70"
                    >
                      Procurement AI
                    </Badge>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.4,
                        ease: "easeInOut",
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20"
                    >
                      <Sparkles
                        className="h-4 w-4 text-primary"
                        aria-hidden="true"
                      />
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                    Smart demand forecasting
                  </h3>
                  <p className="max-w-md text-sm text-foreground/70 md:text-base">
                    Our AI predicts when pools will fill and suggests the optimal time to join 
                    based on historical market data and supplier availability.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-xs text-foreground/60">
                  <div className="flex flex-wrap gap-2">
                    {["Predictive", "Optimized", "Real-time"].map((label) => (
                      <span
                        key={label}
                        className="rounded-full bg-background/80 px-3 py-1 uppercase tracking-[0.18em]"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <Button size="sm" className="gap-2">
                    Try AI Demo
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.article>

          <motion.article
            variants={cardVariants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="group col-span-1 flex h-full flex-col rounded-2xl border border-border/40 bg-background/70 p-6 backdrop-blur transition-all hover:border-border/60 hover:shadow-lg sm:col-span-2"
            role="article"
            aria-label="Success Stories"
          >
            <div className="space-y-3">
              <Badge
                variant="outline"
                className="w-fit rounded-full border-border/50 bg-background/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/60"
              >
                Success Stories
              </Badge>
              <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                Real impact for local manufacturing
              </h3>
              <p className="text-sm text-foreground/70 md:text-base">
                See how small factories are increasing their margins by over 15% 
                just by changing how they source their core materials.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {inspirationGallery.map((image) => (
                <div
                  key={image.src}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border/30 bg-background/60"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="mt-6 w-fit gap-2 px-0 text-sm text-primary hover:text-primary/90"
              aria-label="Read all stories"
            >
              Read all stories
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </motion.article>
        </motion.div>
      </div>
    </div>
  );
}
