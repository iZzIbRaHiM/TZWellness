"use client";

import { useEffect } from "react";

/**
 * Global Error Boundary
 * 
 * This catches errors in the root layout.
 * It must include its own HTML and body tags since
 * the root layout is not rendered when this fires.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error("[Global Error]", error);
    
    // TODO: Send to Sentry when configured
    // if (typeof window !== "undefined" && window.Sentry) {
    //   window.Sentry.captureException(error);
    // }
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          {/* Error Icon */}
          <div className="mx-auto w-16 h-16 mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Something went wrong
          </h1>
          
          <p className="text-gray-600 mb-6">
            We apologize for the inconvenience. An unexpected error has occurred.
            Our team has been notified.
          </p>

          {/* Error digest for support */}
          {error.digest && (
            <p className="text-xs text-gray-400 mb-6 font-mono">
              Error ID: {error.digest}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => reset()}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              Try Again
            </button>
            
            <a
              href="/"
              className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors inline-block"
            >
              Return Home
            </a>
            
            <a
              href="tel:+1234567890"
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
            >
              Need help? Call us
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
