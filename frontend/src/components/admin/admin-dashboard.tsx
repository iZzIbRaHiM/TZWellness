"use client";

import React, { useEffect, useState } from "react";
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
  Calendar,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Video,
  MapPin,
  Phone,
  Loader2,
  RefreshCw,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatTime } from "@/lib/utils";

interface AdminDashboardProps {
  onNavigate: (tab: "appointments" | "blog" | "events") => void;
}

interface DashboardStats {
  pending_appointments: number;
  today_appointments: number;
  total_patients: number;
  completion_rate: number;
  weekly_change: number;
  upcoming_appointments: number;
}

interface PendingAppointment {
  id: number;
  reference_id: string;
  patient_name: string;
  patient_email: string;
  service: string;
  scheduled_date: string;
  scheduled_time: string;
  modality: string;
  modality_display: string;
  patient_type_display: string;
  created_at: string;
}

interface Activity {
  id: number;
  action_type: string;
  action_display: string;
  description: string;
  time_ago: string;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingAppointments, setPendingAppointments] = useState<PendingAppointment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      // Fetch stats, pending appointments, and activity in parallel
      const [statsRes, pendingRes, activityRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/dashboard/summary/`, { headers }),
        fetch(`${API_URL}/api/v1/dashboard/pending/`, { headers }),
        fetch(`${API_URL}/api/v1/dashboard/activity/`, { headers }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.data.stats);
        }
      }

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        if (pendingData.success) {
          setPendingAppointments(pendingData.data.appointments);
        }
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        if (activityData.success) {
          setActivities(activityData.data.activities);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please refresh.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Approve appointment
  const handleApprove = async (appointmentId: number) => {
    setActionLoading(appointmentId);
    const token = localStorage.getItem("accessToken");
    
    try {
      const response = await fetch(
        `${API_URL}/api/v1/dashboard/appointments/${appointmentId}/approve/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Appointment Approved",
          description: "The patient will receive a confirmation email.",
        });
        // Remove from pending list (optimistic UI)
        setPendingAppointments((prev) =>
          prev.filter((apt) => apt.id !== appointmentId)
        );
        // Refresh stats
        fetchDashboardData();
      } else {
        toast({
          title: "Error",
          description: data.error?.message || "Failed to approve appointment",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Reject appointment
  const handleReject = async (appointmentId: number) => {
    const reason = prompt("Please enter a reason for rejection (optional):");
    if (reason === null) return; // User cancelled

    setActionLoading(appointmentId);
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(
        `${API_URL}/api/v1/dashboard/appointments/${appointmentId}/reject/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ reason: reason || "No reason provided" }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Appointment Rejected",
          description: "The patient will be notified to reschedule.",
        });
        // Remove from pending list
        setPendingAppointments((prev) =>
          prev.filter((apt) => apt.id !== appointmentId)
        );
        fetchDashboardData();
      } else {
        toast({
          title: "Error",
          description: data.error?.message || "Failed to reject appointment",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case "virtual":
        return <Video className="h-3 w-3 mr-1" />;
      case "in_person":
        return <MapPin className="h-3 w-3 mr-1" />;
      case "phone":
        return <Phone className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const getActivityIcon = (actionType: string) => {
    if (actionType.includes("approved") || actionType.includes("created")) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (actionType.includes("cancelled") || actionType.includes("rejected")) {
      return <AlertCircle className="h-4 w-4 text-amber-600" />;
    }
    return <Calendar className="h-4 w-4 text-blue-600" />;
  };

  const getActivityBg = (actionType: string) => {
    if (actionType.includes("approved") || actionType.includes("created")) {
      return "bg-green-100";
    }
    if (actionType.includes("cancelled") || actionType.includes("rejected")) {
      return "bg-amber-100";
    }
    return "bg-blue-100";
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const statsCards = [
    {
      label: "Pending Appointments",
      value: stats?.pending_appointments || 0,
      change: "Awaiting approval",
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Today's Appointments",
      value: stats?.today_appointments || 0,
      change: "Scheduled today",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Total Patients",
      value: stats?.total_patients || 0,
      change: `${stats?.weekly_change || 0}% this week`,
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Completion Rate",
      value: `${stats?.completion_rate || 0}%`,
      change: "Appointments completed",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header with Refresh and Export Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`${API_URL}/api/v1/dashboard/export/appointments/`, '_blank')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Appointments
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`${API_URL}/api/v1/dashboard/export/stats/`, '_blank')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Stats
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchDashboardData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pending Appointments</CardTitle>
                <CardDescription>
                  {pendingAppointments.length} appointments awaiting confirmation
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate("appointments")}
              >
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardHeader>
            <CardContent>
              {pendingAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
                  <p>No pending appointments</p>
                  <p className="text-sm">All caught up!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingAppointments.slice(0, 4).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {appointment.patient_name}
                          </h4>
                          <Badge
                            variant={
                              appointment.modality === "virtual"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {getModalityIcon(appointment.modality)}
                            {appointment.modality_display}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {appointment.service}
                        </p>
                        <p className="text-sm text-gray-400">
                          {formatDate(appointment.scheduled_date)} at{" "}
                          {formatTime(appointment.scheduled_time)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(appointment.id)}
                          disabled={actionLoading === appointment.id}
                        >
                          {actionLoading === appointment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(appointment.id)}
                          disabled={actionLoading === appointment.id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and actions</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-full ${getActivityBg(activity.action_type)}`}>
                        {getActivityIcon(activity.action_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action_display}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400">{activity.time_ago}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => onNavigate("appointments")}
              >
                <Calendar className="h-6 w-6 text-emerald-600" />
                <span>Manage Appointments</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => onNavigate("blog")}
              >
                <ArrowRight className="h-6 w-6 text-blue-600" />
                <span>New Blog Post</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => onNavigate("events")}
              >
                <Users className="h-6 w-6 text-purple-600" />
                <span>Create Event</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
              >
                <TrendingUp className="h-6 w-6 text-amber-600" />
                <span>View Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
