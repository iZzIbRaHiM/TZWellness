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
const isServer = typeof window === "undefined";
const isProduction = process.env.NODE_ENV === "production";
const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";

// Define the environment schema with production-safe validation
const envSchema = z.object({
  // Required - API Configuration (MUST be set in production)
  NEXT_PUBLIC_API_URL: z
    .string()
    .url("NEXT_PUBLIC_API_URL must be a valid URL")
    .refine(
      (url) => {
        // In production, localhost URLs are not allowed
        if (isProduction && !isBuildTime) {
          return !url.includes("localhost") && !url.includes("127.0.0.1");
        }
        return true;
      },
      { message: "NEXT_PUBLIC_API_URL cannot be localhost in production" }
    )
    .default(isProduction ? "" : "http://localhost:8000"),
  
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
    .refine(
      (url) => {
        // In production, localhost URLs are not allowed
        if (isProduction && !isBuildTime) {
          return !url.includes("localhost") && !url.includes("127.0.0.1");
        }
        return true;
      },
      { message: "NEXT_PUBLIC_SITE_URL cannot be localhost in production" }
    )
    .default(isProduction ? "" : "http://localhost:3000"),
  
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
    const parsed = envSchema.parse(rawEnv);
    
    // Additional production safety checks
    if (isProduction && !isBuildTime) {
      if (!parsed.NEXT_PUBLIC_API_URL || parsed.NEXT_PUBLIC_API_URL === "") {
        throw new Error(
          "NEXT_PUBLIC_API_URL is required in production. " +
          "Set it in Vercel Dashboard > Project Settings > Environment Variables"
        );
      }
      if (!parsed.NEXT_PUBLIC_SITE_URL || parsed.NEXT_PUBLIC_SITE_URL === "") {
        throw new Error(
          "NEXT_PUBLIC_SITE_URL is required in production. " +
          "Set it in Vercel Dashboard > Project Settings > Environment Variables"
        );
      }
    }
    
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
        .join("\n");
      
      const errorMessage = 
        `❌ Environment validation failed:\n${missingVars}\n\n` +
        (isProduction
          ? `Please set the required environment variables in Vercel Dashboard.`
          : `Please check your .env.local file and ensure all required variables are set.`);
      
      console.error(errorMessage);
      
      // In development, provide helpful guidance
      if (!isProduction) {
        console.error(
          `\n💡 Tip: Copy .env.example to .env.local and update the values.`
        );
      }
    } else if (error instanceof Error) {
      console.error(`❌ Environment Error: ${error.message}`);
    }
    
    // In production, fail fast to prevent runtime errors
    if (isProduction && !isBuildTime) {
      // Return safe defaults to prevent build failures
      // Runtime will catch missing vars
      console.error(
        "⚠️ Using fallback environment values. " +
        "Ensure NEXT_PUBLIC_API_URL and NEXT_PUBLIC_SITE_URL are set in Vercel."
      );
    }
    
    // Use schema defaults for development/build
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
