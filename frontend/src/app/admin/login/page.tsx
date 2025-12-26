import { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Admin Login | TF Wellfare",
  description: "Login to the TF Wellfare admin dashboard.",
  robots: "noindex, nofollow",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-white mb-2">
            TF Wellfare Admin
          </h1>
          <p className="text-emerald-200">
            Sign in to access the admin dashboard
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
