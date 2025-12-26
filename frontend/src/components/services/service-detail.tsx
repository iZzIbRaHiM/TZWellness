"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle,
  ArrowRight,
  Phone,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ServiceDetailProps {
  service: {
    title: string;
    slug: string;
    short_description: string;
    description: string;
    symptoms: string;
    approach: string;
    what_to_expect: string;
    icon: string;
    duration_minutes: number;
    price: number;
    modality: string;
    faqs: { question: string; answer: string }[];
  };
}

export function ServiceDetail({ service }: ServiceDetailProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="text-6xl mb-6">{service.icon}</div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-emerald-950 mb-4">
          {service.title}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
          {service.short_description}
        </p>

        {/* Quick info */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Badge variant="secondary" className="text-sm py-2 px-4">
            <Clock className="h-4 w-4 mr-2" />
            {service.duration_minutes} minutes
          </Badge>
          <Badge variant="secondary" className="text-sm py-2 px-4">
            {formatPrice(service.price)} / session
          </Badge>
          {service.modality === "both" && (
            <>
              <Badge variant="secondary" className="text-sm py-2 px-4">
                <Video className="h-4 w-4 mr-2" />
                Virtual Available
              </Badge>
              <Badge variant="secondary" className="text-sm py-2 px-4">
                <MapPin className="h-4 w-4 mr-2" />
                In-Person Available
              </Badge>
            </>
          )}
        </div>
      </motion.div>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
      >
        <Button asChild variant="cta" size="xl">
          <Link href={`/book?service=${service.slug}`}>
            <Calendar className="mr-2 h-5 w-5" />
            Book This Service
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="xl"
          className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
        >
          <a href="tel:+1234567890">
            <Phone className="mr-2 h-5 w-5" />
            Call to Discuss
          </a>
        </Button>
      </motion.div>

      {/* Content sections */}
      <div className="space-y-12">
        {/* Description */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-8 shadow-sm border"
        >
          <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">
            About This Service
          </h2>
          <div className="prose prose-emerald max-w-none">
            {service.description.split("\n").map((para, i) => (
              <p key={i} className="text-gray-700">
                {para}
              </p>
            ))}
          </div>
        </motion.section>

        {/* Symptoms */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-8 shadow-sm border"
        >
          <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">
            Common Symptoms We Address
          </h2>
          <ul className="grid md:grid-cols-2 gap-3">
            {service.symptoms
              .split("\n")
              .filter((s) => s.trim().startsWith("-"))
              .map((symptom, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-terracotta shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    {symptom.replace("-", "").trim()}
                  </span>
                </li>
              ))}
          </ul>
        </motion.section>

        {/* Approach */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-emerald-50 rounded-xl p-8 border border-emerald-100"
        >
          <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">
            Our Approach
          </h2>
          <div className="prose prose-emerald max-w-none">
            {service.approach.split("\n").map((para, i) => (
              <p key={i} className="text-gray-700">
                {para.replace(/\*\*/g, "")}
              </p>
            ))}
          </div>
        </motion.section>

        {/* What to expect */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-8 shadow-sm border"
        >
          <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-4">
            What to Expect
          </h2>
          <div className="prose prose-emerald max-w-none">
            {service.what_to_expect.split("\n").map((para, i) => (
              <p key={i} className="text-gray-700">
                {para.replace(/\*\*/g, "")}
              </p>
            ))}
          </div>
        </motion.section>

        {/* FAQs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-8 shadow-sm border"
        >
          <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-6">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {service.faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-medium text-gray-900">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.section>

        {/* Final CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-emerald-900 rounded-xl p-8 text-center text-white"
        >
          <h2 className="font-serif text-2xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-emerald-100 mb-6">
            Take the first step toward better health today. Book your consultation
            and let us help you achieve your wellness goals.
          </p>
          <Button asChild variant="cta" size="xl">
            <Link href="/book">
              <Calendar className="mr-2 h-5 w-5" />
              Book Your Consultation
            </Link>
          </Button>
        </motion.section>
      </div>
    </div>
  );
}
