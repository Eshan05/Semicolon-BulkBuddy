import { FooterBlock } from "@/components/layout/public-footer";
import PublicNavbar from "@/components/layout/public-navbar";
import { ContactFormSection } from "@/components/sections/contact";
import { BentoGridBlock } from "@/components/sections/landing-bento";
import { DashboardPageLanding } from "@/components/sections/landing-dashboard";
import { FAQAccordionBlock } from "@/components/sections/landing-faq";
import { GlowyWavesHero } from "@/components/sections/landing-hero";

export default function Home() {
  return (
    <div className="mx-auto px-4 py-12 md:px-6 lg:px-8">
      <PublicNavbar />
      <div className="mx-auto space-y-12">
        <section>
          <GlowyWavesHero />
        </section>

        <section>
          <DashboardPageLanding />
        </section>

        <section>
          <BentoGridBlock />
        </section>

        <section>
          <ContactFormSection />
        </section>

        <section>
          <FAQAccordionBlock />
        </section>

        <section>
          <FooterBlock />
        </section>
      </div>
    </div>
  )
}
