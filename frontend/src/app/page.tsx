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
  title: "TF Wellfare Medical Clinic | End Metabolic Frustration",
  description:
    "End Metabolic Frustration & Reboot Your Health — Book Your Personalized Consultation Today. Expert care for Diabetes, Thyroid, PCOS, and Metabolic Health.",
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
