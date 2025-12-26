import { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { AppointmentLookup } from "@/components/booking/appointment-lookup";

export const metadata: Metadata = {
  title: "Appointment Lookup",
  description:
    "Look up your appointment details using your reference number and email address.",
};

export default function AppointmentLookupPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      <div className="container-fluid py-8">
        <Breadcrumbs
          items={[{ label: "Appointment Lookup", href: "/appointments/lookup" }]}
        />

        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-emerald-950 mb-4">
              Find Your Appointment
            </h1>
            <p className="text-gray-600">
              Enter your reference number and email address to view your
              appointment details.
            </p>
          </div>

          <AppointmentLookup />
        </div>
      </div>
    </div>
  );
}
