"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";

/**
 * Session Guard Hook
 * Validates Supabase session on every render and periodically
 * Forces re-authentication if session is invalid or expired
 */
export function useSessionGuard(options: {
  enabled?: boolean;
  checkInterval?: number; // in milliseconds
  onSessionExpired?: () => void;
} = {}) {
  const {
    enabled = true,
    checkInterval = 30000, // Check every 30 seconds by default
    onSessionExpired,
  } = options;

  const router = useRouter();
  const { logout } = useAuthStore();
  const lastCheckRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const validateSession = async () => {
    if (!enabled) return true;

    try {
      const supabase = createClient();
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.warn("Session validation failed: No valid session");
        await handleSessionExpired();
        return false;
      }

      // Verify token is valid (not just present)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.warn("Session validation failed: Invalid token");
        await handleSessionExpired();
        return false;
      }

      // Check if session is about to expire (within 5 minutes)
      if (session.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000);
        const now = new Date();
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();
        const fiveMinutes = 5 * 60 * 1000;

        if (timeUntilExpiry < fiveMinutes) {
          console.log("Session expiring soon, refreshing...");
          // Attempt to refresh the session
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error("Session refresh failed:", refreshError);
            await handleSessionExpired();
            return false;
          }
        }
      }

      lastCheckRef.current = Date.now();
      return true;
    } catch (error) {
      console.error("Session validation error:", error);
      await handleSessionExpired();
      return false;
    }
  };

  const handleSessionExpired = async () => {
    if (onSessionExpired) {
      onSessionExpired();
    }
    
    await logout();
    
    // Force hard redirect to login
    if (typeof window !== 'undefined') {
      window.location.replace('/admin/login');
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // Initial validation on mount
    validateSession();

    // Set up periodic validation
    intervalRef.current = setInterval(() => {
      validateSession();
    }, checkInterval);

    // Validate on visibility change (tab becomes active)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Only check if it's been more than 10 seconds since last check
        const timeSinceLastCheck = Date.now() - lastCheckRef.current;
        if (timeSinceLastCheck > 10000) {
          validateSession();
        }
      }
    };

    // Validate on focus (user returns to window)
    const handleFocus = () => {
      const timeSinceLastCheck = Date.now() - lastCheckRef.current;
      if (timeSinceLastCheck > 10000) {
        validateSession();
      }
    };

    // Validate before any fetch request
    const handleBeforeFetch = () => {
      validateSession();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('beforeunload', handleBeforeFetch);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('beforeunload', handleBeforeFetch);
    };
  }, [enabled, checkInterval]);

  return { validateSession };
}
