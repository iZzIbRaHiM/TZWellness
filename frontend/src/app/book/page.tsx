import { Metadata } from "next";
import { BookingWizard } from "@/components/booking/booking-wizard";

export const metadata: Metadata = {
  title: "Book Your Appointment",
  description:
    "Schedule your personalized consultation at TF Wellfare Medical Clinic. Easy online booking for new and returning patients.",
};

export default function BookPage() {
  return (
    <div className="min-h-screen bg-sand-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-1/4 w-[500px] h-[500px] bg-emerald-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-terracotta-100 rounded-full opacity-25 blur-3xl" />
      </div>
      
      <div className="relative z-10">
        <BookingWizard />
      </div>
    </div>
  );
}
