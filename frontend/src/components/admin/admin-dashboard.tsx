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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatTime } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { appointmentsApi } from "@/lib/api";

interface AdminDashboardProps {
  onNavigate: (tab: "appointments" | "blog" | "events" | "services" | "settings" | "activities") => void;
}

interface DashboardStats {
  pending_appointments: number;
  today_appointments: number;
  total_patients: number;
  completion_rate: number;
  weekly_change: number;
}

interface PendingAppointment {
  id: string;
  reference_id: string;
  patient_name: string;
  patient_email: string;
  service_id?: string;
  scheduled_date: string;
  scheduled_time: string;
  modality: string;
  patient_type: string;
  created_at: string;
  service?: {
    title: string;
  };
}

interface Activity {
  id: string;
  action: string;
  description: string;
  created_at: string;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingAppointments, setPendingAppointments] = useState<PendingAppointment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch dashboard data from Supabase
  const fetchDashboardData = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      // Fetch pending appointments
      const { data: pending, error: pendingError } = await supabase
        .from('appointments')
        .select(`
          *,
          service:services(title)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      if (pendingError) throw pendingError;
      setPendingAppointments(pending || []);

      // Fetch today's appointments
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('scheduled_date', today)
        .neq('status', 'cancelled');

      // Fetch total unique patients
      const { count: totalPatients } = await supabase
        .from('appointments')
        .select('patient_email', { count: 'exact', head: true });

      // Fetch completed appointments for completion rate
      const { count: completedCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      const { count: allCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'cancelled');

      const completionRate = allCount ? Math.round((completedCount || 0) / allCount * 100) : 0;

      // Calculate weekly change (last 7 days vs previous 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const { count: lastWeekCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      const { count: previousWeekCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', fourteenDaysAgo.toISOString())
        .lt('created_at', sevenDaysAgo.toISOString());

      const weeklyChange = previousWeekCount
        ? Math.round(((lastWeekCount || 0) - previousWeekCount) / previousWeekCount * 100)
        : 0;

      setStats({
        pending_appointments: pending?.length || 0,
        today_appointments: todayCount || 0,
        total_patients: totalPatients || 0,
        completion_rate: completionRate,
        weekly_change: weeklyChange,
      });

      // Fetch recent activity logs (only 5 for dashboard widget)
      const { data: activityData, error: activityError } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (activityError) throw activityError;
      setActivities(activityData || []);

    } catch (error: any) {
      console.error('Dashboard fetch error:', error);
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
  const handleApprove = async (appointmentId: string) => {
    setActionLoading(appointmentId);

    try {
      const response = await appointmentsApi.approve(appointmentId);

      if (response.success) {
        toast({
          title: "Appointment Approved",
          description: "The patient will receive a confirmation email.",
        });
        // Remove from pending list
        setPendingAppointments((prev) =>
          prev.filter((apt) => apt.id !== appointmentId)
        );
        // Refresh stats
        fetchDashboardData();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to approve appointment",
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
  const handleReject = async (appointmentId: string) => {
    const reason = prompt("Please enter a reason for rejection (optional):");
    if (reason === null) return; // User cancelled

    setActionLoading(appointmentId);

    try {
      const response = await appointmentsApi.reject(appointmentId, reason || "No reason provided");

      if (response.success) {
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
          description: response.error?.message || "Failed to reject appointment",
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

  const getModalityDisplay = (modality: string) => {
    switch (modality) {
      case "virtual":
        return "Virtual";
      case "in_person":
        return "In-Person";
      case "phone":
        return "Phone";
      default:
        return modality;
    }
  };

  const getActivityIcon = (action: string) => {
    if (action.includes("approved") || action.includes("created")) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (action.includes("cancelled") || action.includes("rejected")) {
      return <AlertCircle className="h-4 w-4 text-amber-600" />;
    }
    return <Calendar className="h-4 w-4 text-blue-600" />;
  };

  const getActivityBg = (action: string) => {
    if (action.includes("approved") || action.includes("created")) {
      return "bg-green-100";
    }
    if (action.includes("cancelled") || action.includes("rejected")) {
      return "bg-amber-100";
    }
    return "bg-blue-100";
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
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
      {/* Header with Refresh Button */}
      <div className="flex justify-end items-center">
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
        {statsCards.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
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
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
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
                            {getModalityDisplay(appointment.modality)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {appointment.service?.title || "Service"}
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
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest 5 admin actions</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("activities" as any)}
                className="text-emerald-600 hover:text-emerald-700"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
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
                      <div className={`p-1.5 rounded-full ${getActivityBg(activity.action)}`}>
                        {getActivityIcon(activity.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {activity.action.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatTimeAgo(activity.created_at)}
                        </p>
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
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
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
                onClick={() => onNavigate("services")}
              >
                <ArrowRight className="h-6 w-6 text-blue-600" />
                <span>Manage Services</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => onNavigate("blog")}
              >
                <ArrowRight className="h-6 w-6 text-purple-600" />
                <span>New Blog Post</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => onNavigate("events")}
              >
                <Users className="h-6 w-6 text-amber-600" />
                <span>Create Event</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
