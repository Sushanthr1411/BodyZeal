import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/landing/Hero';
import FeatureSection from '@/components/landing/FeatureSection';
import HowItWorks from '@/components/landing/HowItWorks';
import ProductPreview from '@/components/landing/ProductPreview';
import FinalCTA from '@/components/landing/FinalCTA';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <FeatureSection />
        <HowItWorks />
        <ProductPreview />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
