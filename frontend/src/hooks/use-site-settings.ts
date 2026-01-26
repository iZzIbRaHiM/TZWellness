"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface SiteSettings {
  clinic_name: string;
  clinic_email: string;
  clinic_phone: string;
  clinic_phone_href: string;
  clinic_email_href: string;
  clinic_address?: string;
  business_hours?: any;
}

const DEFAULT_SETTINGS: SiteSettings = {
  clinic_name: "TZ Wellness",
  clinic_email: "tzwellnesscentre0@gmail.com",
  clinic_phone: "(555) 123-4567",
  clinic_phone_href: "tel:+15551234567",
  clinic_email_href: "mailto:tzwellnesscentre0@gmail.com",
  clinic_address: undefined,
  business_hours: undefined,
};

/**
 * Hook to fetch public site settings from admin_settings table
 * Falls back to default values if no settings are configured
 */
export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const supabase = createClient();

        // Fetch the first admin user's clinic settings (public info)
        // We're only reading clinic contact info, not personal admin data
        const { data, error: fetchError } = await supabase
          .from("admin_settings")
          .select("clinic_name, clinic_email, clinic_phone, clinic_address, business_hours")
          .limit(1)
          .maybeSingle();

        if (fetchError) {
          console.error("Failed to fetch site settings:", fetchError);
          // Use defaults
          setSettings(DEFAULT_SETTINGS);
          setError(fetchError);
          return;
        }

        if (data) {
          // Format phone number for href - preserve international format
          const phoneDigits = data.clinic_phone?.replace(/\D/g, "") || "15551234567";
          const phoneHref = `tel:+${phoneDigits}`;

          setSettings({
            clinic_name: data.clinic_name || DEFAULT_SETTINGS.clinic_name,
            clinic_email: data.clinic_email || DEFAULT_SETTINGS.clinic_email,
            clinic_phone: data.clinic_phone || DEFAULT_SETTINGS.clinic_phone,
            clinic_phone_href: phoneHref,
            clinic_email_href: `mailto:${data.clinic_email || DEFAULT_SETTINGS.clinic_email}`,
            clinic_address: data.clinic_address,
            business_hours: data.business_hours,
          });
        } else {
          // No settings configured yet, use defaults
          setSettings(DEFAULT_SETTINGS);
        }
      } catch (err) {
        console.error("Error fetching site settings:", err);
        setSettings(DEFAULT_SETTINGS);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  return { settings, loading, error };
}
