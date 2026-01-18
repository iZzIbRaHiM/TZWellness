"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  FileText,
  Users,
  Settings,
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { formatDate, formatTime, cn } from "@/lib/utils";

interface Activity {
  id: string;
  action: string;
  description: string;
  metadata?: any;
  created_at: string;
  user_id?: string;
}

const ITEMS_PER_PAGE = 20;

const ACTION_TYPES = [
  { value: "all", label: "All Actions" },
  { value: "appointment", label: "Appointments" },
  { value: "blog", label: "Blog Posts" },
  { value: "event", label: "Events" },
  { value: "service", label: "Services" },
  { value: "settings", label: "Settings" },
];

export function AdminActivitiesLog() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Fetch activities with pagination and filters
  const { data: activitiesData, isLoading, refetch } = useQuery({
    queryKey: ["admin-activities", currentPage, actionFilter, dateFilter, searchQuery],
    queryFn: async () => {
      const supabase = createClient();

      // Calculate pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Build query
      let query = supabase
        .from("activity_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      // Apply action filter
      if (actionFilter !== "all") {
        query = query.ilike("action", `%${actionFilter}%`);
      }

      // Apply date filter
      if (dateFilter !== "all") {
        const now = new Date();
        let startDate: Date;

        switch (dateFilter) {
          case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case "week":
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case "month":
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte("created_at", startDate.toISOString());
      }

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.or(
          `description.ilike.%${searchQuery}%,action.ilike.%${searchQuery}%`
        );
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        activities: data || [],
        total: count || 0,
        totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  const activities = activitiesData?.activities || [];
  const totalPages = activitiesData?.totalPages || 1;
  const total = activitiesData?.total || 0;

  // Get icon for activity type
  const getActivityIcon = (action: string) => {
    if (action.includes("appointment")) return <Calendar className="h-4 w-4" />;
    if (action.includes("blog")) return <FileText className="h-4 w-4" />;
    if (action.includes("event")) return <Users className="h-4 w-4" />;
    if (action.includes("service")) return <Settings className="h-4 w-4" />;
    if (action.includes("approved")) return <CheckCircle className="h-4 w-4" />;
    if (action.includes("rejected") || action.includes("cancelled"))
      return <XCircle className="h-4 w-4" />;
    if (action.includes("created")) return <Plus className="h-4 w-4" />;
    if (action.includes("updated") || action.includes("edited"))
      return <Edit className="h-4 w-4" />;
    if (action.includes("deleted")) return <Trash2 className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  // Get background color for activity type
  const getActivityBg = (action: string) => {
    if (action.includes("approved") || action.includes("published"))
      return "bg-green-100 text-green-600";
    if (action.includes("rejected") || action.includes("deleted"))
      return "bg-red-100 text-red-600";
    if (action.includes("cancelled") || action.includes("unpublished"))
      return "bg-orange-100 text-orange-600";
    if (action.includes("created")) return "bg-blue-100 text-blue-600";
    if (action.includes("updated") || action.includes("edited"))
      return "bg-purple-100 text-purple-600";
    return "bg-gray-100 text-gray-600";
  };

  // Format relative time
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return formatDate(date);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
          <p className="text-gray-500">
            Complete history of all admin actions and system events
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Action Type Filter */}
            <Select
              value={actionFilter}
              onValueChange={(value) => {
                setActionFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Action type" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Select
              value={dateFilter}
              onValueChange={(value) => {
                setDateFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>

            {/* Results Count */}
            <div className="flex items-center justify-center px-4 py-2 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{total}</span> result
                {total !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>
            Real-time log of all administrative actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
              <p className="text-gray-500 mt-4">Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No activities found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-1">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors",
                    index !== activities.length - 1 && "border-b"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={`p-2 rounded-full flex-shrink-0 ${getActivityBg(
                      activity.action
                    )}`}
                  >
                    {getActivityIcon(activity.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {activity.action.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {activity.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(activity.created_at)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatTime(activity.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Metadata (if available) */}
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <span
                            key={key}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            <span className="text-gray-500">{key}:</span>
                            <span className="ml-1">{String(value)}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
