"use client";

import React from "react";
import { motion } from "framer-motion";
import { useBookingStore, Modality } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Video, MapPin, Phone, ArrowRight, Clock, DollarSign } from "lucide-react";

const modalities: {
  type: Modality;
  title: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  priceNote?: string;
}[] = [
  {
    type: "virtual",
    title: "Virtual Visit",
    description: "Meet with your doctor via secure video call from anywhere.",
    icon: Video,
    features: [
      "No travel required",
      "Same quality care",
      "Easy prescription refills",
      "Screen sharing for results review",
    ],
    priceNote: "Starting at $150",
  },
  {
    type: "in_person",
    title: "In-Person Visit",
    description: "Visit our clinic for a comprehensive in-person examination.",
    icon: MapPin,
    features: [
      "Physical examination",
      "Lab work on-site",
      "Meet our full care team",
      "Tour our facilities",
    ],
    priceNote: "Starting at $200",
  },
  {
    type: "phone",
    title: "Phone Consultation",
    description: "Quick phone call for follow-ups and simple consultations.",
    icon: Phone,
    features: [
      "Quick & convenient",
      "No video required",
      "Great for follow-ups",
      "Prescription refills",
    ],
    priceNote: "Starting at $75",
  },
];

export function StepModality() {
  const { modality, setModality, nextStep, canProceed, patientType } =
    useBookingStore();

  // Discovery calls are always phone
  const availableModalities =
    patientType === "discovery"
      ? modalities.filter((m) => m.type === "phone")
      : modalities;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-2">
          How Would You Like to Meet?
        </h2>
        <p className="text-gray-600">
          Choose the consultation format that works best for you
        </p>
      </div>

      <div className="space-y-4">
        {availableModalities.map((m, index) => (
          <motion.button
            key={m.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setModality(m.type)}
            className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
              modality === m.type
                ? "border-emerald-600 bg-emerald-50"
                : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
            }`}
            aria-pressed={modality === m.type}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  modality === m.type
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <m.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {m.title}
                  </h3>
                  {m.priceNote && (
                    <span className="text-sm text-emerald-700 font-medium">
                      {m.priceNote}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-3">{m.description}</p>
                <ul className="grid grid-cols-2 gap-2">
                  {m.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 shrink-0 mt-1 ${
                  modality === m.type
                    ? "border-emerald-600 bg-emerald-600"
                    : "border-gray-300"
                }`}
              >
                {modality === m.type && (
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

      {/* Duration estimate */}
      <div className="flex items-center justify-center gap-4 text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>
            {patientType === "new"
              ? "60 min"
              : patientType === "returning"
              ? "30 min"
              : "15 min"}{" "}
            consultation
          </span>
        </div>
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
