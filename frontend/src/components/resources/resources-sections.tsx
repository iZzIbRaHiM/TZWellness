"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileText,
  Download,
  CreditCard,
  Video,
  ClipboardList,
  HeartPulse,
  CheckCircle,
  Phone,
  Calendar,
} from "lucide-react";
import { FAQSchema } from "@/components/seo/schemas";

// Downloadable resources
const downloads = [
  {
    id: 1,
    title: "New Patient Intake Form",
    description:
      "Complete this form before your first visit to speed up check-in.",
    category: "Forms",
    fileType: "PDF",
    fileSize: "245 KB",
    icon: ClipboardList,
  },
  {
    id: 2,
    title: "Diabetes Management Guide",
    description:
      "A comprehensive guide to understanding and managing diabetes daily.",
    category: "Guides",
    fileType: "PDF",
    fileSize: "1.2 MB",
    icon: HeartPulse,
  },
  {
    id: 3,
    title: "Healthy Eating Meal Planner",
    description: "Weekly meal planning template with diabetes-friendly recipes.",
    category: "Guides",
    fileType: "PDF",
    fileSize: "890 KB",
    icon: FileText,
  },
  {
    id: 4,
    title: "Blood Sugar Log",
    description: "Printable log to track your blood sugar readings daily.",
    category: "Forms",
    fileType: "PDF",
    fileSize: "125 KB",
    icon: ClipboardList,
  },
  {
    id: 5,
    title: "Medication Tracker",
    description: "Keep track of all your medications, dosages, and schedules.",
    category: "Forms",
    fileType: "PDF",
    fileSize: "180 KB",
    icon: ClipboardList,
  },
  {
    id: 6,
    title: "Thyroid Health Guide",
    description:
      "Everything you need to know about thyroid conditions and treatment.",
    category: "Guides",
    fileType: "PDF",
    fileSize: "1.5 MB",
    icon: HeartPulse,
  },
];

// Payment FAQs
const paymentFAQs = [
  {
    question: "Do you offer payment plans?",
    answer:
      "Yes, we offer interest-free payment plans for larger treatment costs. Our billing team will work with you to create a plan that fits your budget.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept cash, checks, and all major credit cards (Visa, MasterCard, American Express, Discover). We also accept HSA and FSA cards.",
  },
  {
    question: "What is your cancellation policy?",
    answer:
      "We require 24 hours notice for appointment cancellations. Late cancellations or no-shows may be subject to a $50 fee. We understand emergencies happen and will work with you on a case-by-case basis.",
  },
  {
    question: "What are your consultation fees?",
    answer:
      "Consultation fees vary depending on the type of service. Contact our billing department for detailed pricing information and available payment options.",
  },
];

// Telehealth preparation tips
const telehealthTips = [
  {
    title: "Test Your Technology",
    description:
      "Ensure your device (computer, tablet, or smartphone) has a working camera, microphone, and stable internet connection.",
  },
  {
    title: "Find a Quiet, Private Space",
    description:
      "Choose a well-lit room where you can speak openly without interruptions or background noise.",
  },
  {
    title: "Prepare Your Information",
    description:
      "Have your medication list, recent health data (blood sugar logs, blood pressure readings), and any questions written down.",
  },
  {
    title: "Log In Early",
    description:
      "Join the virtual waiting room 5-10 minutes before your appointment to troubleshoot any technical issues.",
  },
  {
    title: "Have Your ID Ready",
    description:
      "Keep your photo ID handy for verification if needed.",
  },
  {
    title: "Know Your Vitals",
    description:
      "If possible, take your blood pressure, temperature, and weight before the appointment to share with your provider.",
  },
];

export function ResourcesSections() {
  return (
    <div className="space-y-16">
      <FAQSchema faqs={paymentFAQs} />

      {/* Downloads Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        id="downloads"
      >
        <div className="flex items-center gap-3 mb-6">
          <Download className="h-8 w-8 text-emerald-600" />
          <h2 className="font-serif text-2xl font-bold text-emerald-950">
            Downloadable Resources
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {downloads.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="interactive" className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <resource.icon className="h-8 w-8 text-emerald-600" />
                    <Badge variant="secondary">{resource.category}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-3">{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {resource.fileType} • {resource.fileSize}
                    </span>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Payment Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        id="payment"
      >
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="h-8 w-8 text-emerald-600" />
          <h2 className="font-serif text-2xl font-bold text-emerald-950">
            Payment Information
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* FAQ Accordion */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Common questions about payment options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {paymentFAQs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Quick Contact Card */}
          <div className="space-y-4">
            <Card className="bg-emerald-50 border-emerald-100">
              <CardHeader>
                <CardTitle className="text-lg">Billing Questions?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Our billing team is here to help you understand your costs and
                  options.
                </p>
                <div className="flex flex-col gap-3">
                  <Button variant="outline" className="justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Billing: (555) 123-4567
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Mon - Fri: 8am - 5pm
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-terracotta/10 border-terracotta/20">
              <CardHeader>
                <CardTitle className="text-lg">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    "Visa",
                    "MasterCard",
                    "American Express",
                    "Discover",
                    "Cash",
                    "Check",
                    "HSA Cards",
                    "FSA Cards",
                  ].map((method) => (
                    <div key={method} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span>{method}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.section>

      {/* Telehealth Prep Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        id="telehealth"
      >
        <div className="flex items-center gap-3 mb-6">
          <Video className="h-8 w-8 text-emerald-600" />
          <h2 className="font-serif text-2xl font-bold text-emerald-950">
            Telehealth Preparation Guide
          </h2>
        </div>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Get Ready for Your Virtual Visit</CardTitle>
            <CardDescription>
              Follow these tips to ensure a smooth telehealth appointment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {telehealthTips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-950 mb-1">
                      {tip.title}
                    </h4>
                    <p className="text-sm text-gray-600">{tip.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-emerald-50 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-emerald-900">
                  Need Technical Help?
                </h4>
                <p className="text-sm text-emerald-700">
                  Our team can help you test your setup before your appointment
                </p>
              </div>
              <Button variant="default">
                <Phone className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-emerald-900 rounded-xl p-8 text-white text-center"
      >
        <h2 className="font-serif text-2xl font-bold mb-4">
          Ready to Book Your Appointment?
        </h2>
        <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
          Now that you're prepared, take the next step toward better health.
          Schedule your consultation today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="cta" size="lg">
            <Link href="/book">Book Appointment</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white/10"
          >
            <a href="tel:+1234567890">Call Us</a>
          </Button>
        </div>
      </motion.section>
    </div>
  );
}
