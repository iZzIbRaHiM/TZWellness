import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ClipboardCheck, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Pre-Visit Checklist | TF Wellfare Medical Clinic",
  description: "Complete this checklist before your appointment to ensure a productive visit.",
};

export default function PreVisitChecklistPage() {
  return (
    <main className="min-h-screen py-20">
      <div className="container-fluid max-w-4xl">
        <Button asChild variant="outline" className="mb-8">
          <Link href="/resources"><ArrowLeft className="mr-2 h-4 w-4" />Back to Resources</Link>
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
            <ClipboardCheck className="h-6 w-6 text-emerald-700" />
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-emerald-950">
            Pre-Visit Checklist
          </h1>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          <section className="bg-emerald-50 rounded-lg p-6">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Prepare for Your Appointment</h2>
            <p className="text-gray-700">
              Use this checklist to ensure you have everything ready for a productive and efficient visit. Complete as many items as possible before your appointment.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Documents to Bring</h2>
            <div className="space-y-3">
              <div className="flex gap-3 p-4 border rounded-lg">
                <input type="checkbox" className="mt-1 h-5 w-5 text-emerald-700" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Photo ID</h3>
                  <p className="text-gray-700 text-sm">Driver's license, passport, or state ID</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-4 border rounded-lg">
                <input type="checkbox" className="mt-1 h-5 w-5 text-emerald-700" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Insurance Card(s)</h3>
                  <p className="text-gray-700 text-sm">Primary and secondary insurance (both sides)</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-4 border rounded-lg">
                <input type="checkbox" className="mt-1 h-5 w-5 text-emerald-700" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Referral Form</h3>
                  <p className="text-gray-700 text-sm">If required by your insurance plan</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-4 border rounded-lg">
                <input type="checkbox" className="mt-1 h-5 w-5 text-emerald-700" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Payment Method</h3>
                  <p className="text-gray-700 text-sm">Credit card, HSA/FSA card, or check for co-pay</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Medical Information</h2>
            <div className="space-y-3">
              <div className="flex gap-3 p-4 border rounded-lg">
                <input type="checkbox" className="mt-1 h-5 w-5 text-emerald-700" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Current Medication List</h3>
                  <p className="text-gray-700 text-sm">Include prescription medications, over-the-counter drugs, supplements, and vitamins with dosages</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-4 border rounded-lg">
                <input type="checkbox" className="mt-1 h-5 w-5 text-emerald-700" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Allergy List</h3>
                  <p className="text-gray-700 text-sm">Medication allergies and reactions (rash, breathing issues, etc.)</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-4 border rounded-lg">
                <input type="checkbox" className="mt-1 h-5 w-5 text-emerald-700" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Recent Lab Results</h3>
                  <p className="text-gray-700 text-sm">Blood work, imaging, or test results from other providers (last 6 months)</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-4 border rounded-lg">
                <input type="checkbox" className="mt-1 h-5 w-5 text-emerald-700" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Medical History Summary</h3>
                  <p className="text-gray-700 text-sm">Previous diagnoses, surgeries, hospitalizations, and family history</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Prepare Your Questions</h2>
            <div className="space-y-3">
              <div className="flex gap-3 p-4 border rounded-lg">
                <input type="checkbox" className="mt-1 h-5 w-5 text-emerald-700" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Symptom Tracking</h3>
                  <p className="text-gray-700 text-sm">When symptoms started, frequency, severity, triggers, and what makes them better/worse</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-4 border rounded-lg">
                <input type="checkbox" className="mt-1 h-5 w-5 text-emerald-700" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Questions for Provider</h3>
                  <p className="text-gray-700 text-sm">Write down questions about diagnosis, treatment options, medications, lifestyle changes</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-4 border rounded-lg">
                <input type="checkbox" className="mt-1 h-5 w-5 text-emerald-700" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Health Goals</h3>
                  <p className="text-gray-700 text-sm">What you hope to achieve (weight loss, blood sugar control, energy improvement, etc.)</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Day of Appointment</h2>
            <div className="space-y-3">
              <div className="flex gap-3 p-4 border rounded-lg">
                <input type="checkbox" className="mt-1 h-5 w-5 text-emerald-700" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Arrive 15 Minutes Early</h3>
                  <p className="text-gray-700 text-sm">Allow time for check-in, paperwork, and insurance verification</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-4 border rounded-lg">
                <input type="checkbox" className="mt-1 h-5 w-5 text-emerald-700" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Fasting (if required)</h3>
                  <p className="text-gray-700 text-sm">Confirm fasting instructions for lab work (typically 8-12 hours, water allowed)</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-4 border rounded-lg">
                <input type="checkbox" className="mt-1 h-5 w-5 text-emerald-700" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Wear Comfortable Clothing</h3>
                  <p className="text-gray-700 text-sm">Loose-fitting clothes for physical exam and blood pressure measurement</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-sand-50 rounded-lg p-6">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">For Telehealth Appointments</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                <span>Test camera, microphone, and internet 30 minutes before</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                <span>Choose a private, well-lit location with minimal background noise</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                <span>Log in 10 minutes early to virtual waiting room</span>
              </li>
            </ul>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/resources/telehealth-prep">Full Telehealth Guide</Link>
            </Button>
          </section>

          <section className="bg-emerald-50 rounded-lg p-6">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Need More Help?</h2>
            <p className="text-gray-700 mb-6">
              Download our printable checklist or contact us with any questions about preparing for your visit.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/book">Schedule Appointment</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/resources/new-patient-guide">New Patient Guide</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
