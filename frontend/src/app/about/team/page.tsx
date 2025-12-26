import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Linkedin, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Team | TF Wellfare Medical Clinic",
  description: "Meet the experienced healthcare professionals at TF Wellfare Medical Clinic dedicated to your metabolic health and wellness.",
  openGraph: {
    title: "Our Team | TF Wellfare Medical Clinic",
    description: "Expert healthcare team specializing in diabetes, thyroid care, PCOS, and metabolic health.",
  },
};

const teamMembers = [
  {
    name: "Dr. Sarah Thompson",
    role: "Medical Director & Endocrinologist",
    credentials: "MD, FACE, CDE",
    specialties: ["Diabetes Management", "Thyroid Disorders", "Metabolic Health"],
    bio: "Dr. Thompson has over 15 years of experience in endocrinology and metabolic medicine. She is board-certified and fellowship-trained in endocrinology, with a special focus on diabetes care and thyroid health. Her patient-centered approach combines evidence-based medicine with holistic lifestyle interventions.",
    email: "dr.thompson@tfwellfare.com",
    linkedin: "#"
  },
  {
    name: "Dr. Michael Chen",
    role: "Obesity Medicine Specialist",
    credentials: "MD, ABOM",
    specialties: ["Weight Management", "Metabolic Syndrome", "Nutritional Medicine"],
    bio: "Dr. Chen is a board-certified obesity medicine physician with expertise in comprehensive weight management and metabolic health optimization. He takes a compassionate, science-based approach to helping patients achieve sustainable health improvements through personalized treatment plans.",
    email: "dr.chen@tfwellfare.com",
    linkedin: "#"
  },
  {
    name: "Dr. Emily Rodriguez",
    role: "Reproductive Endocrinologist",
    credentials: "MD, FACOG",
    specialties: ["PCOS", "Hormonal Balance", "Women's Health"],
    bio: "Dr. Rodriguez specializes in reproductive endocrinology with a focus on PCOS and hormonal health. She has published extensively on PCOS management and is passionate about empowering women to take control of their metabolic and reproductive health through integrated care.",
    email: "dr.rodriguez@tfwellfare.com",
    linkedin: "#"
  },
  {
    name: "Jennifer Martinez, RN, CDE",
    role: "Certified Diabetes Educator",
    credentials: "RN, BSN, CDE",
    specialties: ["Diabetes Education", "CGM Support", "Lifestyle Coaching"],
    bio: "Jennifer is a registered nurse and certified diabetes educator with a passion for patient education and empowerment. She specializes in continuous glucose monitoring support and works closely with patients to develop practical, sustainable strategies for diabetes management.",
    email: "j.martinez@tfwellfare.com",
    linkedin: "#"
  },
  {
    name: "David Park, RD, LDN",
    role: "Clinical Nutritionist",
    credentials: "MS, RD, LDN, CDCES",
    specialties: ["Medical Nutrition Therapy", "Meal Planning", "Metabolic Nutrition"],
    bio: "David is a registered dietitian specializing in medical nutrition therapy for metabolic conditions. He creates personalized nutrition plans that align with medical treatments while being practical and enjoyable for patients to follow long-term.",
    email: "d.park@tfwellfare.com",
    linkedin: "#"
  },
  {
    name: "Lisa Anderson, NP",
    role: "Nurse Practitioner",
    credentials: "MSN, FNP-C, BC-ADM",
    specialties: ["Primary Care", "Chronic Disease Management", "Preventive Medicine"],
    bio: "Lisa is a board-certified family nurse practitioner with advanced certification in diabetes management. She provides comprehensive primary care with a focus on prevention and chronic disease management in patients with metabolic conditions.",
    email: "l.anderson@tfwellfare.com",
    linkedin: "#"
  }
];

export default function TeamPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-sand-50 to-white py-20 lg:py-32">
        <div className="container-fluid">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-4xl lg:text-6xl font-bold text-emerald-950 mb-6">
              Meet Our Expert Team
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              A dedicated team of board-certified physicians, nurses, and healthcare professionals 
              committed to transforming your metabolic health and overall wellness.
            </p>
            <Button asChild size="lg">
              <Link href="/book">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Consultation
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Team Members Grid */}
      <section className="py-20">
        <div className="container-fluid">
          <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-br from-emerald-50 to-sand-50 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-full bg-emerald-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-serif font-bold text-2xl">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-2xl font-bold text-emerald-950 mb-1">
                        {member.name}
                      </h3>
                      <p className="text-emerald-700 font-medium mb-2">
                        {member.role}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        {member.credentials}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {member.specialties.map((specialty, idx) => (
                          <Badge key={idx} className="bg-emerald-100 text-emerald-800 border-0">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {member.bio}
                  </p>
                  <div className="flex items-center gap-4 pt-4 border-t">
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-900 transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </a>
                    <a
                      href={member.linkedin}
                      className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-900 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span>LinkedIn</span>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Credentials Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-sand-50">
        <div className="container-fluid">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-emerald-950 mb-6">
              Board-Certified Excellence
            </h2>
            <p className="text-lg text-gray-700 mb-12">
              Our team holds certifications from leading medical boards and professional organizations, 
              ensuring you receive the highest standard of care.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                "American Board of Internal Medicine",
                "American Association of Clinical Endocrinology",
                "American Board of Obesity Medicine",
                "Certification Board for Diabetes Care"
              ].map((cert, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-emerald-700 font-bold text-xl">✓</span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{cert}</p>
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
              Experience Expert Care Today
            </h2>
            <p className="text-xl text-emerald-100 mb-8">
              Our team is ready to help you achieve your health goals. Schedule your consultation 
              and start your journey to better metabolic health.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50">
                <Link href="/book">
                  Book Appointment
                  <Calendar className="ml-2 h-5 w-5" />
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
