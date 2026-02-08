import { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ServicesGrid } from "@/components/services/services-grid";

export const metadata: Metadata = {
  title: "Our Services | Lifestyle Medicine for Metabolic Health",
  description:
    "Science-backed lifestyle medicine services to reverse diabetes, heal fatty liver, and restore metabolic health. Personalized nutrition plans, medication reduction, root-cause treatment. Both in-clinic and online consultations available.",
};

export default async function ServicesPage() {
  
  return (
    <div className="min-h-screen bg-sand-50">
      <div className="container-fluid py-8">
        <Breadcrumbs items={[{ label: "Services", href: "/services" }]} />

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-emerald-950 mb-4">
            Our <span className="text-terracotta">Lifestyle Medicine</span> Services
          </h1>
          <p className="text-lg text-gray-600">
            Evidence-based lifestyle interventions to reverse disease and restore health.
            Each service uses food, movement, sleep, and stress relief as therapeutic tools.
          </p>
        </div>

        <ServicesGrid />
      </div>
    </div>
  );
}
