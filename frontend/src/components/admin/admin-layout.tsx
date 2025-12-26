"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  FileText,
  CalendarDays,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Bell,
  ChevronDown,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AdminDashboard } from "./admin-dashboard";
import { AdminAppointments } from "./admin-appointments";
import { AdminBlogCMS } from "./admin-blog-cms";
import { AdminEventsCMS } from "./admin-events-cms";
import { AdminServices } from "./admin-services";

type AdminTab = "dashboard" | "appointments" | "services" | "blog" | "events" | "settings";

const navItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: Home },
  { id: "appointments" as const, label: "Appointments", icon: Calendar, badge: 5 },
  { id: "services" as const, label: "Services", icon: Stethoscope },
  { id: "blog" as const, label: "Blog Posts", icon: FileText },
  { id: "events" as const, label: "Events", icon: CalendarDays },
  { id: "settings" as const, label: "Settings", icon: Settings },
];

export function AdminLayout() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard onNavigate={setActiveTab} />;
      case "appointments":
        return <AdminAppointments />;
      case "services":
        return (
          <div className="p-8">
            <AdminServices />
          </div>
        );
      case "blog":
        return <AdminBlogCMS />;
      case "events":
        return <AdminEventsCMS />;
      case "settings":
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-emerald-950 transform transition-transform duration-200 ease-in-out lg:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-emerald-800">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🏥</span>
              <span className="font-serif text-xl font-bold text-white">
                TF Wellfare
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-white lg:hidden"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors",
                  activeTab === item.id
                    ? "bg-emerald-800 text-white"
                    : "text-emerald-200 hover:bg-emerald-900 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge variant="destructive" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </button>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-emerald-800">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.full_name?.[0] || "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {user?.full_name || "Admin"}
                </p>
                <p className="text-emerald-300 text-sm truncate">
                  {user?.email || "admin@tfwellfare.com"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full mt-2 text-emerald-200 hover:text-white hover:bg-emerald-900"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 capitalize">
              {activeTab === "blog" ? "Blog Posts" : activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Quick actions */}
            <Link href="/" target="_blank">
              <Button variant="outline" size="sm">
                View Site
              </Button>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
}
