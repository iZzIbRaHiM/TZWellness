"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useBookingStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/utils";
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  Mail,
  Copy,
  Home,
  FileText,
} from "lucide-react";

const confettiColors = [
  "#064E3B",
  "#E07A5F",
  "#10B981",
  "#F5F5F0",
  "#FFD700",
];

export function StepSuccess() {
  const {
    referenceId,
    patientDetails,
    patientType,
    modality,
    selectedDate,
    selectedTime,
    reset,
  } = useBookingStore();

  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);

  // Confetti effect
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const copyReferenceId = async () => {
    if (referenceId) {
      await navigator.clipboard.writeText(referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getModalityIcon = () => {
    switch (modality) {
      case "virtual":
        return <Video className="h-5 w-5" />;
      case "in_person":
        return <MapPin className="h-5 w-5" />;
      case "phone":
        return <Phone className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getModalityLabel = () => {
    switch (modality) {
      case "virtual":
        return "Virtual Visit";
      case "in_person":
        return "In-Person Visit";
      case "phone":
        return "Phone Consultation";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6 text-center relative">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor:
                  confettiColors[Math.floor(Math.random() * confettiColors.length)],
                animationDelay: `${Math.random() * 2}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Success icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-12 w-12 text-emerald-600" />
        </div>
      </div>

      <div>
        <h2 className="font-serif text-3xl font-bold text-emerald-950 mb-2">
          Booking Submitted!
        </h2>
        <p className="text-gray-600">
          Your appointment request has been received. We'll confirm your booking
          shortly.
        </p>
      </div>

      {/* Reference ID */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
        <p className="text-sm text-emerald-700 mb-2">Your Reference Number</p>
        <div className="flex items-center justify-center gap-3">
          <span className="font-mono text-2xl font-bold text-emerald-900">
            {referenceId}
          </span>
          <button
            onClick={copyReferenceId}
            className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
            aria-label="Copy reference number"
          >
            <Copy className="h-5 w-5 text-emerald-600" />
          </button>
        </div>
        {copied && (
          <p className="text-sm text-emerald-600 mt-2">Copied to clipboard!</p>
        )}
        <p className="text-xs text-emerald-600 mt-3">
          Save this number to check your appointment status
        </p>
      </div>

      {/* Appointment details */}
      <div className="bg-white border rounded-xl p-6 text-left">
        <h3 className="font-semibold text-gray-900 mb-4">Appointment Details</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">
                {selectedDate && formatDate(selectedDate)}
              </p>
              <p className="text-sm text-gray-500">Date</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">
                {selectedTime && formatTime(selectedTime)}
              </p>
              <p className="text-sm text-gray-500">Time</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {getModalityIcon()}
            <div>
              <p className="font-medium text-gray-900">{getModalityLabel()}</p>
              <p className="text-sm text-gray-500">Consultation Type</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">{patientDetails.email}</p>
              <p className="text-sm text-gray-500">
                Confirmation will be sent here
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Next steps */}
      <div className="bg-gray-50 rounded-xl p-6 text-left">
        <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
        <ol className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm shrink-0">
              1
            </span>
            <p className="text-gray-700">
              Check your email for a confirmation message within 24 hours.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm shrink-0">
              2
            </span>
            <p className="text-gray-700">
              You'll receive a calendar invite once your appointment is approved.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm shrink-0">
              3
            </span>
            <p className="text-gray-700">
              {modality === "virtual"
                ? "A video link will be sent before your appointment."
                : modality === "phone"
                ? "We'll call you at the scheduled time."
                : "Arrive 15 minutes early to complete check-in."}
            </p>
          </li>
        </ol>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button asChild variant="default" className="flex-1">
          <Link href={`/appointments/lookup?ref=${referenceId}`}>
            <FileText className="mr-2 h-4 w-4" />
            Check Status
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1" onClick={reset}>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
