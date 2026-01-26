import { Metadata } from "next";
import { BookingWizard } from "@/components/booking/booking-wizard";

export const metadata: Metadata = {
  title: "Book Appointment | TZ Wellness - Start Your Healing Journey",
  description:
    "Schedule your personalized lifestyle medicine consultation. Begin reversing diabetes, healing fatty liver, and restoring metabolic health naturally. Evidence-based protocols, compassionate care. Both telehealth and in-person appointments available.",
};

export default function AppointmentsPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      <BookingWizard />
    </div>
  );
}
