"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
} from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Video,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  User,
  LayoutList,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type ViewMode = "list" | "calendar";
type StatusFilter = "all" | "pending" | "confirmed" | "cancelled";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Appointment {
  id: number;
  reference_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  service: string;
  service_id: number | null;
  scheduled_date: string;
  scheduled_time: string;
  modality: string;
  modality_display: string;
  patient_type: string;
  patient_type_display: string;
  status: string;
  reason: string;
  created_at: string;
}

export function AdminAppointments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Fetch pending appointments from API
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/api/v1/dashboard/pending/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch appointments");
      const result = await res.json();
      return result.data.appointments as Appointment[];
    },
  });

  const appointmentsList = data || [];

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/api/v1/dashboard/approve/${id}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ meeting_link: "" }),
      });
      if (!res.ok) throw new Error("Failed to approve appointment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      toast({
        title: "Appointment Confirmed",
        description: "The patient will be notified via email.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve appointment. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setSelectedAppointment(null);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/api/v1/dashboard/reject/${id}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed to reject appointment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      toast({
        title: "Appointment Cancelled",
        description: "The patient will be notified via email.",
        variant: "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject appointment. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setSelectedAppointment(null);
      setRejectReason("");
    },
  });

  const handleApprove = (id: number) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id: number) => {
    if (!rejectReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    rejectMutation.mutate({ id, reason: rejectReason });
  };

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointmentsList.filter((apt) => {
      const matchesStatus =
        statusFilter === "all" || apt.status === statusFilter;
      const matchesSearch =
        searchQuery === "" ||
        apt.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.patient_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.reference_id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [appointmentsList, statusFilter, searchQuery]);

  // Get week days for calendar view
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentWeek);
    const end = endOfWeek(currentWeek);
    return eachDayOfInterval({ start, end });
  }, [currentWeek]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="success">Confirmed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case "virtual":
        return <Video className="h-4 w-4" />;
      case "in-person":
        return <MapPin className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
          <p className="text-gray-500">Manage and review patient appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white rounded-lg border p-1">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                viewMode === "list"
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <LayoutList className="h-4 w-4" />
              List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                viewMode === "calendar"
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <CalendarDays className="h-4 w-4" />
              Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search by patient, email, or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Patient
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Service
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Date & Time
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Modality
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredAppointments.map((apt) => (
                    <tr
                      key={apt.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedAppointment(apt)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {apt.patient_name}
                          </p>
                          <p className="text-sm text-gray-500">{apt.patient_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{apt.service}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-gray-900">
                            {format(parseISO(apt.scheduled_date), "MMM d, yyyy")}
                          </p>
                          <p className="text-sm text-gray-500">{apt.scheduled_time}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="capitalize">
                          {getModalityIcon(apt.modality)}
                          <span className="ml-1">{apt.modality}</span>
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-amber-100 text-amber-700 border-0">Pending</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(apt.id);
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(apt.id);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-medium">
                {format(weekDays[0], "MMM d")} -{" "}
                {format(weekDays[6], "MMM d, yyyy")}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(new Date())}
            >
              Today
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className="text-center py-2 text-sm font-medium text-gray-500"
                >
                  <div>{format(day, "EEE")}</div>
                  <div
                    className={cn(
                      "w-8 h-8 mx-auto rounded-full flex items-center justify-center",
                      isSameDay(day, new Date()) && "bg-emerald-600 text-white"
                    )}
                  >
                    {format(day, "d")}
                  </div>
                </div>
              ))}

              {/* Appointments grid */}
              {weekDays.map((day) => {
                const dayAppointments = filteredAppointments.filter((apt) =>
                  isSameDay(parseISO(apt.scheduled_date), day)
                );

                return (
                  <div
                    key={`appointments-${day.toISOString()}`}
                    className="min-h-[200px] border rounded-lg p-2 space-y-1"
                  >
                    {dayAppointments.map((apt) => (
                      <button
                        key={apt.id}
                        onClick={() => setSelectedAppointment(apt)}
                        className="w-full text-left text-xs p-2 rounded bg-amber-100 hover:bg-amber-200 text-amber-800"
                      >
                        <div className="font-medium">{apt.scheduled_time}</div>
                        <div className="truncate">{apt.patient_name}</div>
                        <div className="truncate text-xs opacity-75">
                          {apt.service}
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointment Detail Dialog */}
      <Dialog
        open={!!selectedAppointment}
        onOpenChange={() => setSelectedAppointment(null)}
      >
        <DialogContent className="max-w-lg">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <DialogTitle>Appointment Details</DialogTitle>
                <DialogDescription>
                  Reference: {selectedAppointment.reference_id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Patient info */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {selectedAppointment.patient_name}
                    </h4>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {selectedAppointment.patient_email}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {selectedAppointment.patient_phone}
                    </p>
                  </div>
                </div>

                {/* Appointment details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Service</Label>
                    <p className="font-medium">{selectedAppointment.service}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    <div className="mt-1">
                      <Badge className="bg-amber-100 text-amber-700 border-0">Pending</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Date</Label>
                    <p className="font-medium">
                      {format(parseISO(selectedAppointment.scheduled_date), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Time</Label>
                    <p className="font-medium">
                      {selectedAppointment.scheduled_time}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-500">Modality</Label>
                    <p className="font-medium capitalize flex items-center gap-2">
                      {getModalityIcon(selectedAppointment.modality)}
                      {selectedAppointment.modality}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label className="text-gray-500">Reason</Label>
                  <p className="mt-1 text-gray-700 p-3 bg-gray-50 rounded-lg">
                    {selectedAppointment.reason || "No reason provided"}
                  </p>
                </div>

                {/* Actions - Always show for pending appointments */}
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleApprove(selectedAppointment.id)}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleReject(selectedAppointment.id)}
                    disabled={rejectMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
