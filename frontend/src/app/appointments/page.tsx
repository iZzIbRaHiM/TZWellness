import { Metadata } from "next";
import { BookingWizard } from "@/components/booking/booking-wizard";

export const metadata: Metadata = {
  title: "Book Appointment | TZ Wellness Health",
  description:
    "Schedule your personalized metabolic health consultation. Choose from diabetes management, thyroid care, PCOS treatment, or obesity management services. Telehealth and in-person appointments available.",
};

export default function AppointmentsPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      <BookingWizard />
    </div>
  );
}
