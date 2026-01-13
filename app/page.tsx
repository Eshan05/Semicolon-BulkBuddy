import { FooterBlock } from "@/components/layout/public-footer";
import PublicNavbar from "@/components/layout/public-navbar";
import { ContactFormSection } from "@/components/sections/contact";
import { BentoGridBlock } from "@/components/sections/landing-bento";
import { DashboardPageLanding } from "@/components/sections/landing-dashboard";
import { FAQAccordionBlock } from "@/components/sections/landing-faq";
import { GlowyWavesHero } from "@/components/sections/landing-hero";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background">
      <PublicNavbar />
      <div className="flex flex-col">
        <section id="hero">
          <GlowyWavesHero />
        </section>

        <section id="how-it-works" className="py-12 md:py-20">
          <DashboardPageLanding />
        </section>

        <section id="features" className="py-12 md:py-20 bg-muted/30">
          <BentoGridBlock />
        </section>

        <section id="contact" className="py-12 md:py-20">
          <ContactFormSection />
        </section>

        <section id="faq" className="py-12 md:py-20 bg-muted/30">
          <FAQAccordionBlock />
        </section>

        <FooterBlock />
      </div>
    </main>
  )
}
