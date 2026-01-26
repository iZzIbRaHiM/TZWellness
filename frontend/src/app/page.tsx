import { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { ValuePropsSection } from "@/components/home/value-props-section";
import { ServicesSection } from "@/components/home/services-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { BlogSection } from "@/components/home/blog-section";
import { CTASection } from "@/components/home/cta-section";
import { MedicalBusinessSchema } from "@/components/seo/schemas";

export const metadata: Metadata = {
  title: "TZ Wellness | Reversing Diabetes • Healing Fatty Liver • Restoring Metabolic Health",
  description:
    "Dedicated lifestyle medicine center helping you reverse disease—not just manage it. Specialized care for prediabetes, diabetes, fatty liver, autoimmune diseases through evidence-based lifestyle interventions. Natural healing, personalized plans, compassionate care.",
};

export default function HomePage() {
  return (
    <>
      <MedicalBusinessSchema />
      <HeroSection />
      <BlogSection />
      <ValuePropsSection />
      <ServicesSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
