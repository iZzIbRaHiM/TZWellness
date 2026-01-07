/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode for better React practices
  reactStrictMode: true,

  // Optimize for production builds
  poweredByHeader: false,

  // Image optimization configuration
  images: {
    // Use remotePatterns for better security and control
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/**",
      },
      // Add your backend domain for media files
      {
        protocol: "https",
        hostname: "**.tzwellnesshealth.com",
        pathname: "/**",
      },
      // Allow any HTTPS images (can be tightened further for security)
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
    ],
    // Disable localhost in production
    ...(process.env.NODE_ENV === "development" && {
      remotePatterns: [
        {
          protocol: "http",
          hostname: "localhost",
          port: "8000",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "**",
          pathname: "/**",
        },
      ],
    }),
    // Optimize image formats
    formats: ["image/avif", "image/webp"],
    // Minimize external image requests
    minimumCacheTTL: 60,
  },

  // API rewrites to proxy backend requests
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    // Only enable rewrites if API URL is properly configured
    if (!apiUrl || apiUrl.includes("localhost")) {
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "⚠️ WARNING: NEXT_PUBLIC_API_URL is not configured for production!"
        );
      }
    }

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl || "http://localhost:8000"}/api/:path*`,
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // TypeScript and ESLint configuration for builds
  // Set to false to enforce strict builds (recommended)
  // Set to true only temporarily to unblock deployment
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
};

module.exports = nextConfig;
