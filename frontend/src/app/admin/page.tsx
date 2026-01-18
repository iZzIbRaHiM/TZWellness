"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAuthStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { useSessionGuard } from "@/hooks/use-session-guard";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { setUser, setAuth, logout } = useAuthStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Enable continuous session validation
  useSessionGuard({
    enabled: isAuthenticated,
    checkInterval: 30000, // Check every 30 seconds
  });

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
          await logout();
          if (mounted) {
            // Force hard navigation to prevent back button
            if (typeof window !== 'undefined') {
              window.location.replace('/admin/login');
            }
          }
          return;
        }

        // Double-check with getUser to ensure token is valid
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          // Token invalid - clear and redirect
          await logout();
          if (mounted) {
            if (typeof window !== 'undefined') {
              window.location.replace('/admin/login');
            }
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
        await logout();
        if (mounted) {
          if (typeof window !== 'undefined') {
            window.location.replace('/admin/login');
          }
        }
      }
    };

    // Run auth check immediately on mount
    checkAuth();

    // Set up auth state change listener to detect logout/session expiry
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        await logout();
        if (mounted) {
          setIsAuthenticated(false);
          // Force hard redirect to login page
          if (typeof window !== 'undefined') {
            window.location.replace('/admin/login');
          }
        }
      } else if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        // Re-validate on token refresh
        checkAuth();
      }
    });
    
    // Prevent back navigation after logout by clearing history
    const handlePopState = (e: PopStateEvent) => {
      // Check if user is still authenticated
      const currentAuth = isAuthenticated;
      if (!currentAuth) {
        e.preventDefault();
        window.location.replace('/admin/login');
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', handlePopState);
      }
    };
  }, [router, setUser, setAuth, logout, isAuthenticated]);

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
