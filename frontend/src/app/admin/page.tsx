"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAuthStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { setUser, setAuth, logout } = useAuthStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // ALWAYS validate fresh Supabase session - never trust cached state
        const supabase = createClient();
        
        // Force fresh session check (not cached)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          // No valid session - clear any stale data and redirect
          logout();
          if (mounted) {
            router.replace("/admin/login");
          }
          return;
        }

        // Double-check with getUser to ensure token is valid
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          // Token invalid - clear and redirect
          logout();
          if (mounted) {
            router.replace("/admin/login");
          }
          return;
        }

        // Valid session - update store
        if (mounted) {
          setUser({
            id: user.id,
            email: user.email || "",
            full_name: user.user_metadata?.full_name || user.email || "Admin",
            role: user.user_metadata?.role || "admin",
          });
          
          setAuth("supabase_session", "supabase_session");
          setIsAuthenticated(true);
          setIsChecking(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        logout();
        if (mounted) {
          router.replace("/admin/login");
        }
      }
    };

    // Run auth check immediately on mount
    checkAuth();

    // Set up auth state change listener to detect logout/session expiry
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        logout();
        if (mounted) {
          router.replace("/admin/login");
        }
      } else if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        // Re-validate on token refresh
        checkAuth();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, setUser, setAuth, logout]);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Verifying authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <AdminLayout />;
}
