import { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ServicesGrid } from "@/components/services/services-grid";
import { servicesApi } from "@/lib/api";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Comprehensive medical services including Diabetes Management, Thyroid Care, PCOS Treatment, and Obesity Management. Holistic, personalized healthcare.",
};

async function getServices() {
  const response = await servicesApi.getAll();
  return response.data?.services || [];
}

async function getCategories() {
  const response = await servicesApi.getCategories();
  return response.data || [];
}

export default async function ServicesPage() {
  // In production, these would fetch from the API
  // For now, we'll use static data in the component
  
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
