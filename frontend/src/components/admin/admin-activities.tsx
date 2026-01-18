"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Loader2, Search, Filter, Calendar, User, FileText } from "lucide-react";
import { format } from "date-fns";

interface ActivityLog {
  id: string;
  admin_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  description: string;
  metadata: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin_users: {
    full_name: string | null;
    email: string;
  };
}

const ACTION_COLORS = {
  login: "bg-blue-100 text-blue-800",
  logout: "bg-gray-100 text-gray-800",
  create: "bg-green-100 text-green-800",
  update: "bg-yellow-100 text-yellow-800",
  delete: "bg-red-100 text-red-800",
  publish: "bg-purple-100 text-purple-800",
  unpublish: "bg-orange-100 text-orange-800",
  archive: "bg-gray-100 text-gray-800",
};

const ENTITY_ICONS = {
  blog_post: FileText,
  event: Calendar,
  appointment: Calendar,
  admin_user: User,
  settings: Filter,
};

export function AdminActivities() {
  const { adminUser } = useAdminAuth();
  const supabase = createClient();

  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterEntity, setFilterEntity] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 20;

  // Fetch activities
  const fetchActivities = async (pageNum: number = 1) => {
    try {
      setIsLoading(true);

      let query = supabase
        .from("activity_logs")
        .select(
          `
          *,
          admin_users (
            full_name,
            email
          )
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range((pageNum - 1) * itemsPerPage, pageNum * itemsPerPage - 1);

      // Apply filters
      if (filterAction !== "all") {
        query = query.eq("action_type", filterAction);
      }

      if (filterEntity !== "all") {
        query = query.eq("entity_type", filterEntity);
      }

      // Apply search
      if (searchTerm) {
        query = query.ilike("description", `%${searchTerm}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setActivities(data || []);
      setHasMore(count ? (pageNum * itemsPerPage) < count : false);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(page);
  }, [page, filterAction, filterEntity]);

  const handleSearch = () => {
    setPage(1);
    fetchActivities(1);
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilterAction("all");
    setFilterEntity("all");
    setPage(1);
    fetchActivities(1);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Recent Activities</h2>
        <p className="text-gray-600 mt-1">View all admin actions and system events</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="publish">Publish</SelectItem>
                <SelectItem value="unpublish">Unpublish</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterEntity} onValueChange={setFilterEntity}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="blog_post">Blog Posts</SelectItem>
                <SelectItem value="event">Events</SelectItem>
                <SelectItem value="appointment">Appointments</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
                <SelectItem value="admin_user">Admin Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch} size="sm">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activities List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No activities found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {activities.map((activity) => {
              const Icon = ENTITY_ICONS[activity.entity_type as keyof typeof ENTITY_ICONS] || FileText;
              const actionColor = ACTION_COLORS[activity.action_type as keyof typeof ACTION_COLORS] || "bg-gray-100 text-gray-800";

              return (
                <Card key={activity.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <Icon className="h-5 w-5 text-emerald-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={actionColor}>
                            {activity.action_type}
                          </Badge>
                          <Badge variant="outline">
                            {activity.entity_type.replace(/_/g, " ")}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-900 font-medium mb-1">
                          {activity.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {activity.admin_users?.full_name || activity.admin_users?.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(activity.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                          {activity.ip_address && (
                            <span>IP: {activity.ip_address}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
            >
              Previous
            </Button>

            <span className="text-sm text-gray-600">
              Page {page}
            </span>

            <Button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
