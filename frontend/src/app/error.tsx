"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, Phone, ChevronDown } from "lucide-react";

/**
 * Error Boundary Component
 * 
 * Catches errors in route segments and provides recovery options.
 * Logs errors for debugging and reporting.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Log error with context
    console.error("[Route Error]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });

    // TODO: Send to Sentry when configured
    // captureException(error);
  }, [error]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      reset();
    } finally {
      // Small delay to show loading state
      setTimeout(() => setIsRetrying(false), 500);
    }
  };

  // Determine if this is a network error
  const isNetworkError = 
    error.message?.toLowerCase().includes("network") ||
    error.message?.toLowerCase().includes("fetch");

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-sand-50 py-16 px-4">
      <div className="max-w-lg w-full text-center">
        {/* Error Icon */}
        <div className="mx-auto w-20 h-20 mb-8 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-emerald-950 mb-4">
          {isNetworkError ? "Connection Issue" : "Something went wrong"}
        </h1>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {isNetworkError
            ? "We couldn't connect to our servers. Please check your internet connection and try again."
            : "We apologize for the inconvenience. Please try again or contact us if the problem persists."}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button 
            onClick={handleRetry} 
            variant="default"
            disabled={isRetrying}
            className="gap-2"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Try Again
              </>
            )}
          </Button>
          
          <Button asChild variant="outline" className="gap-2">
            <a href="/">
              <Home className="h-4 w-4" />
              Go Home
            </a>
          </Button>
          
          <Button asChild variant="ghost" className="gap-2">
            <a href="tel:+1234567890">
              <Phone className="h-4 w-4" />
              Call for Help
            </a>
          </Button>
        </div>

        {/* Error Details (Development/Debug) */}
        {error.digest && (
          <div className="text-sm text-gray-400">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 mx-auto hover:text-gray-600 transition-colors"
            >
              Error Details
              <ChevronDown 
                className={`h-4 w-4 transition-transform ${showDetails ? "rotate-180" : ""}`} 
              />
            </button>
            
            {showDetails && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
                <p className="font-mono text-xs break-all">
                  <span className="text-gray-600">ID:</span> {error.digest}
                </p>
                {process.env.NODE_ENV === "development" && error.message && (
                  <p className="font-mono text-xs break-all mt-2">
                    <span className="text-gray-600">Message:</span> {error.message}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
