"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "super_admin";
  is_active: boolean;
  last_login_at: string | null;
}

interface AdminAuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Fetch admin user data from admin_users table
  const fetchAdminUser = async (userId: string): Promise<AdminUser | null> => {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", userId)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        console.error("Admin user fetch error:", error);
        return null;
      }

      return data as AdminUser;
    } catch (error) {
      console.error("Error fetching admin user:", error);
      return null;
    }
  };

  // Refresh admin status
  const refreshAdminStatus = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        const adminData = await fetchAdminUser(currentUser.id);
        setUser(currentUser);
        setAdminUser(adminData);
      } else {
        setUser(null);
        setAdminUser(null);
      }
    } catch (error) {
      console.error("Error refreshing admin status:", error);
      setUser(null);
      setAdminUser(null);
    }
  };

  // Secure logout function
  const logout = async () => {
    try {
      // Log activity before logout
      if (adminUser) {
        await supabase.from("activity_logs").insert({
          admin_id: adminUser.id,
          action_type: "logout",
          entity_type: "admin_user",
          entity_id: adminUser.id,
          description: "Admin logged out",
          metadata: { logout_time: new Date().toISOString() },
        });
      }

      // Sign out from Supabase (clears session)
      await supabase.auth.signOut();

      // Clear local state
      setUser(null);
      setAdminUser(null);

      // Clear any localStorage/sessionStorage
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Redirect to login
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even on error
      router.push("/admin/login");
      router.refresh();
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const adminData = await fetchAdminUser(session.user.id);
          setUser(session.user);
          setAdminUser(adminData);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);

        if (event === "SIGNED_IN" && session?.user) {
          const adminData = await fetchAdminUser(session.user.id);
          setUser(session.user);
          setAdminUser(adminData);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setAdminUser(null);
          router.push("/admin/login");
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          // Verify admin status on token refresh
          const adminData = await fetchAdminUser(session.user.id);
          if (!adminData) {
            // Admin status revoked - force logout
            await logout();
          } else {
            setUser(session.user);
            setAdminUser(adminData);
          }
        }
      }
    );

    // Session validation interval (every 30 seconds)
    const validateSession = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Session expired - logout
        await logout();
      } else if (session.user) {
        // Verify admin status still valid
        const adminData = await fetchAdminUser(session.user.id);
        if (!adminData) {
          // Admin status revoked - force logout
          await logout();
        }
      }
    }, 30000); // 30 seconds

    return () => {
      subscription.unsubscribe();
      clearInterval(validateSession);
    };
  }, []);

  const value: AdminAuthContextType = {
    user,
    adminUser,
    isLoading,
    isAdmin: !!adminUser && adminUser.is_active,
    logout,
    refreshAdminStatus,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
