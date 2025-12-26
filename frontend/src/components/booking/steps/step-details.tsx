"use client";

import React, { useState } from "react";
import { useBookingStore } from "@/lib/store";
import { appointmentsApi, BookingRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  ArrowRight,
  Shield,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function StepDetails() {
  const {
    patientType,
    modality,
    selectedDate,
    selectedTime,
    timezone,
    patientDetails,
    reason,
    honeypot,
    setPatientDetails,
    setReason,
    setHoneypot,
    setReferenceId,
    setSubmitting,
    setError,
    isSubmitting,
    error,
    nextStep,
  } = useBookingStore();

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!patientDetails.name.trim()) {
      errors.name = "Name is required";
    }

    if (!patientDetails.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientDetails.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!patientDetails.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[+]?[\d\s-()]{10,}$/.test(patientDetails.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    // Honeypot check - if filled, it's a bot
    if (honeypot) {
      toast({
        title: "Error",
        description: "Invalid submission",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Please fix the errors",
        description: "Some fields require your attention",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate || !selectedTime || !modality || !patientType) {
      toast({
        title: "Missing information",
        description: "Please complete all previous steps",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const bookingData: BookingRequest = {
        patient_type: patientType,
        patient_details: patientDetails,
        scheduled_date: selectedDate,
        scheduled_time: selectedTime,
        modality: modality,
        timezone,
        reason,
      };

      const response = await appointmentsApi.book(bookingData);

      if (response.success && response.data) {
        setReferenceId(response.data.reference_id);
        nextStep();
      } else {
        const errorMessage =
          response.error?.message || "Failed to book appointment";

        // Handle slot unavailable
        if (response.error?.code === "SLOT_UNAVAILABLE") {
          toast({
            title: "Time slot no longer available",
            description: "Please go back and select a different time.",
            variant: "destructive",
          });
        } else if (response.error?.code === "RATE_LIMIT_EXCEEDED") {
          toast({
            title: "Too many attempts",
            description: "Please wait a few minutes before trying again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Booking failed",
            description: errorMessage,
            variant: "destructive",
          });
        }

        setError(errorMessage);
      }
    } catch (err) {
      const message = "An unexpected error occurred. Please try again.";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-2">
          Your Information
        </h2>
        <p className="text-gray-600">
          Please provide your contact details to complete the booking
        </p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={patientDetails.name}
            onChange={(e) => setPatientDetails({ name: e.target.value })}
            className={cn(validationErrors.name && "border-red-500")}
            aria-invalid={!!validationErrors.name}
            aria-describedby={validationErrors.name ? "name-error" : undefined}
          />
          {validationErrors.name && (
            <p id="name-error" className="text-sm text-red-500">
              {validationErrors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={patientDetails.email}
            onChange={(e) => setPatientDetails({ email: e.target.value })}
            className={cn(validationErrors.email && "border-red-500")}
            aria-invalid={!!validationErrors.email}
            aria-describedby={validationErrors.email ? "email-error" : undefined}
          />
          {validationErrors.email && (
            <p id="email-error" className="text-sm text-red-500">
              {validationErrors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(123) 456-7890"
            value={patientDetails.phone}
            onChange={(e) => setPatientDetails({ phone: e.target.value })}
            className={cn(validationErrors.phone && "border-red-500")}
            aria-invalid={!!validationErrors.phone}
            aria-describedby={validationErrors.phone ? "phone-error" : undefined}
          />
          {validationErrors.phone && (
            <p id="phone-error" className="text-sm text-red-500">
              {validationErrors.phone}
            </p>
          )}
        </div>

        {/* Reason for visit */}
        <div className="space-y-2">
          <Label htmlFor="reason" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-400" />
            Reason for Visit (Optional)
          </Label>
          <Textarea
            id="reason"
            placeholder="Briefly describe your health concerns or goals..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>

        {/* Honeypot field (hidden from users, catches bots) */}
        <div className="hidden" aria-hidden="true">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>
      </form>

      {/* Privacy notice */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
        <Shield className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-sm text-gray-600">
          <p className="font-medium text-gray-900 mb-1">
            Your information is secure
          </p>
          <p>
            We use industry-standard encryption to protect your data. By
            submitting, you agree to our{" "}
            <a href="/legal/privacy-policy" className="text-emerald-700 underline">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="/legal/terms-of-use" className="text-emerald-700 underline">
              Terms of Use
            </a>
            .
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="pt-6">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : (
            <>
              Confirm Booking
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
