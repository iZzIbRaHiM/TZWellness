import { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { TrustMarquee } from "@/components/home/trust-marquee";
import { ValuePropsSection } from "@/components/home/value-props-section";
import { ServicesSection } from "@/components/home/services-section";
import { CertificationsBar } from "@/components/home/certifications-bar";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { BlogSection } from "@/components/home/blog-section";
import { CTASection } from "@/components/home/cta-section";
import { MedicalBusinessSchema } from "@/components/seo/schemas";

export const metadata: Metadata = {
  title: "TZ Wellness Health | Nurturing Our Health Through Metabolic Care",
  description:
    "Expert metabolic and chronic disease management. Specializing in diabetes, thyroid disorders, PCOS, and obesity care with personalized treatment plans, nutrition counseling, and lifestyle medicine.",
};

export default function HomePage() {
  return (
    <>
      <MedicalBusinessSchema />
      <HeroSection />
      <TrustMarquee />
      <BlogSection />
      <ValuePropsSection />
      <CertificationsBar />
      <ServicesSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
