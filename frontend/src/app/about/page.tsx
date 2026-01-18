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
  title: "About Us",
  description:
    "Learn about TZ Wellness Health - Nurturing our health through comprehensive metabolic and chronic disease management. We focus on diabetes, thyroid, PCOS, and obesity care with personalized treatment plans.",
};

const values = [
  {
    icon: Heart,
    title: "Patient-Centered Care",
    description:
      "We prioritize your unique health journey, providing personalized care that addresses your specific needs and goals.",
  },
  {
    icon: Target,
    title: "Holistic Approach",
    description:
      "We treat the whole person - addressing physical, nutritional, and lifestyle factors for comprehensive health improvements.",
  },
  {
    icon: Award,
    title: "Evidence-Based Medicine",
    description:
      "Our treatments combine the latest medical research with proven lifestyle medicine principles for optimal outcomes.",
  },
  {
    icon: Clock,
    title: "Convenient Access",
    description:
      "Flexible scheduling with both telehealth and in-person visits to fit your busy lifestyle and preferences.",
  },
];

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
              Nurturing Our Health,{" "}
              <span className="italic text-emerald-600">Healing From Within</span>
            </h1>
            <p className="text-xl text-emerald-700/80 leading-relaxed mb-8">
              At TZ Wellness Health, we specialize in comprehensive management of
              chronic metabolic conditions through personalized care, lifestyle
              medicine, and evidence-based treatments.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-emerald-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>10,000+ Patients Treated</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>15+ Years Experience</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>98% Satisfaction Rate</span>
              </div>
            </div>
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
                <p>
                  We are dedicated to helping individuals overcome chronic health
                  conditions through a comprehensive, lifestyle-focused approach
                  that emphasizes <strong>prevention, treatment, and reversal</strong> of
                  metabolic diseases.
                </p>
                <p>
                  Our clinic specializes in managing diabetes, thyroid disorders,
                  PCOS, obesity, and other metabolic health conditions. We believe
                  in empowering our patients with the knowledge, tools, and
                  personalized support needed to achieve lasting health
                  improvements.
                </p>
                <p>
                  By combining conventional medical treatment with nutrition
                  counseling, physical activity prescription, and stress management
                  techniques, we address the root causes of chronic disease - not
                  just the symptoms.
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
              What Sets Us Apart
            </h2>
            <p className="text-lg text-emerald-700/80">
              Our commitment to comprehensive, patient-centered care guides
              everything we do.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-elevated-sm transition-all duration-300"
              >
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-5">
                  <value.icon className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-emerald-950 mb-3">
                  {value.title}
                </h3>
                <p className="text-emerald-700/80 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 bg-white">
        <div className="container-fluid">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-display-sm text-emerald-950 mb-8 text-center">
              Our Comprehensive Approach
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="p-6 bg-emerald-50 rounded-xl">
                <h3 className="font-semibold text-lg text-emerald-950 mb-3">
                  Focused Personalized Care
                </h3>
                <p className="text-emerald-700/80">
                  Every patient receives individualized attention with treatment
                  plans tailored to their unique health profile, goals, and
                  lifestyle.
                </p>
              </div>

              <div className="p-6 bg-emerald-50 rounded-xl">
                <h3 className="font-semibold text-lg text-emerald-950 mb-3">
                  Nutrition Assessment & Counseling
                </h3>
                <p className="text-emerald-700/80">
                  Comprehensive dietary evaluation and personalized meal planning
                  to optimize metabolic health and support your treatment goals.
                </p>
              </div>

              <div className="p-6 bg-emerald-50 rounded-xl">
                <h3 className="font-semibold text-lg text-emerald-950 mb-3">
                  Physical Activity Prescription
                </h3>
                <p className="text-emerald-700/80">
                  Customized exercise plans designed to improve metabolic function,
                  manage weight, and enhance overall wellbeing.
                </p>
              </div>

              <div className="p-6 bg-emerald-50 rounded-xl">
                <h3 className="font-semibold text-lg text-emerald-950 mb-3">
                  Meditation & Stress Management
                </h3>
                <p className="text-emerald-700/80">
                  Instruction in relaxation techniques and mindfulness practices to
                  manage stress and support your healing journey.
                </p>
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-teal-50 via-emerald-50 to-emerald-100 rounded-2xl">
              <h3 className="font-serif text-2xl text-emerald-950 mb-4">
                Integrating Conventional Medicine When Needed
              </h3>
              <p className="text-emerald-700/80 leading-relaxed">
                While we emphasize lifestyle interventions, we recognize that
                conventional medical treatment plays an important role. We
                seamlessly integrate medications, lab monitoring, and specialist
                referrals when appropriate to ensure comprehensive care that
                addresses all aspects of your health.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Conditions We Treat */}
      <section className="py-20 bg-sand-50">
        <div className="container-fluid">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-display-sm text-emerald-950 mb-8 text-center">
              Conditions We Specialize In
            </h2>

            <div className="bg-white p-10 rounded-2xl shadow-elevated-sm">
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                    <span className="text-emerald-900">{service}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-sand-200">
                <p className="text-center text-emerald-700/80 mb-6">
                  Whether you're newly diagnosed or seeking better management of a
                  chronic condition, we're here to support your journey to optimal
                  health.
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
              Ready to Transform Your Health?
            </h2>
            <p className="text-xl text-emerald-100/90 mb-10 leading-relaxed">
              Take the first step toward better metabolic health. Our team is ready
              to create a personalized care plan that works for you.
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
