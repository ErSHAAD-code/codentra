import { CTA, Footer } from '@/components/marketing/cta-footer';
import { FAQ } from '@/components/marketing/faq';
import { Features } from '@/components/marketing/features';
import { Hero } from '@/components/marketing/hero';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { Navbar } from '@/components/marketing/navbar';
import { Pricing } from '@/components/marketing/pricing';
import { TechStack } from '@/components/marketing/tech-stack';
import { Testimonials } from '@/components/marketing/testimonials';
import { ScrambleManifesto } from '@/components/marketing/scramble-manifesto';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ScrambleManifesto />
        <Features />
        <HowItWorks />
        <TechStack />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
