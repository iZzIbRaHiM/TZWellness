import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Video, Wifi, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Telehealth Consent | TF Wellfare Medical Clinic",
  description: "Read and consent to telehealth services at TF Wellfare Medical Clinic.",
};

export default function TelehealthConsentPage() {
  return (
    <main className="min-h-screen py-20">
      <div className="container-fluid max-w-4xl">
        <Button asChild variant="outline" className="mb-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Video className="h-6 w-6 text-emerald-700" />
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-emerald-950">
            Telehealth Consent
          </h1>
        </div>
        
        <p className="text-gray-600 mb-8">
          <strong>Effective Date:</strong> December 25, 2025<br />
          <strong>Last Updated:</strong> December 25, 2025
        </p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section className="bg-emerald-50 rounded-lg p-6">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">What is Telehealth?</h2>
            <p className="text-gray-700 leading-relaxed">
              Telehealth allows you to receive medical care remotely through secure video conferencing 
              technology. It provides access to healthcare services from the comfort of your home while 
              maintaining the same quality of care as in-person visits.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">1. Consent to Telehealth Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By scheduling and participating in a telehealth appointment with TF Wellfare Medical Clinic, 
              you consent to receive healthcare services via electronic communications. This includes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Real-time video consultations with healthcare providers</li>
              <li>Secure messaging for follow-up care</li>
              <li>Electronic transmission of medical information</li>
              <li>Remote monitoring when applicable</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">2. Benefits of Telehealth</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Convenient access from home or work",
                "Reduced travel time and costs",
                "Continued care during illness or mobility limitations",
                "Access to specialists regardless of location",
                "Flexible scheduling options",
                "Same quality of care as in-person visits"
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">3. Potential Risks and Limitations</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              While telehealth is generally safe and effective, you should be aware of:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Technical Issues:</strong> Internet connectivity or equipment problems may interrupt care</li>
              <li><strong>Physical Examination Limitations:</strong> Some conditions require in-person assessment</li>
              <li><strong>Emergency Situations:</strong> Telehealth is not appropriate for medical emergencies</li>
              <li><strong>Privacy Considerations:</strong> Ensure you're in a private location for your appointment</li>
              <li><strong>Quality Variability:</strong> Video/audio quality depends on your internet connection</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">4. Your Responsibilities</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To ensure effective telehealth care, you agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide accurate medical history and current medications</li>
              <li>Be in a well-lit, quiet, private location for your appointment</li>
              <li>Use reliable internet connection and compatible device</li>
              <li>Test your audio/video before the appointment</li>
              <li>Have a backup communication method available (phone number)</li>
              <li>Inform the provider of anyone else present during the session</li>
              <li>Follow all treatment recommendations and medication instructions</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">5. Privacy and Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We take your privacy seriously and use HIPAA-compliant technology to protect your health information:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Encrypted video conferencing platforms</li>
              <li>Secure electronic health records</li>
              <li>No recording of sessions without explicit consent</li>
              <li>Limited access to authorized healthcare personnel only</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              However, please note that no electronic system is completely secure. While we implement 
              industry-standard security measures, we cannot guarantee absolute confidentiality.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">6. When NOT to Use Telehealth</h2>
            <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-6">
              <p className="text-gray-700 font-semibold mb-3">
                Seek immediate in-person medical attention or call 911 for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Chest pain or difficulty breathing</li>
                <li>Severe allergic reactions</li>
                <li>Uncontrolled bleeding</li>
                <li>Loss of consciousness</li>
                <li>Severe injuries or trauma</li>
                <li>Suicidal thoughts or mental health crises</li>
                <li>Any life-threatening emergency</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">7. Technical Requirements</h2>
            <div className="bg-sand-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg text-emerald-900 mb-3 flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Recommended Setup
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Device:</strong> Computer, tablet, or smartphone with camera and microphone</li>
                <li><strong>Internet:</strong> High-speed connection (minimum 3 Mbps download/1 Mbps upload)</li>
                <li><strong>Browser:</strong> Latest version of Chrome, Firefox, Safari, or Edge</li>
                <li><strong>Location:</strong> Private, well-lit, quiet space</li>
                <li><strong>Backup:</strong> Phone number available for alternative communication</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">8. Billing and Insurance</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Telehealth visits are billed the same as in-person appointments:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Most insurance plans cover telehealth services</li>
              <li>Co-pays and deductibles apply as usual</li>
              <li>You will be notified of any out-of-pocket costs before your visit</li>
              <li>Payment is due at time of service</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">9. Consent Duration and Withdrawal</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              This consent remains in effect for all future telehealth appointments unless you withdraw it. 
              You may withdraw consent at any time by:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Contacting our office in writing</li>
              <li>Informing your provider during a visit</li>
              <li>Emailing telehealth@tfwellfare.com</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Withdrawal of consent will not affect previously provided care or medical records.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">10. Questions or Support</h2>
            <div className="bg-sand-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                For telehealth technical support or questions about this consent:
              </p>
              <p className="text-gray-700">
                <strong>Telehealth Coordinator</strong><br />
                TF Wellfare Medical Clinic<br />
                Phone: (123) 456-7890 ext. 3<br />
                Email: telehealth@tfwellfare.com<br />
                Support Hours: Mon-Fri, 8 AM - 6 PM
              </p>
            </div>
          </section>

          <section className="bg-emerald-900 text-white rounded-lg p-8 mt-8">
            <h3 className="font-serif text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-emerald-100 mb-6">
              Review our telehealth preparation guide to ensure a smooth virtual visit experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50">
                <Link href="/resources/telehealth-prep">
                  View Telehealth Prep Guide
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-emerald-800">
                <Link href="/book">
                  Book Telehealth Appointment
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
