"use client";

import React from "react";
import { motion } from "framer-motion";
import { useBookingStore, PatientType } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { UserPlus, RotateCcw, Phone, ArrowRight } from "lucide-react";

const patientTypes: {
  type: PatientType;
  title: string;
  description: string;
  icon: React.ElementType;
  duration: string;
}[] = [
  {
    type: "new",
    title: "New Patient",
    description:
      "First time visiting TF Wellfare? Start here for a comprehensive initial consultation.",
    icon: UserPlus,
    duration: "60 minutes",
  },
  {
    type: "returning",
    title: "Returning Patient",
    description:
      "Already a patient? Book a follow-up appointment to continue your care journey.",
    icon: RotateCcw,
    duration: "30 minutes",
  },
  {
    type: "discovery",
    title: "Discovery Call",
    description:
      "Not sure if we're the right fit? Schedule a free 15-minute call to discuss your needs.",
    icon: Phone,
    duration: "15 minutes",
  },
];

export function StepIdentity() {
  const { patientType, setPatientType, nextStep, canProceed } =
    useBookingStore();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-2">
          Welcome! How Can We Help?
        </h2>
        <p className="text-gray-600">
          Select the option that best describes your visit
        </p>
      </div>

      <div className="space-y-4">
        {patientTypes.map((pt, index) => (
          <motion.button
            key={pt.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setPatientType(pt.type)}
            className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
              patientType === pt.type
                ? "border-emerald-600 bg-emerald-50"
                : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
            }`}
            aria-pressed={patientType === pt.type}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  patientType === pt.type
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <pt.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {pt.title}
                  </h3>
                  <span className="text-sm text-gray-500">{pt.duration}</span>
                </div>
                <p className="text-gray-600 mt-1">{pt.description}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 shrink-0 mt-1 ${
                  patientType === pt.type
                    ? "border-emerald-600 bg-emerald-600"
                    : "border-gray-300"
                }`}
              >
                {patientType === pt.type && (
                  <svg
                    className="w-full h-full text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="pt-6">
        <Button
          onClick={nextStep}
          disabled={!canProceed()}
          className="w-full"
          size="lg"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
