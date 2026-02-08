import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TZ Wellness Health | Nurturing Our Health Through Metabolic Care",
    template: "%s | TZ Wellness Health",
  },
  description:
    "Expert metabolic and chronic disease management. Specializing in diabetes, thyroid disorders, PCOS, and obesity care with personalized treatment plans and lifestyle medicine.",
  keywords: [
    "diabetes management",
    "thyroid care",
    "PCOS treatment",
    "obesity management",
    "metabolic health",
    "chronic disease",
    "lifestyle medicine",
    "nutrition counseling",
    "prediabetes",
    "weight management",
  ],
  authors: [{ name: "TZ Wellness" }],
  creator: "TZ Wellness",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 
    "https://tzwellnesscentre.com"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "TZ Wellness Health",
    title: "TZ Wellness Health | Nurturing Our Health Through Metabolic Care",
    description:
      "Expert metabolic and chronic disease management. Specializing in diabetes, thyroid, PCOS, and obesity care.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TZ Wellness",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TZ Wellness Health | Nurturing Our Health Through Metabolic Care",
    description:
      "Expert metabolic and chronic disease management. Specializing in diabetes, thyroid, PCOS, and obesity care.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cormorant.variable} ${jakarta.variable} min-h-screen flex flex-col`}
      >
        <Providers>
          {/* Skip link for accessibility */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
