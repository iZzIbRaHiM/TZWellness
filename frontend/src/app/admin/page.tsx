"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAuthStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, setUser, setAuth, syncFromStorage } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for Zustand to hydrate from storage
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const checkAuth = async () => {
      try {
        // Check Supabase session
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          // No valid session - redirect to login
          router.replace("/admin/login");
          return;
        }

        // Valid session - update store
        setUser({
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || user.email || "Admin",
          role: user.user_metadata?.role || "admin",
        });
        
        // Mark as authenticated
        setAuth("supabase_session", "supabase_session");
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/admin/login");
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [isHydrated, router, setUser, setAuth]);

  // Show loading while checking authentication
  if (!isHydrated || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <AdminLayout />;
}
