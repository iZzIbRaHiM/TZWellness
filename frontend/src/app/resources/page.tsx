import { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ResourcesSections } from "@/components/resources/resources-sections";

export const metadata: Metadata = {
  title: "Patient Resources",
  description:
    "Access helpful resources including downloadable guides, payment information, telehealth preparation tips, and patient forms.",
};

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      <div className="container-fluid py-8">
        <Breadcrumbs items={[{ label: "Resources", href: "/resources" }]} />

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-emerald-950 mb-4">
            Patient <span className="text-terracotta">Resources</span>
          </h1>
          <p className="text-lg text-gray-600">
            Everything you need to prepare for your visit and manage your health.
            Download guides, understand your payment options, and get ready for
            telehealth appointments.
          </p>
        </div>

        <ResourcesSections />
      </div>
    </div>
  );
}
