import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Check, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "New Patient Guide | TF Wellfare Medical Clinic",
  description: "Welcome to TF Wellfare! Everything you need to know for your first visit.",
};

export default function NewPatientGuidePage() {
  return (
    <main className="min-h-screen py-20">
      <div className="container-fluid max-w-4xl">
        <Button asChild variant="outline" className="mb-8">
          <Link href="/resources"><ArrowLeft className="mr-2 h-4 w-4" />Back to Resources</Link>
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
            <FileText className="h-6 w-6 text-emerald-700" />
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-emerald-950">
            New Patient Guide
          </h1>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          <section className="bg-emerald-50 rounded-lg p-6">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Welcome to TF Wellfare!</h2>
            <p className="text-gray-700">
              We're excited to partner with you on your health journey. This guide will help you prepare for your first visit and understand what to expect.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Before Your First Visit</h2>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <Check className="h-6 w-6 text-emerald-700 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Complete New Patient Forms</h3>
                  <p className="text-gray-700">Download and complete forms in advance to save time at check-in.</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Check className="h-6 w-6 text-emerald-700 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Verify Insurance Coverage</h3>
                  <p className="text-gray-700">Contact your insurance to confirm we are in-network and understand your benefits.</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Check className="h-6 w-6 text-emerald-700 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Gather Medical Records</h3>
                  <p className="text-gray-700">Request records from previous providers, including recent lab results and imaging.</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Check className="h-6 w-6 text-emerald-700 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Prepare Medication List</h3>
                  <p className="text-gray-700">List all medications, supplements, and vitamins with dosages.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">What to Bring</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Photo ID</strong> (driver's license or passport)</li>
              <li><strong>Insurance card(s)</strong> (primary and secondary if applicable)</li>
              <li><strong>Current medication list</strong> with dosages</li>
              <li><strong>Recent test results</strong> (labs, imaging, pathology)</li>
              <li><strong>Referral form</strong> if required by your insurance</li>
              <li><strong>Payment method</strong> for co-pay/deductible</li>
              <li><strong>Completed forms</strong> (medical history, consent forms)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Your First Appointment</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-emerald-950 mb-2">Arrival (15 minutes early)</h3>
                <p className="text-gray-700">Check in at the front desk, verify insurance, and complete any remaining forms.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-emerald-950 mb-2">Vital Signs & Medical History</h3>
                <p className="text-gray-700">Our staff will take your vitals and review your medical history.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-emerald-950 mb-2">Provider Consultation (45-60 minutes)</h3>
                <p className="text-gray-700">Discuss your health concerns, review symptoms, and create a personalized treatment plan.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-emerald-950 mb-2">Lab Work or Tests</h3>
                <p className="text-gray-700">If needed, labs or diagnostic tests may be ordered.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-emerald-950 mb-2">Checkout & Follow-up</h3>
                <p className="text-gray-700">Schedule follow-up appointments and handle billing.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Insurance & Billing</h2>
            <p className="text-gray-700 mb-4">
              We accept most major insurance plans. Co-pays and deductibles are due at time of service. For detailed payment information, visit our <Link href="/resources/payment" className="text-emerald-700 hover:underline">Payment page</Link>.
            </p>
            <div className="bg-sand-50 rounded-lg p-6">
              <h3 className="font-semibold text-emerald-950 mb-2">Billing Questions?</h3>
              <p className="text-gray-700">Contact our billing department: billing@tfwellfare.com or (123) 456-7890 ext. 2</p>
            </div>
          </section>

          <section className="bg-emerald-50 rounded-lg p-6">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Ready to Schedule?</h2>
            <p className="text-gray-700 mb-6">
              Book your first appointment online or contact our friendly staff who can answer any questions.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/book">Book Appointment</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Contact Us</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/resources/pre-visit-checklist">Pre-Visit Checklist</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
