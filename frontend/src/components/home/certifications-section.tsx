"use client";

import Image from "next/image";
import { Award } from "lucide-react";

const certifications = [
  {
    name: "PALM",
    fullName: "Pakistan Association of Lifestyle Medicine",
    logo: "/images/certifications/Palmm.png",
    description: "Certified by Pakistan's leading lifestyle medicine organization",
  },
  {
    name: "IBLM",
    fullName: "International Board of Lifestyle Medicine",
    logo: "/images/certifications/IBLM-logo.png",
    description: "Internationally recognized lifestyle medicine certification",
  },
];

export function CertificationsSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
            <Award className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Certified Excellence
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Recognized by leading lifestyle medicine organizations for our commitment to
            evidence-based care and professional standards
          </p>
        </div>

        {/* Certifications Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {certifications.map((cert) => (
            <div
              key={cert.name}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-emerald-200"
            >
              {/* Logo Container */}
              <div className="relative w-full h-40 mb-6 flex items-center justify-center">
                <div className="relative w-32 h-32 group-hover:scale-110 transition-transform duration-300">
                  <Image
                    src={cert.logo}
                    alt={`${cert.fullName} Logo`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 128px"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {cert.name}
                </h3>
                <p className="text-sm font-semibold text-emerald-600 mb-3">
                  {cert.fullName}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {cert.description}
                </p>
              </div>

              {/* Decorative Element */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Award className="w-4 h-4 mr-2 text-emerald-500" />
                  <span>Certified Professional</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Trust Badge */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 italic">
            Your health journey guided by internationally certified lifestyle medicine experts
          </p>
        </div>
      </div>
    </section>
  );
}
