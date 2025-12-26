import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | TF Wellfare Medical Clinic",
  description: "Read our privacy policy to understand how TF Wellfare Medical Clinic collects, uses, and protects your personal health information.",
};

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>
        
        <p className="text-gray-600 mb-8">
          <strong>Effective Date:</strong> December 25, 2025<br />
          <strong>Last Updated:</strong> December 25, 2025
        </p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              TF Wellfare Medical Clinic ("we," "us," or "our") is committed to protecting your privacy and 
              ensuring the security of your personal and health information. This Privacy Policy explains how 
              we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using our services, you consent to the practices described in this Privacy Policy. We comply 
              with the Health Insurance Portability and Accountability Act (HIPAA) and all applicable federal 
              and state privacy laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">2. Information We Collect</h2>
            
            <h3 className="font-semibold text-xl text-emerald-900 mb-3">2.1 Personal Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Name, date of birth, and contact information (email, phone, address)</li>
              <li>Insurance information and payment details</li>
              <li>Emergency contact information</li>
              <li>Social Security Number (when required for billing)</li>
            </ul>

            <h3 className="font-semibold text-xl text-emerald-900 mb-3">2.2 Protected Health Information (PHI)</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect health information necessary for providing medical care:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Medical history, symptoms, and diagnoses</li>
              <li>Lab results, imaging reports, and test outcomes</li>
              <li>Treatment plans and medication records</li>
              <li>Clinical notes and consultation records</li>
            </ul>

            <h3 className="font-semibold text-xl text-emerald-900 mb-3">2.3 Usage Information</h3>
            <p className="text-gray-700 leading-relaxed">
              When you visit our website, we automatically collect device information, IP address, 
              browser type, pages visited, and usage patterns through cookies and similar technologies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We use your information for:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Treatment:</strong> Providing, coordinating, and managing your healthcare</li>
              <li><strong>Payment:</strong> Billing and collecting payment for services rendered</li>
              <li><strong>Healthcare Operations:</strong> Quality improvement, staff training, and compliance</li>
              <li><strong>Communication:</strong> Appointment reminders, test results, and health information</li>
              <li><strong>Legal Compliance:</strong> Meeting regulatory requirements and responding to legal requests</li>
              <li><strong>Marketing:</strong> Sending health tips and clinic updates (with your consent)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We only share your information as permitted by law and your authorization:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Healthcare Providers:</strong> Other providers involved in your care</li>
              <li><strong>Business Associates:</strong> Third-party service providers (lab, pharmacy, billing)</li>
              <li><strong>Insurance Companies:</strong> For claims processing and coverage verification</li>
              <li><strong>Legal Authorities:</strong> When required by law, court order, or public health reporting</li>
              <li><strong>Emergency Situations:</strong> To protect health and safety when necessary</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              We never sell your personal or health information to third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">5. Your Privacy Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Under HIPAA, you have the right to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Access:</strong> Request copies of your medical records</li>
              <li><strong>Amendment:</strong> Request corrections to your health information</li>
              <li><strong>Accounting:</strong> Receive a list of certain disclosures we've made</li>
              <li><strong>Restriction:</strong> Request limits on how we use/disclose your information</li>
              <li><strong>Confidential Communication:</strong> Request communication via specific methods</li>
              <li><strong>Revoke Authorization:</strong> Withdraw consent for certain uses (with exceptions)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">6. Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement administrative, physical, and technical safeguards to protect your information:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Encrypted data transmission (SSL/TLS)</li>
              <li>Secure electronic health record systems</li>
              <li>Access controls and authentication requirements</li>
              <li>Regular security audits and staff training</li>
              <li>Secure disposal of physical and electronic records</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">7. Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our website uses cookies to improve functionality and analyze usage. You can control 
              cookie preferences through your browser settings. Disabling cookies may limit website functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              We do not knowingly collect information from children under 13 without parental consent. 
              For patients under 18, we require guardian consent and involvement as appropriate.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy periodically. We will notify you of material changes via 
              email or website notice. The "Last Updated" date reflects the most recent revision.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">10. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For questions about this Privacy Policy or to exercise your privacy rights, contact:
            </p>
            <div className="bg-sand-50 rounded-lg p-6">
              <p className="font-semibold text-emerald-950 mb-2">Privacy Officer</p>
              <p className="text-gray-700">TF Wellfare Medical Clinic</p>
              <p className="text-gray-700">123 Medical Center Drive, Suite 100</p>
              <p className="text-gray-700">Healthcare City, HC 12345</p>
              <p className="text-gray-700 mt-3">
                Phone: (123) 456-7890<br />
                Email: privacy@tfwellfare.com
              </p>
            </div>
          </section>

          <section className="bg-emerald-50 rounded-lg p-6 mt-8">
            <p className="text-sm text-gray-600">
              <strong>Notice:</strong> This Privacy Policy supplements our HIPAA Notice of Privacy Practices. 
              For detailed information about how we handle Protected Health Information, please see our{" "}
              <Link href="/legal/hipaa-notice" className="text-emerald-700 hover:text-emerald-900 underline">
                HIPAA Notice
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
