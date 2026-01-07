"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAuthStore } from "@/lib/store";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, accessToken, syncFromStorage } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Wait for Zustand to hydrate from storage
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    // Sync from storage to ensure we have latest tokens
    syncFromStorage();

    // Check authentication after hydration
    if (!isAuthenticated || !accessToken) {
      router.replace("/admin/login");
    }
  }, [isHydrated, isAuthenticated, accessToken, router, syncFromStorage]);

  // Show loading while hydrating
  if (!isHydrated || !isAuthenticated || !accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return <AdminLayout />;
}
