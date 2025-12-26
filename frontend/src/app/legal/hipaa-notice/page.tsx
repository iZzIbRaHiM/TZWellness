import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "HIPAA Notice of Privacy Practices | TF Wellfare Medical Clinic",
  description: "Notice of Privacy Practices explaining how your medical information may be used and disclosed.",
};

export default function HIPAANoticePage() {
  return (
    <main className="min-h-screen py-20">
      <div className="container-fluid max-w-4xl">
        <Button asChild variant="outline" className="mb-8">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Shield className="h-6 w-6 text-emerald-700" />
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-emerald-950">
            HIPAA Notice of Privacy Practices
          </h1>
        </div>
        
        <p className="text-gray-600 mb-8">
          <strong>Effective Date:</strong> December 25, 2025
        </p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section className="bg-emerald-50 rounded-lg p-6">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">This Notice Describes:</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>How medical information about you may be used and disclosed</li>
              <li>How you can get access to this information</li>
              <li>Your rights regarding your Protected Health Information (PHI)</li>
            </ul>
            <p className="text-gray-700 mt-4 font-semibold">
              Please review this notice carefully. We are required by law to maintain the privacy of PHI and to provide you with this notice.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">1. Uses and Disclosures of Protected Health Information</h2>
            
            <h3 className="font-semibold text-xl text-emerald-900 mb-3">We May Use and Disclose Your PHI For:</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-emerald-950 mb-2">Treatment</h4>
                <p className="text-gray-700">To provide, coordinate, or manage your healthcare. Example: Sharing test results with specialists.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-emerald-950 mb-2">Payment</h4>
                <p className="text-gray-700">To obtain payment for services. Example: Submitting claims to your insurance company.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-emerald-950 mb-2">Healthcare Operations</h4>
                <p className="text-gray-700">For quality improvement, training, and business management. Example: Internal audits and staff training.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">2. Your Rights Regarding Medical Information</h2>
            
            <ul className="space-y-4">
              <li>
                <strong className="text-emerald-950">Right to Inspect and Copy:</strong>
                <p className="text-gray-700">Request copies of your medical records (fees may apply).</p>
              </li>
              <li>
                <strong className="text-emerald-950">Right to Amend:</strong>
                <p className="text-gray-700">Request corrections to your medical records if you believe they are incorrect.</p>
              </li>
              <li>
                <strong className="text-emerald-950">Right to an Accounting:</strong>
                <p className="text-gray-700">Request a list of certain disclosures of your PHI.</p>
              </li>
              <li>
                <strong className="text-emerald-950">Right to Request Restrictions:</strong>
                <p className="text-gray-700">Request limits on how we use or disclose your information (we are not required to agree).</p>
              </li>
              <li>
                <strong className="text-emerald-950">Right to Confidential Communications:</strong>
                <p className="text-gray-700">Request communication via specific methods or locations.</p>
              </li>
              <li>
                <strong className="text-emerald-950">Right to a Paper Copy:</strong>
                <p className="text-gray-700">Request a paper copy of this notice at any time.</p>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">3. Complaints</h2>
            <p className="text-gray-700 mb-4">
              If you believe your privacy rights have been violated, you may file a complaint with:
            </p>
            <div className="bg-sand-50 rounded-lg p-6 space-y-4">
              <div>
                <p className="font-semibold text-emerald-950">Our Privacy Officer:</p>
                <p className="text-gray-700">TF Wellfare Medical Clinic<br />
                123 Medical Center Drive, Suite 100<br />
                Healthcare City, HC 12345<br />
                Phone: (123) 456-7890<br />
                Email: privacy@tfwellfare.com</p>
              </div>
              <div>
                <p className="font-semibold text-emerald-950">U.S. Department of Health and Human Services:</p>
                <p className="text-gray-700">Office for Civil Rights<br />
                Website: www.hhs.gov/ocr/privacy/<br />
                Phone: 1-877-696-6775</p>
              </div>
            </div>
            <p className="text-gray-700 mt-4 font-semibold">
              You will not be penalized for filing a complaint.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">4. Contact Information</h2>
            <div className="bg-sand-50 rounded-lg p-6">
              <p className="text-gray-700 mb-2">For questions about this notice or to exercise your rights:</p>
              <p className="text-gray-700">
                <strong>Privacy Officer</strong><br />
                TF Wellfare Medical Clinic<br />
                Phone: (123) 456-7890<br />
                Email: privacy@tfwellfare.com
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
