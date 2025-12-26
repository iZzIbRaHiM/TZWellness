import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, ChevronRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | TF Wellfare Medical Clinic",
  description: "Find answers to common questions about our services, appointments, insurance, and billing.",
};

export default function FAQsPage() {
  return (
    <main className="min-h-screen py-20">
      <div className="container-fluid max-w-4xl">
        <Button asChild variant="outline" className="mb-8">
          <Link href="/resources"><ArrowLeft className="mr-2 h-4 w-4" />Back to Resources</Link>
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
            <HelpCircle className="h-6 w-6 text-emerald-700" />
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-emerald-950">
            Frequently Asked Questions
          </h1>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="appointments" className="border rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold">How do I schedule an appointment?</AccordionTrigger>
            <AccordionContent className="text-gray-700">
              You can schedule online through our <Link href="/book" className="text-emerald-700 hover:underline">booking system</Link>, call us at (123) 456-7890, or email appointments@tfwellfare.com.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cancellation" className="border rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold">What is your cancellation policy?</AccordionTrigger>
            <AccordionContent className="text-gray-700">
              We require 24-hour notice for cancellations. Cancellations 12-24 hours before incur a 50% fee. Less than 12 hours or no-shows are charged full fee. See our <Link href="/legal/refund-policy" className="text-emerald-700 hover:underline">Refund Policy</Link>.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="insurance" className="border rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold">Do you accept insurance?</AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Yes, we accept most major insurance plans including Blue Cross Blue Shield, UnitedHealthcare, Aetna, Cigna, and Medicare. Please verify coverage with your provider before your visit.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="telehealth" className="border rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold">Do you offer telehealth appointments?</AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Yes! Telehealth visits are available for consultations, follow-ups, and routine care. Review our <Link href="/legal/telehealth-consent" className="text-emerald-700 hover:underline">Telehealth Consent</Link> and <Link href="/resources/telehealth-prep" className="text-emerald-700 hover:underline">Preparation Guide</Link>.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="first-visit" className="border rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold">What should I bring to my first appointment?</AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Bring photo ID, insurance card, medication list, recent lab results, and completed forms. See our <Link href="/resources/new-patient-guide" className="text-emerald-700 hover:underline">New Patient Guide</Link> for details.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="results" className="border rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold">How do I get my test results?</AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Results are typically available within 3-5 business days and will be discussed during a follow-up appointment or secure message through our patient portal.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="payment" className="border rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold">What payment methods do you accept?</AccordionTrigger>
            <AccordionContent className="text-gray-700">
              We accept cash, credit/debit cards (Visa, Mastercard, Discover, Amex), HSA/FSA cards, and checks. Payment is due at time of service. See <Link href="/resources/payment" className="text-emerald-700 hover:underline">Payment Information</Link>.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="prescriptions" className="border rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold">How do I get prescription refills?</AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Contact your pharmacy for refill requests. They will send an electronic request to our office. Allow 48 hours for processing. Controlled substances require an appointment.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="records" className="border rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold">How do I request my medical records?</AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Submit a written request to records@tfwellfare.com or our front desk. Include your name, DOB, dates of service, and where to send records. Processing takes 7-10 business days.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="emergency" className="border rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold">What should I do in a medical emergency?</AccordionTrigger>
            <AccordionContent className="text-gray-700">
              <strong className="text-red-700">Call 911 immediately for emergencies</strong> including chest pain, difficulty breathing, severe bleeding, loss of consciousness, or suspected stroke. Our clinic is not equipped for emergency care.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-12 bg-emerald-50 rounded-lg p-8">
          <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Still Have Questions?</h2>
          <p className="text-gray-700 mb-6">
            Our team is here to help. Contact us directly or explore our other resources.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/contact">Contact Us <ChevronRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/resources/new-patient-guide">New Patient Guide</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
