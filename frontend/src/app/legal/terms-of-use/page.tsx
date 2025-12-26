import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Use | TF Wellfare Medical Clinic",
  description: "Read the terms and conditions for using TF Wellfare Medical Clinic's website and services.",
};

export default function TermsPage() {
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
          Terms of Use
        </h1>
        
        <p className="text-gray-600 mb-8">
          <strong>Effective Date:</strong> December 25, 2025<br />
          <strong>Last Updated:</strong> December 25, 2025
        </p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using TF Wellfare Medical Clinic's website and services ("Services"), you agree 
              to be bound by these Terms of Use. If you do not agree to these terms, please do not use our Services.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">2. Medical Disclaimer</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The information provided on this website is for informational purposes only and does not constitute 
              medical advice. Always consult with a qualified healthcare provider for medical advice, diagnosis, 
              or treatment.
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Website content should not replace professional medical consultation</li>
              <li>Do not disregard professional medical advice based on website information</li>
              <li>Call 911 or seek immediate medical attention for emergencies</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">3. User Responsibilities</h2>
            <p className="text-gray-700 leading-relaxed mb-4">When using our Services, you agree to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Notify us immediately of any unauthorized account access</li>
              <li>Use the Services only for lawful purposes</li>
              <li>Not attempt to disrupt or interfere with our Services</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">4. Appointment Policy</h2>
            <h3 className="font-semibold text-xl text-emerald-900 mb-3">4.1 Scheduling</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Appointments can be scheduled online, by phone, or in person. Appointment availability is 
              subject to provider schedule and clinic capacity.
            </p>
            
            <h3 className="font-semibold text-xl text-emerald-900 mb-3">4.2 Cancellations</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Please provide at least 24 hours notice for appointment cancellations. Late cancellations or 
              no-shows may result in a cancellation fee and may affect future scheduling.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">5. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All content on this website, including text, graphics, logos, images, and software, is the 
              property of TF Wellfare Medical Clinic and is protected by copyright and trademark laws.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You may not reproduce, distribute, modify, or create derivative works without our express 
              written permission.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              To the fullest extent permitted by law, TF Wellfare Medical Clinic shall not be liable for 
              any indirect, incidental, special, consequential, or punitive damages resulting from your 
              use or inability to use our Services.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">7. Third-Party Links</h2>
            <p className="text-gray-700 leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for the content, 
              privacy practices, or terms of use of these external sites.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">8. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms of Use at any time. Continued use of our Services 
              after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">9. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms of Use are governed by the laws of the state in which our clinic operates, without 
              regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">10. Contact Information</h2>
            <div className="bg-sand-50 rounded-lg p-6">
              <p className="text-gray-700 mb-2">
                For questions about these Terms of Use, contact:
              </p>
              <p className="text-gray-700">
                TF Wellfare Medical Clinic<br />
                123 Medical Center Drive, Suite 100<br />
                Healthcare City, HC 12345<br />
                Phone: (123) 456-7890<br />
                Email: info@tfwellfare.com
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
