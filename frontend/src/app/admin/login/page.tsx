import { Metadata } from "next";
import Image from "next/image";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Admin Login | TZ Wellness",
  description: "Login to the TZ Wellness admin dashboard.",
  robots: "noindex, nofollow",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/main_logo.png"
              alt="TZ Wellness Logo"
              width={240}
              height={80}
              className="h-20 w-auto brightness-0 invert"
            />
          </div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">
            Admin Dashboard
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
