"use client";

import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";

export default function AdminDashboardPage() {
  return (
    <AdminAuthProvider>
      <AdminLayout />
    </AdminAuthProvider>
  );
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
