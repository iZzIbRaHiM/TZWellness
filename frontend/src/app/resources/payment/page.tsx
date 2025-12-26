import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Shield, DollarSign } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment Information | TF Wellfare Medical Clinic",
  description: "Insurance, payment methods, billing policies, and financial assistance information.",
};

export default function PaymentPage() {
  return (
    <main className="min-h-screen py-20">
      <div className="container-fluid max-w-4xl">
        <Button asChild variant="outline" className="mb-8">
          <Link href="/resources"><ArrowLeft className="mr-2 h-4 w-4" />Back to Resources</Link>
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-emerald-700" />
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-emerald-950">
            Payment Information
          </h1>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          <section className="bg-emerald-50 rounded-lg p-6">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Understanding Your Payment Options</h2>
            <p className="text-gray-700">
              We strive to make healthcare affordable and accessible. This guide explains insurance coverage, payment methods, billing policies, and financial assistance.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Insurance</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-emerald-950 mb-2">Accepted Insurance Plans</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Blue Cross Blue Shield (all plans)</li>
                  <li>UnitedHealthcare (PPO, HMO, Medicare Advantage)</li>
                  <li>Aetna (PPO, HMO, Medicare Advantage)</li>
                  <li>Cigna (PPO, HMO)</li>
                  <li>Medicare (Original Medicare Parts A & B)</li>
                  <li>Medicaid (state-specific plans)</li>
                  <li>Humana (PPO, HMO, Medicare Advantage)</li>
                </ul>
              </div>
              
              <div className="bg-sand-50 rounded-lg p-6">
                <h3 className="font-semibold text-emerald-950 mb-2">Before Your Visit</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li><strong>Verify coverage:</strong> Contact your insurance to confirm we are in-network</li>
                  <li><strong>Know your benefits:</strong> Understand co-pays, deductibles, and co-insurance</li>
                  <li><strong>Obtain referrals:</strong> If required by your HMO plan</li>
                  <li><strong>Bring your card:</strong> We need to verify your coverage at each visit</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Payment Methods</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-6">
                <CreditCard className="h-8 w-8 text-emerald-700 mb-3" />
                <h3 className="font-semibold text-emerald-950 mb-2">Credit & Debit Cards</h3>
                <p className="text-gray-700">Visa, Mastercard, Discover, American Express</p>
              </div>
              
              <div className="border rounded-lg p-6">
                <Shield className="h-8 w-8 text-emerald-700 mb-3" />
                <h3 className="font-semibold text-emerald-950 mb-2">HSA/FSA Cards</h3>
                <p className="text-gray-700">Health Savings and Flexible Spending Accounts accepted</p>
              </div>
              
              <div className="border rounded-lg p-6">
                <DollarSign className="h-8 w-8 text-emerald-700 mb-3" />
                <h3 className="font-semibold text-emerald-950 mb-2">Cash & Checks</h3>
                <p className="text-gray-700">Personal checks (with valid ID) and cash payments</p>
              </div>
              
              <div className="border rounded-lg p-6">
                <CreditCard className="h-8 w-8 text-emerald-700 mb-3" />
                <h3 className="font-semibold text-emerald-950 mb-2">Payment Plans</h3>
                <p className="text-gray-700">Interest-free payment plans available for balances over $500</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Billing Policies</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-emerald-950 mb-2">Payment at Time of Service</h3>
                <p className="text-gray-700">Co-pays, deductibles, and self-pay balances are due at check-in. We'll provide an estimate before your appointment if possible.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-emerald-950 mb-2">Insurance Claims</h3>
                <p className="text-gray-700">We file claims on your behalf. You'll receive an Explanation of Benefits (EOB) from your insurance, followed by a bill for any remaining balance.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-emerald-950 mb-2">Billing Statements</h3>
                <p className="text-gray-700">Mailed monthly with a 30-day payment window. Past-due accounts may be sent to collections after 90 days.</p>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg p-6">
                <h3 className="font-semibold text-yellow-950 mb-2">Billing Questions or Disputes</h3>
                <p className="text-gray-700">Contact our billing department within 60 days if you believe there's an error. We'll investigate and resolve the issue promptly.</p>
                <p className="text-gray-700 mt-2">
                  <strong>Billing Department:</strong> billing@tfwellfare.com or (123) 456-7890 ext. 2
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Self-Pay Patients</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-emerald-950 mb-2">Uninsured or Out-of-Network</h3>
                <p className="text-gray-700">We offer discounted self-pay rates for patients without insurance or using out-of-network benefits. Payment is due at time of service.</p>
              </div>
              
              <div className="bg-sand-50 rounded-lg p-6">
                <h3 className="font-semibold text-emerald-950 mb-3">Typical Self-Pay Rates</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>New Patient Consultation:</strong> $250-350</li>
                  <li><strong>Follow-up Visit:</strong> $150-200</li>
                  <li><strong>Telehealth Visit:</strong> $100-150</li>
                  <li><strong>Lab Work:</strong> Varies by tests ordered (we use Quest Diagnostics)</li>
                </ul>
                <p className="text-gray-700 mt-3 text-sm italic">*Rates subject to change. Ask for an estimate when scheduling.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Financial Assistance</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-emerald-950 mb-2">Sliding Scale Program</h3>
                <p className="text-gray-700">Discounted rates based on household income and family size. Contact our financial counselor to apply.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-emerald-950 mb-2">Payment Plans</h3>
                <p className="text-gray-700">Interest-free payment plans available for balances over $500. Typical plans: 3, 6, or 12 months.</p>
              </div>
              
              <div className="bg-emerald-50 rounded-lg p-6">
                <h3 className="font-semibold text-emerald-950 mb-2">Contact Financial Counseling</h3>
                <p className="text-gray-700">
                  Our financial counselor can help you navigate insurance, apply for assistance programs, and set up payment plans.
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Financial Counselor:</strong> financial@tfwellfare.com or (123) 456-7890 ext. 4
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Cancellation & Refund Policy</h2>
            <p className="text-gray-700 mb-4">
              We require 24-hour notice for cancellations. Late cancellations (12-24 hours) incur a 50% fee. No-shows are charged the full appointment fee. For detailed information, see our <Link href="/legal/refund-policy" className="text-emerald-700 hover:underline">Refund Policy</Link>.
            </p>
          </section>

          <section className="bg-emerald-50 rounded-lg p-6">
            <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">Questions About Payment?</h2>
            <p className="text-gray-700 mb-6">
              Our billing and financial counseling teams are here to help answer questions and find solutions that work for you.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/resources/faqs">FAQs</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/book">Book Appointment</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
