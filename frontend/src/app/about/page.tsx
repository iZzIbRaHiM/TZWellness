import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Users,
  Target,
  Award,
  Clock,
  CheckCircle,
  Calendar,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | TZ Wellness - Lifestyle Medicine Center",
  description:
    "TZ Wellness is a dedicated lifestyle medicine center empowering you to reverse diabetes, heal fatty liver, and restore metabolic health naturally. Root-cause approach, evidence-based protocols, compassionate medical care. Your journey from disease to health starts here.",
};

const services = [
  "Comprehensive Diabetes Management",
  "Thyroid Disorder Treatment",
  "PCOS Care & Hormone Balance",
  "Obesity & Weight Management",
  "Metabolic Syndrome Treatment",
  "Prediabetes Prevention Programs",
  "Nutrition Assessment & Counseling",
  "Physical Activity Prescription",
  "Stress Management & Meditation",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="bg-sand-50 border-b border-sand-200">
        <div className="container-fluid py-4">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "About Us", href: "/about" },
            ]}
          />
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-sand-50 to-white py-20">
        <div className="container-fluid">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-display-md lg:text-display-lg text-emerald-950 mb-6">
              Reversing Diabetes • Healing Fatty Liver •{" "}
              <span className="italic text-emerald-600">Restoring Metabolic Health</span>
            </h1>
            <p className="text-xl text-emerald-700/80 leading-relaxed mb-8">
              Welcome to TZ Wellness, a dedicated lifestyle-medicine–based healing center for people who want real, lasting change in their health.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-20 bg-white">
        <div className="container-fluid">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-serif text-display-sm text-emerald-950 mb-6">
                Our Mission
              </h2>
              <div className="space-y-4 text-lg text-emerald-700/80 leading-relaxed">
                <p className="font-semibold text-emerald-900">
                  Our mission is simple: To help you reverse disease—not just manage it.
                </p>
                <p>
                  At TZ Wellness, we believe your body has an incredible ability to heal when given the right environment. Most chronic diseases—like diabetes, fatty liver, high blood pressure, obesity, and hormonal imbalances—are not caused by medicine deficiency. They are caused by lifestyle overload: excess sugar, excess stress, excess sitting, excess toxins, and excess burden on the liver.
                </p>
                <p className="font-semibold text-emerald-900">
                  The good news?
                </p>
                <p>
                  When the root causes are corrected, the body responds beautifully. Blood sugar drops. The liver heals. Weight normalizes. Energy returns. Confidence comes back.
                </p>
                <p>
                  This is the power of Lifestyle Medicine—a science-backed approach that uses food, movement, sleep, stress relief, and daily habits as therapeutic tools.
                </p>
              </div>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-elevated-md">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-100 flex items-center justify-center">
                <Users className="h-32 w-32 text-emerald-900/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-sand-50">
        <div className="container-fluid">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-display-sm text-emerald-950 mb-4">
              💙 Why TZ Wellness Exists
            </h2>
            <p className="text-lg text-emerald-700/80 mb-6">
              Most patients are told their chronic conditions are lifelong. But evidence now shows the opposite: Type 2 diabetes and fatty liver can be reversed in many people—naturally and safely.
            </p>
            <p className="text-lg text-emerald-700/80">
              TZ Wellness was created to bring this knowledge to you in a simple, practical way.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-elevated-sm transition-all duration-300">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-5">
                <Target className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-emerald-950 mb-3">
                Correct Scientific Guidance
              </h3>
              <p className="text-emerald-700/80 leading-relaxed">
                Evidence-based protocols proven to reverse insulin resistance and metabolic disease.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-elevated-sm transition-all duration-300">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-5">
                <Heart className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-emerald-950 mb-3">
                Personalized Plans
              </h3>
              <p className="text-emerald-700/80 leading-relaxed">
                Individualized nutrition and lifestyle plans according to your food choices and preferences.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-elevated-sm transition-all duration-300">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-5">
                <Users className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-emerald-950 mb-3">
                Coaching & Support
              </h3>
              <p className="text-emerald-700/80 leading-relaxed">
                We walk with you step-by-step until your body begins to heal.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-elevated-sm transition-all duration-300">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-5">
                <Award className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-emerald-950 mb-3">
                Medical Supervision
              </h3>
              <p className="text-emerald-700/80 leading-relaxed">
                Trained lifestyle & internal medicine experts guiding your healing journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 bg-white">
        <div className="container-fluid">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-display-sm text-emerald-950 mb-8 text-center">
              🌟 What Makes TZ Wellness Different
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="p-6 bg-emerald-50 rounded-xl">
                <h3 className="font-semibold text-lg text-emerald-950 mb-3">
                  Root-Cause Approach
                </h3>
                <p className="text-emerald-700/80">
                  Instead of symptom-based treatment, we address the underlying causes of disease for true healing.
                </p>
              </div>

              <div className="p-6 bg-emerald-50 rounded-xl">
                <h3 className="font-semibold text-lg text-emerald-950 mb-3">
                  Individualized Plans
                </h3>
                <p className="text-emerald-700/80">
                  Treatment plans tailored according to your unique food choices, lifestyle, and health goals.
                </p>
              </div>

              <div className="p-6 bg-emerald-50 rounded-xl">
                <h3 className="font-semibold text-lg text-emerald-950 mb-3">
                  Medication Reduction
                </h3>
                <p className="text-emerald-700/80">
                  As your body improves, we work to safely reduce or eliminate medications when possible.
                </p>
              </div>

              <div className="p-6 bg-emerald-50 rounded-xl">
                <h3 className="font-semibold text-lg text-emerald-950 mb-3">
                  Evidence-Based Protocols
                </h3>
                <p className="text-emerald-700/80">
                  Proven methods to reverse insulin resistance and restore metabolic health naturally.
                </p>
              </div>

              <div className="p-6 bg-emerald-50 rounded-xl">
                <h3 className="font-semibold text-lg text-emerald-950 mb-3">
                  Supportive Coaching
                </h3>
                <p className="text-emerald-700/80">
                  We make habits easier and sustainable through continuous support and guidance.
                </p>
              </div>

              <div className="p-6 bg-emerald-50 rounded-xl">
                <h3 className="font-semibold text-lg text-emerald-950 mb-3">
                  Complete Mind-Body Healing
                </h3>
                <p className="text-emerald-700/80">
                  Holistic approach for long-term results that transform how you feel, move, eat, sleep, and live.
                </p>
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-teal-50 via-emerald-50 to-emerald-100 rounded-2xl">
              <h3 className="font-serif text-2xl text-emerald-950 mb-4 text-center">
                Our goal is not just better lab results—it is a complete transformation in how you feel, move, eat, sleep, and live.
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Values & Foundation */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 via-sand-50 to-emerald-50">
        <div className="container-fluid">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-display-sm text-emerald-950 mb-12 text-center">
              Our Foundation
            </h2>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Brand Purpose */}
              <div className="bg-white p-8 rounded-2xl shadow-soft">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-emerald-950 mb-4">
                  Brand Purpose
                </h3>
                <p className="text-emerald-700/80 leading-relaxed">
                  To empower individuals to reverse and control diabetes and chronic diseases through evidence-based lifestyle medicine and compassionate medical care.
                </p>
              </div>

              {/* Brand Vision */}
              <div className="bg-white p-8 rounded-2xl shadow-soft">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-emerald-950 mb-4">
                  Brand Vision
                </h3>
                <p className="text-emerald-700/80 leading-relaxed">
                  To become the most trusted center for natural healing, prevention, and lifestyle transformation in the region.
                </p>
              </div>
            </div>

            {/* Brand Mission */}
            <div className="bg-white p-8 rounded-2xl shadow-soft mb-12">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-emerald-950 mb-4">
                Brand Mission
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-emerald-700/80">Provide accessible, science-backed lifestyle medicine</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-emerald-700/80">Help patients reduce medicines through health behavior change</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-emerald-700/80">Improve immunity, energy, and mental peace</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-emerald-700/80">Offer personalized consultation both in-clinic and online</span>
                </div>
              </div>
            </div>

            {/* Brand Values */}
            <div className="bg-white p-8 rounded-2xl shadow-soft mb-12">
              <h3 className="font-serif text-2xl font-semibold text-emerald-950 mb-6 text-center">
                Brand Values
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {["Compassion", "Trust", "Natural Healing", "Simplicity", "Scientific Excellence", "Patient Empowerment"].map((value) => (
                  <div key={value} className="text-center p-4 bg-emerald-50 rounded-xl">
                    <p className="font-semibold text-emerald-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Personality */}
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 p-8 rounded-2xl shadow-soft text-white">
              <h3 className="font-serif text-2xl font-semibold mb-6 text-center">
                Brand Personality
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {["Warm", "Hopeful", "Knowledgeable", "Supportive", "Easy to understand", "Family-friendly"].map((trait) => (
                  <span key={trait} className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conditions We Treat */}
      <section className="py-20 bg-sand-50">
        <div className="container-fluid">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-display-sm text-emerald-950 mb-8 text-center">
              🌱 Healing Is a Journey—We Guide You Through It
            </h2>

            <div className="bg-white p-10 rounded-2xl shadow-elevated-sm">
              <p className="text-center text-lg text-emerald-700/80 mb-10 leading-relaxed">
                Whether you are struggling with high sugars, fatty liver, stubborn weight, hormonal issues, fatigue, or digestive problems, we empower you with the knowledge and tools to take control of your health again.
              </p>

              <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mb-10">
                {services.map((service, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                    <span className="text-emerald-900">{service}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-sand-200">
                <p className="text-center text-lg text-emerald-700/80 mb-6 leading-relaxed">
                  Your journey with TZ Wellness is more than a program. It is a new beginning—a shift from fear to confidence, from dependency to freedom, from disease to health.
                </p>
                <div className="flex justify-center">
                  <Button asChild size="lg" variant="cta">
                    <Link href="/appointments">
                      <Calendar className="mr-2 h-5 w-5" />
                      Schedule Your Consultation
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900">
        <div className="container-fluid">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="font-serif text-display-sm lg:text-display-md mb-6">
              🩺 Welcome to a New Way of Healing
            </h2>
            <p className="text-xl text-emerald-100/90 mb-10 leading-relaxed">
              We are honored to be part of your transformation. Let this be your first step toward a lighter body, a clearer mind, a healthier future—and a life you love living.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="xl" variant="secondary">
                <Link href="/appointments">Book Consultation</Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/services">Explore Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
