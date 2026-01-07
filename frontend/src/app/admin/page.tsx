"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAuthStore } from "@/lib/store";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give Zustand time to hydrate from localStorage
    const timer = setTimeout(() => {
      if (!isAuthenticated || !accessToken) {
        router.replace("/admin/login");
      } else {
        setIsChecking(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, accessToken, router]);

  // Show nothing while checking auth
  if (isChecking || !isAuthenticated || !accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return <AdminLayout />;
}
