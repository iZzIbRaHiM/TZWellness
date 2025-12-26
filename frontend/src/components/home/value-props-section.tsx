"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Brain,
  Shield,
  Clock,
  Users,
  Sparkles,
} from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Holistic Approach",
    description:
      "We treat the whole person, not just symptoms. Our integrated care addresses physical, mental, and lifestyle factors.",
  },
  {
    icon: Brain,
    title: "Evidence-Based Care",
    description:
      "Our treatments are backed by the latest medical research and proven protocols for optimal outcomes.",
  },
  {
    icon: Shield,
    title: "Safe & Natural",
    description:
      "We prioritize natural interventions and minimize medication dependency whenever possible.",
  },
  {
    icon: Clock,
    title: "Convenient Access",
    description:
      "Flexible scheduling with virtual and in-person options to fit your busy lifestyle.",
  },
  {
    icon: Users,
    title: "Personalized Plans",
    description:
      "Every treatment plan is tailored to your unique health profile, goals, and preferences.",
  },
  {
    icon: Sparkles,
    title: "Lasting Results",
    description:
      "Our focus on sustainable changes leads to long-term health improvements, not quick fixes.",
  },
];

export function ValuePropsSection() {
  return (
    <section className="py-24 bg-white" aria-labelledby="values-heading">
      <div className="container-fluid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2
            id="values-heading"
            className="font-serif text-display-sm sm:text-display-md text-emerald-950 mb-4"
          >
            Why Patients Choose{" "}
            <span className="italic text-terracotta">TF Wellfare</span>
          </h2>
          <p className="text-lg text-emerald-700/80">
            We combine medical expertise with a compassionate, patient-centered
            approach to help you achieve your health goals.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-8 rounded-2xl bg-sand-100/50 hover:bg-white hover:shadow-elevated-sm transition-all duration-300 ease-smooth border border-transparent hover:border-sand-200"
            >
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 3 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-14 h-14 bg-emerald-100 group-hover:bg-emerald-900 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300"
              >
                <value.icon
                  className="h-7 w-7 text-emerald-600 group-hover:text-white transition-colors duration-300"
                  aria-hidden="true"
                />
              </motion.div>
              <h3 className="font-serif text-xl font-semibold text-emerald-950 mb-3">
                {value.title}
              </h3>
              <p className="text-emerald-700/80 leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
