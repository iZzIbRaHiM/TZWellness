import { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { EventsListing } from "@/components/events/events-listing";

export const metadata: Metadata = {
  title: "Events & Workshops",
  description:
    "Join our health workshops, live Q&A sessions, and support groups. Learn from experts and connect with others on similar health journeys.",
};

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      <div className="container-fluid py-8">
        <Breadcrumbs items={[{ label: "Events", href: "/events" }]} />

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-emerald-950 mb-4">
            Events &amp; <span className="text-terracotta">Workshops</span>
          </h1>
          <p className="text-lg text-gray-600">
            Join our community events, educational workshops, and support groups.
            Learn from experts and connect with others on similar health journeys.
          </p>
        </div>

        <EventsListing />
      </div>
    </div>
  );
}
