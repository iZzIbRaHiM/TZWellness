import { Metadata } from "next";
import { BookingWizard } from "@/components/booking/booking-wizard";

export const metadata: Metadata = {
  title: "Book Appointment | TZ Wellness",
  description:
    "Schedule your personalized mental health and wellness consultation. Choose your service, select a convenient time, and start your journey to better health.",
};

export default function AppointmentsPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      <BookingWizard />
    </div>
  );
}
