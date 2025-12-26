import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Target, Award, Calendar, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | TF Wellfare Medical Clinic",
  description: "Learn about TF Wellfare Medical Clinic's mission to provide holistic healthcare focused on metabolic health, diabetes management, and sustainable wellness solutions.",
  openGraph: {
    title: "About Us | TF Wellfare Medical Clinic",
    description: "Expert holistic healthcare team dedicated to your metabolic health and wellness journey.",
  },
};

const values = [
  {
    icon: Heart,
    title: "Patient-Centered Care",
    description: "We put your health, comfort, and wellness goals at the center of everything we do."
  },
  {
    icon: Target,
    title: "Evidence-Based Treatment",
    description: "Our approaches are grounded in the latest medical research and proven therapeutic methods."
  },
  {
    icon: Users,
    title: "Collaborative Approach",
    description: "We work with you as partners in your health journey, empowering you with knowledge and support."
  },
  {
    icon: Award,
    title: "Excellence in Care",
    description: "We maintain the highest standards of medical practice and continuously improve our services."
  }
];

const stats = [
  { value: "10+", label: "Years of Experience" },
  { value: "5,000+", label: "Patients Treated" },
  { value: "95%", label: "Patient Satisfaction" },
  { value: "24/7", label: "Support Available" }
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-sand-50 to-white py-20 lg:py-32">
        <div className="container-fluid">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-4xl lg:text-6xl font-bold text-emerald-950 mb-6">
              About TF Wellfare Medical Clinic
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Dedicated to transforming lives through holistic healthcare, specialized metabolic treatments, 
              and compassionate patient care since 2015.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/book">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Appointment
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/about/team">
                  <Users className="mr-2 h-5 w-5" />
                  Meet Our Team
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-emerald-900 text-white">
        <div className="container-fluid">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-serif text-4xl lg:text-5xl font-bold mb-2 text-emerald-300">
                  {stat.value}
                </div>
                <div className="text-emerald-100 text-sm lg:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 lg:py-32">
        <div className="container-fluid">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-emerald-950 mb-6">
                Our Mission
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                To empower individuals to achieve optimal health through comprehensive, 
                evidence-based metabolic care, personalized treatment plans, and 
                ongoing support that addresses the root causes of chronic health conditions.
              </p>
            </div>

            <div className="bg-sand-50 rounded-2xl p-8 lg:p-12">
              <h3 className="font-serif text-2xl font-bold text-emerald-950 mb-6">
                Why Choose TF Wellfare?
              </h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  At TF Wellfare Medical Clinic, we understand that metabolic health conditions like 
                  diabetes, thyroid disorders, PCOS, and obesity require more than just medication. 
                  They need a comprehensive, personalized approach that considers your unique biology, 
                  lifestyle, and health goals.
                </p>
                <p>
                  Our team of experienced healthcare professionals combines cutting-edge medical 
                  knowledge with holistic treatment modalities to help you not just manage symptoms, 
                  but truly thrive. We believe in treating the whole person, not just the condition.
                </p>
                <p>
                  Whether you're newly diagnosed or have been managing a chronic condition for years, 
                  we're here to provide the expert guidance, advanced treatments, and compassionate 
                  support you need to reclaim your health and vitality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-sand-50">
        <div className="container-fluid">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-emerald-950 mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              These principles guide every decision we make and every interaction we have with our patients.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                    <value.icon className="h-6 w-6 text-emerald-700" />
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Specializations Section */}
      <section className="py-20 lg:py-32">
        <div className="container-fluid">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-emerald-950 mb-12 text-center">
              Our Specializations
            </h2>
            
            <div className="grid gap-6">
              {[
                {
                  title: "Diabetes Management",
                  description: "Comprehensive care for Type 1, Type 2, and prediabetes with personalized treatment plans, continuous glucose monitoring support, and lifestyle coaching."
                },
                {
                  title: "Thyroid Health",
                  description: "Expert diagnosis and treatment of hypothyroidism, hyperthyroidism, Hashimoto's, and other thyroid conditions with advanced testing and hormone optimization."
                },
                {
                  title: "PCOS Treatment",
                  description: "Holistic care for Polycystic Ovary Syndrome addressing hormonal balance, metabolic health, fertility concerns, and symptom management."
                },
                {
                  title: "Weight & Metabolic Health",
                  description: "Evidence-based weight management programs focusing on sustainable lifestyle changes, metabolic optimization, and long-term health improvements."
                }
              ].map((spec, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border-l-4 border-emerald-600">
                  <h3 className="font-semibold text-xl text-emerald-950 mb-3">{spec.title}</h3>
                  <p className="text-gray-600">{spec.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-900 text-white">
        <div className="container-fluid">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-6">
              Ready to Start Your Health Journey?
            </h2>
            <p className="text-xl text-emerald-100 mb-8">
              Schedule your consultation today and take the first step towards optimal metabolic health.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50">
                <Link href="/book">
                  Book Appointment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-emerald-800">
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
