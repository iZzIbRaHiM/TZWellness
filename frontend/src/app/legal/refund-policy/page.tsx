import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund Policy | TF Wellfare Medical Clinic",
  description: "Learn about our refund and cancellation policies for appointments and services.",
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen py-20">
      <div className="container-fluid max-w-4xl">
        <Button asChild variant="outline" className="mb-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-emerald-950 mb-6">
          Refund Policy
        </h1>
        
        <p className="text-gray-600 mb-8">
          <strong>Effective Date:</strong> December 25, 2025<br />
          <strong>Last Updated:</strong> December 25, 2025
        </p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">1. General Refund Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              At TF Wellfare Medical Clinic, we strive to provide exceptional healthcare services. This 
              policy outlines the circumstances under which refunds may be issued for our services.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">2. Appointment Cancellations</h2>
            
            <h3 className="font-semibold text-xl text-emerald-900 mb-3">2.1 Cancellation Timeframe</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>24+ hours notice:</strong> Full refund of pre-paid appointment fees</li>
              <li><strong>12-24 hours notice:</strong> 50% cancellation fee applies</li>
              <li><strong>Less than 12 hours:</strong> No refund; full appointment fee charged</li>
              <li><strong>No-show:</strong> Full appointment fee charged; may affect future scheduling</li>
            </ul>

            <h3 className="font-semibold text-xl text-emerald-900 mb-3">2.2 Emergency Exceptions</h3>
            <p className="text-gray-700 leading-relaxed">
              We understand that medical emergencies and unforeseen circumstances occur. Emergency 
              cancellations will be reviewed on a case-by-case basis and may be exempt from cancellation fees.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">3. Service Fees</h2>
            
            <h3 className="font-semibold text-xl text-emerald-900 mb-3">3.1 Consultation Fees</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Consultation fees are charged at the time of service. Refunds for completed consultations 
              are not provided unless there was a billing error or service issue.
            </p>

            <h3 className="font-semibold text-xl text-emerald-900 mb-3">3.2 Lab Tests and Procedures</h3>
            <p className="text-gray-700 leading-relaxed">
              Once lab tests or medical procedures have been performed, fees are non-refundable. If a 
              test is cancelled before specimen collection or procedure initiation, a full refund will be issued.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">4. Insurance Claims</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For insurance-covered services:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>We submit claims to your insurance provider on your behalf</li>
              <li>You are responsible for any deductibles, co-pays, or non-covered services</li>
              <li>If insurance denies a claim, you will be billed for the full service cost</li>
              <li>Refunds for insurance overpayments will be processed within 30 days</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">5. Telehealth Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Telehealth appointment cancellation policies mirror in-person appointments:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>24+ hours notice: Full refund</li>
              <li>Technical issues on our end: Full refund or rescheduling</li>
              <li>Technical issues on patient end: Subject to standard cancellation policy</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">6. Prepaid Packages and Programs</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For multi-visit packages or wellness programs:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Unused portions may be refunded within 30 days of purchase</li>
              <li>After 30 days, packages are non-refundable but may be transferred to family members</li>
              <li>Completed visits within a package are not refundable</li>
              <li>Administrative fee may apply to package refunds ($25)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">7. Billing Errors</h2>
            <p className="text-gray-700 leading-relaxed">
              If you believe there is a billing error, please contact our billing department within 60 
              days. We will investigate and issue corrections or refunds as appropriate within 15 business days.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">8. Refund Processing</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Method:</strong> Refunds will be issued to the original payment method</li>
              <li><strong>Timeframe:</strong> 7-10 business days for processing</li>
              <li><strong>Credit card refunds:</strong> May take additional 3-5 days to appear on statement</li>
              <li><strong>Cash refunds:</strong> Issued by check mailed within 7 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">9. Dispute Resolution</h2>
            <p className="text-gray-700 leading-relaxed">
              If you disagree with a refund decision, you may request a review by contacting our Patient 
              Advocate. We will review your case and provide a final decision within 10 business days.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">10. Contact Billing Department</h2>
            <div className="bg-sand-50 rounded-lg p-6">
              <p className="text-gray-700 mb-2">
                For refund requests or billing questions:
              </p>
              <p className="text-gray-700">
                <strong>Billing Department</strong><br />
                TF Wellfare Medical Clinic<br />
                123 Medical Center Drive, Suite 100<br />
                Healthcare City, HC 12345<br />
                Phone: (123) 456-7890 ext. 2<br />
                Email: billing@tfwellfare.com<br />
                Hours: Mon-Fri, 9 AM - 5 PM
              </p>
            </div>
          </section>

          <section className="bg-emerald-50 rounded-lg p-6">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> This policy does not affect your statutory rights. If you have 
              concerns about our services, please contact us first so we can address them promptly.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
