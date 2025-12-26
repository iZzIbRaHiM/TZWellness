import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";

export const metadata: Metadata = {
  title: "Admin Dashboard | TF Wellfare",
  description: "Admin dashboard for managing appointments, content, and clinic operations.",
  robots: "noindex, nofollow",
};

// Verify JWT token from cookies
async function checkAuth() {
  const cookieStore = cookies();
  const token = cookieStore.get('accessToken')?.value;
  
  if (!token) {
    return false;
  }

  // Verify token with backend API
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${API_URL}/api/v1/auth/me/`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (!res.ok) {
      return false;
    }
    
    const user = await res.json();
    // Check if user has admin role
    return user.data?.role === 'admin' || user.data?.role === 'staff';
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
}

export default async function AdminDashboardPage() {
  const isAuthenticated = await checkAuth();
  
  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  return <AdminLayout />;
}
