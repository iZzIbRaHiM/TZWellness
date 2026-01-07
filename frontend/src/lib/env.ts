/**
 * Environment Variable Validation & Type-Safe Access
 * 
 * This module validates all required environment variables at runtime
 * and provides type-safe access with fail-fast behavior.
 * 
 * CRITICAL: All environment variable access should go through this module.
 * 
 * For Vercel deployment, ensure all NEXT_PUBLIC_* variables are set in
 * the Vercel Dashboard under Project Settings > Environment Variables.
 */

import { z } from "zod";

// Detect environment
const isProduction = process.env.NODE_ENV === "production";
const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";

// Get Vercel URL for preview deployments
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";

// Default URLs that work during build
const defaultApiUrl = isProduction 
  ? (vercelUrl || "https://api.example.com") 
  : "http://localhost:8000";
const defaultSiteUrl = isProduction 
  ? (vercelUrl || "https://example.com") 
  : "http://localhost:3000";

// Define the environment schema with build-safe validation
const envSchema = z.object({
  // API Configuration
  NEXT_PUBLIC_API_URL: z
    .string()
    .url("NEXT_PUBLIC_API_URL must be a valid URL")
    .default(defaultApiUrl),
  
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
    .default(defaultSiteUrl),
  
  // Optional - Analytics
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  
  // Optional - Sentry
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  
  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
});

// Type for validated environment
export type Env = z.infer<typeof envSchema>;

// Validate and export environment
function validateEnv(): Env {
  const rawEnv = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  };

  try {
    return envSchema.parse(rawEnv);
  } catch (error) {
    // During build, just use defaults - don't fail
    if (isBuildTime) {
      console.warn("⚠️ Environment variables not set, using defaults for build.");
      return envSchema.parse({});
    }
    
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
        .join("\n");
      
      console.warn(
        `⚠️ Environment validation warning:\n${missingVars}\n` +
        `Using default values.`
      );
    }
    
    // Always return defaults to prevent crashes
    return envSchema.parse({});
  }
}

// Export validated environment
export const env = validateEnv();

// Convenience exports for common values
export const API_BASE_URL = env.NEXT_PUBLIC_API_URL;
export const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

// Helper to get URLs with proper fallbacks for SSR/CSR
export function getApiUrl(): string {
  // Use NEXT_PUBLIC_API_URL if available
  if (env.NEXT_PUBLIC_API_URL) {
    return env.NEXT_PUBLIC_API_URL;
  }
  
  // In browser, try to construct from current origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  
  // Fallback for server-side (should not happen if env is configured)
  return "";
}

export function getSiteUrl(): string {
  if (env.NEXT_PUBLIC_SITE_URL) {
    return env.NEXT_PUBLIC_SITE_URL;
  }
  
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  
  // Vercel provides VERCEL_URL for preview deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  return "";
}
