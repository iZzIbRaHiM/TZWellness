import { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ServicesGrid } from "@/components/services/services-grid";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Comprehensive medical services including Diabetes Management, Thyroid Care, PCOS Treatment, and Obesity Management. Holistic, personalized healthcare.",
};

export default async function ServicesPage() {
  
  return (
    <div className="min-h-screen bg-sand-50">
      <div className="container-fluid py-8">
        <Breadcrumbs items={[{ label: "Services", href: "/services" }]} />

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-emerald-950 mb-4">
            Our <span className="text-terracotta">Specialized</span> Services
          </h1>
          <p className="text-lg text-gray-600">
            We offer comprehensive care for metabolic and hormonal conditions.
            Each service is designed with your complete wellness in mind.
          </p>
        </div>

        <ServicesGrid />
      </div>
    </div>
  );
}
