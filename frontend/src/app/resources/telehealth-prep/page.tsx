import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Video, Check, AlertTriangle, Wifi } from "lucide-react";

export const metadata: Metadata = {
  title: "Telehealth Preparation Guide | TF Wellfare Medical Clinic",
  description: "How to prepare for your virtual appointment and ensure a smooth telehealth experience.",
};

export default function TelehealthPrepPage() {
  return (
    <main className="min-h-screen py-20">
      <div className="container-fluid max-w-4xl">
        <Button asChild variant="outline" className="mb-8">
          <Link href="/resources"><ArrowLeft className="mr-2 h-4 w-4" />Back to Resources</Link>
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Video className="h-6 w-6 text-emerald-700" />
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-emerald-950">
            Telehealth Preparation Guide
          </h1>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          <section className="bg-emerald-50 rounded-lg p-6">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Get Ready for Your Virtual Visit</h2>
            <p className="text-gray-700">
              Telehealth appointments offer convenient, high-quality care from the comfort of your home. Follow this guide to ensure a successful virtual visit.
            </p>
          </section>

          <section className="border-l-4 border-emerald-700 bg-emerald-50 rounded-r-lg p-6">
            <div className="flex gap-3 mb-4">
              <Wifi className="h-6 w-6 text-emerald-700 flex-shrink-0" />
              <h2 className="font-serif text-2xl font-bold text-emerald-950">Technical Requirements</h2>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                <span><strong>Internet Connection:</strong> Minimum 3 Mbps download speed (10+ Mbps recommended)</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                <span><strong>Device:</strong> Computer, tablet, or smartphone with camera and microphone</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                <span><strong>Browser:</strong> Latest version of Chrome, Firefox, Safari, or Edge</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                <span><strong>Audio/Video:</strong> Working camera, microphone, and speakers (or headphones)</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Before Your Appointment</h2>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <Check className="h-6 w-6 text-emerald-700 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Test Your Technology (30 minutes before)</h3>
                  <p className="text-gray-700">Test camera, microphone, and internet. Close unnecessary apps and tabs.</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Check className="h-6 w-6 text-emerald-700 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Choose a Private, Quiet Location</h3>
                  <p className="text-gray-700">Find a well-lit room with minimal background noise and distractions.</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Check className="h-6 w-6 text-emerald-700 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Have Documents Ready</h3>
                  <p className="text-gray-700">Insurance card, medication list, recent test results, and questions for your provider.</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Check className="h-6 w-6 text-emerald-700 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-emerald-950">Log In Early (10 minutes before)</h3>
                  <p className="text-gray-700">Access the virtual waiting room to avoid delays.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">During Your Appointment</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Position yourself:</strong> Sit facing a light source (not backlit) with camera at eye level</li>
              <li><strong>Minimize distractions:</strong> Silence phone notifications and close background apps</li>
              <li><strong>Speak clearly:</strong> Look at the camera when speaking, not the screen</li>
              <li><strong>Ask questions:</strong> Don't hesitate to ask for clarification or repeat information</li>
              <li><strong>Take notes:</strong> Write down important instructions or follow-up steps</li>
            </ul>
          </section>

          <section className="border-l-4 border-yellow-500 bg-yellow-50 rounded-r-lg p-6">
            <div className="flex gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-700 flex-shrink-0" />
              <h2 className="font-serif text-2xl font-bold text-yellow-900">Troubleshooting Common Issues</h2>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li>
                <strong className="text-yellow-950">Poor video/audio quality:</strong> Move closer to WiFi router, close other apps, reduce video quality in settings
              </li>
              <li>
                <strong className="text-yellow-950">Can't hear/see provider:</strong> Check volume, unmute microphone, enable camera permissions in browser
              </li>
              <li>
                <strong className="text-yellow-950">Connection drops:</strong> Switch to phone call option, reschedule if issues persist
              </li>
            </ul>
            <p className="mt-4 text-gray-700">
              <strong>Need help?</strong> Contact our telehealth support: telehealth@tfwellfare.com or (123) 456-7890 ext. 3
            </p>
          </section>

          <section className="border-l-4 border-red-600 bg-red-50 rounded-r-lg p-6">
            <div className="flex gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-700 flex-shrink-0" />
              <h2 className="font-serif text-2xl font-bold text-red-900">When NOT to Use Telehealth</h2>
            </div>
            <p className="text-red-900 font-semibold mb-3">Call 911 immediately for emergencies:</p>
            <ul className="list-disc pl-6 text-gray-800 space-y-1">
              <li>Chest pain, difficulty breathing, or suspected heart attack/stroke</li>
              <li>Severe bleeding, injuries, or trauma</li>
              <li>Loss of consciousness or severe confusion</li>
              <li>Suicidal thoughts or self-harm intent</li>
              <li>Severe allergic reactions</li>
            </ul>
          </section>

          <section className="bg-emerald-50 rounded-lg p-6">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Ready to Book?</h2>
            <p className="text-gray-700 mb-6">
              Review our Telehealth Consent and schedule your virtual appointment today.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/book">Book Telehealth Visit</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/legal/telehealth-consent">Telehealth Consent</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/resources/faqs">FAQs</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
