"use client";

import { useEffect, useState, useCallback } from "react";
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
 * Formats phone number to WhatsApp-compatible format
 * Handles various input formats: +923325858314, 923325858314, 03325858314, (332) 585-8314
 */
function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return "";
  
  // Remove all non-digits
  let digits = phone.replace(/\D/g, "");
  
  // If starts with 0 (like 03325858314), remove it and add country code
  if (digits.startsWith("0")) {
    digits = "92" + digits.substring(1); // Pakistan country code
  }
  
  // If doesn't start with country code, assume Pakistan
  if (!digits.startsWith("92") && digits.length === 10) {
    digits = "92" + digits;
  }
  
  return digits;
}

/**
 * Hook to fetch public site settings from admin_settings table
 * Falls back to default values if no settings are configured
 * Supports real-time updates and manual refresh
 */
export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchSettings = useCallback(async (force = false) => {
    // Prevent rapid refetches unless forced
    const now = Date.now();
    if (!force && now - lastFetch < 5000) {
      return; // Skip if fetched within last 5 seconds
    }

    try {
      if (!force) setLoading(true);
      const supabase = createClient();

      // Fetch the first admin user's clinic settings (public info)
      const { data, error: fetchError } = await supabase
        .from("admin_settings")
        .select("clinic_name, clinic_email, clinic_phone, clinic_address, business_hours, updated_at")
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error("Failed to fetch site settings:", fetchError);
        setSettings(DEFAULT_SETTINGS);
        setError(fetchError);
        return;
      }

      if (data) {
        // Format phone for WhatsApp - handles multiple formats
        const waNumber = formatPhoneForWhatsApp(data.clinic_phone || "");
        const phoneHref = waNumber ? `tel:+${waNumber}` : DEFAULT_SETTINGS.clinic_phone_href;

        const newSettings = {
          clinic_name: data.clinic_name || DEFAULT_SETTINGS.clinic_name,
          clinic_email: data.clinic_email || DEFAULT_SETTINGS.clinic_email,
          clinic_phone: data.clinic_phone || DEFAULT_SETTINGS.clinic_phone,
          clinic_phone_href: phoneHref,
          clinic_email_href: `mailto:${data.clinic_email || DEFAULT_SETTINGS.clinic_email}`,
          clinic_address: data.clinic_address,
          business_hours: data.business_hours,
        };

        setSettings(newSettings);
        setLastFetch(now);
        console.log("[useSiteSettings] Loaded settings:", {
          phone: data.clinic_phone,
          formatted: waNumber,
          href: phoneHref,
        });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (err) {
      console.error("Error fetching site settings:", err);
      setSettings(DEFAULT_SETTINGS);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [lastFetch]);

  useEffect(() => {
    const supabase = createClient();
    fetchSettings();

    // Subscribe to real-time updates on admin_settings table
    const channel = supabase
      .channel("admin_settings_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "admin_settings",
        },
        (payload) => {
          console.log("[useSiteSettings] Settings updated in database, refetching...");
          fetchSettings(true); // Force refetch
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      channel.unsubscribe();
    };
  }, [fetchSettings]);

  return { settings, loading, error, refetch: () => fetchSettings(true) };
}
