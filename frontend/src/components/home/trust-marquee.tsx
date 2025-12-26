"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, Shield, CheckCircle, Star } from "lucide-react";

const certifications = [
  { icon: Award, label: "Board Certified Endocrinologist" },
  { icon: Shield, label: "HIPAA Compliant" },
  { icon: CheckCircle, label: "10,000+ Patients Treated" },
  { icon: Star, label: "4.9/5 Patient Rating" },
  { icon: Award, label: "American Board of Internal Medicine" },
  { icon: Shield, label: "Joint Commission Accredited" },
  { icon: CheckCircle, label: "Same-Day Appointments" },
  { icon: Star, label: "Top Rated Provider 2024" },
];

export function TrustMarquee() {
  return (
    <section className="py-6 bg-emerald-900 overflow-hidden">
      <div className="marquee-container">
        <motion.div 
          className="marquee-content"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Double the items for seamless loop */}
          {[...certifications, ...certifications].map((cert, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-8 text-white/90"
            >
              <cert.icon className="h-5 w-5 text-emerald-300 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium whitespace-nowrap">{cert.label}</span>
              <span className="text-emerald-500 mx-4">•</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Alternative compact version
export function TrustBar() {
  return (
    <section className="py-8 bg-sand-100 border-y border-sand-200">
      <div className="container-fluid">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {certifications.slice(0, 4).map((cert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center gap-2 text-emerald-800"
            >
              <cert.icon className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              <span className="text-sm font-medium">{cert.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
