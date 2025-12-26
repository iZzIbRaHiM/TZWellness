"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { appointmentsApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  User,
  AlertCircle,
  CheckCircle,
  Loader2,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

interface AppointmentResult {
  id: number;
  reference: string;
  patient: {
    name: string;
    email: string;
    phone: string;
  };
  service: string;
  date: string;
  time: string;
  duration: number;
  modality: "virtual" | "in-person" | "phone";
  status: "pending" | "confirmed" | "cancelled";
  provider: string;
  notes: string;
}

export function AppointmentLookup() {
  const { toast } = useToast();
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [appointment, setAppointment] = useState<AppointmentResult | null>(null);
  const [error, setError] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAppointment(null);
    setIsLoading(true);

    try {
      const response = await appointmentsApi.lookup(reference.toUpperCase());
      
      if (response.success && response.data) {
        // Verify email matches for security
        if (response.data.patient_email.toLowerCase() !== email.toLowerCase()) {
          setError(
            "Email address does not match our records. Please check and try again."
          );
          setIsLoading(false);
          return;
        }

        // Map API response to UI format
        setAppointment({
          id: response.data.id,
          reference: response.data.reference_id,
          patient: {
            name: response.data.patient_name,
            email: response.data.patient_email,
            phone: response.data.patient_phone,
          },
          service: response.data.service,
          date: response.data.scheduled_date,
          time: response.data.scheduled_time,
          duration: response.data.duration_minutes || 60,
          modality: response.data.modality,
          status: response.data.status,
          provider: "TF Wellfare Team",
          notes: response.data.reason || "",
        });
      } else {
        setError(
          response.error?.message || "No appointment found with that reference number. Please check your details and try again."
        );
      }
    } catch (err) {
      setError(
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    }

    setIsLoading(false);
  };

  const handleCancel = async () => {
    if (!appointment) return;

    setIsLoading(true);

    try {
      const response = await appointmentsApi.cancel(
        appointment.reference,
        "Cancelled by patient via lookup portal"
      );

      if (response.success) {
        setAppointment({ ...appointment, status: "cancelled" });
        setShowCancelDialog(false);
        
        toast({
          title: "Appointment Cancelled",
          description: response.data?.message || "Your appointment has been cancelled. You will receive a confirmation email.",
        });
      } else {
        toast({
          title: "Cancellation Failed",
          description: response.error?.message || "Unable to cancel appointment. Please contact us.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Unable to cancel appointment. Please try again or contact us.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const getModalityInfo = (modality: string) => {
    switch (modality) {
      case "virtual":
        return { icon: Video, label: "Virtual Visit", color: "text-blue-600" };
      case "in-person":
        return { icon: MapPin, label: "In-Person", color: "text-green-600" };
      case "phone":
        return { icon: Phone, label: "Phone Call", color: "text-purple-600" };
      default:
        return { icon: Calendar, label: modality, color: "text-gray-600" };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="success" className="text-sm">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="text-sm">
            <Clock className="h-3 w-3 mr-1" />
            Pending Confirmation
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" className="text-sm">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-emerald-600" />
            Lookup Your Appointment
          </CardTitle>
          <CardDescription>
            You can find your reference number in your confirmation email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g., TFW-2024-001234"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter the email used for booking"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find Appointment
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">
                    Appointment Not Found
                  </p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appointment Result */}
      <AnimatePresence>
        {appointment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {appointment.service}
                    </CardTitle>
                    <CardDescription>
                      Reference: {appointment.reference}
                    </CardDescription>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date & Time */}
                <div className="grid sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">
                        {formatDate(appointment.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">
                        {appointment.time} ({appointment.duration} min)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modality */}
                {(() => {
                  const modalityInfo = getModalityInfo(appointment.modality);
                  return (
                    <div className="flex items-center gap-3 p-4 border rounded-lg">
                      <modalityInfo.icon
                        className={`h-6 w-6 ${modalityInfo.color}`}
                      />
                      <div>
                        <p className="font-medium">{modalityInfo.label}</p>
                        <p className="text-sm text-gray-500">
                          {appointment.modality === "virtual"
                            ? "A video link will be sent before your appointment"
                            : appointment.modality === "phone"
                              ? "We will call you at the scheduled time"
                              : "TF Wellfare Clinic, 123 Wellness Way"}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Provider */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Your Provider</p>
                    <p className="font-medium">{appointment.provider}</p>
                  </div>
                </div>

                {/* Notes */}
                {appointment.notes && (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                    <p className="text-sm font-medium text-amber-800">
                      Important Notes
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      {appointment.notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {appointment.status !== "cancelled" && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <Button asChild variant="default" className="flex-1">
                      <Link href="/book">Reschedule Appointment</Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setShowCancelDialog(true)}
                    >
                      Cancel Appointment
                    </Button>
                  </div>
                )}

                {appointment.status === "cancelled" && (
                  <div className="pt-4 border-t text-center">
                    <p className="text-gray-600 mb-4">
                      This appointment has been cancelled.
                    </p>
                    <Button asChild>
                      <Link href="/book">Book a New Appointment</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Appointment"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              className="flex-1"
            >
              Keep Appointment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help text */}
      <p className="text-center text-sm text-gray-500">
        Need help?{" "}
        <a
          href="tel:+1234567890"
          className="text-emerald-600 hover:text-emerald-700"
        >
          Call us at (555) 123-4567
        </a>
      </p>
    </div>
  );
}
