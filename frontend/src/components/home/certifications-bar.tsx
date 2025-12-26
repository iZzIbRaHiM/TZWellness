"use client";

import React from "react";
import { motion } from "framer-motion";

const certifications = [
  {
    name: "American Board of Internal Medicine",
    abbreviation: "ABIM",
  },
  {
    name: "American Association of Clinical Endocrinologists",
    abbreviation: "AACE",
  },
  {
    name: "American Diabetes Association",
    abbreviation: "ADA",
  },
  {
    name: "Obesity Medicine Association",
    abbreviation: "OMA",
  },
  {
    name: "Institute for Functional Medicine",
    abbreviation: "IFM",
  },
  {
    name: "HIPAA Compliant",
    abbreviation: "HIPAA",
  },
];

export function CertificationsBar() {
  return (
    <section className="py-8 bg-emerald-900" aria-label="Certifications">
      <div className="container-fluid">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.abbreviation}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
            >
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="font-bold text-xs">{cert.abbreviation}</span>
              </div>
              <span className="text-sm hidden sm:inline">{cert.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
