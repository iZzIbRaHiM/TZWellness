"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Phone, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section
      className="py-24 lg:py-32 bg-emerald-900 relative overflow-hidden"
      aria-labelledby="cta-heading"
    >
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-700 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-terracotta/30 rounded-full blur-3xl" 
        />
      </div>

      <div className="container-fluid relative">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-emerald-100 text-sm font-medium mb-8 border border-white/10"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>Same-Day Appointments Available</span>
            </motion.div>

            <h2
              id="cta-heading"
              className="font-serif text-display-sm sm:text-display-md lg:text-display-lg text-white mb-6"
            >
              Ready to <span className="italic text-terracotta-300">Transform</span> Your Health?
            </h2>
            <p className="text-lg text-emerald-100/90 mb-10 max-w-xl mx-auto leading-relaxed">
              Start your journey to better health today. Book a personalized
              consultation and discover how our holistic approach can transform
              your wellbeing.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="cta" size="xl" className="shadow-elevated-lg">
                <Link href="/book">
                  <Calendar className="mr-2 h-5 w-5" aria-hidden="true" />
                  Book Your Consultation
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                className="bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white hover:bg-white hover:text-emerald-900 transition-all duration-300"
              >
                <a href="tel:+1234567890">
                  <Phone className="mr-2 h-5 w-5" aria-hidden="true" />
                  Call (123) 456-7890
                </a>
              </Button>
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mt-10 text-emerald-200/70 text-sm"
            >
              Or{" "}
              <Link
                href="/services"
                className="text-emerald-100 underline underline-offset-4 hover:text-white transition-colors duration-200 inline-flex items-center"
              >
                explore our services
                <ArrowRight className="inline ml-1 h-3 w-3" />
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
