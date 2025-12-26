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
    default: "TF Wellfare Medical Clinic | Holistic Healthcare",
    template: "%s | TF Wellfare Medical Clinic",
  },
  description:
    "End Metabolic Frustration & Reboot Your Health — Book Your Personalized Consultation Today. Expert care for Diabetes, Thyroid, PCOS, and Metabolic Health.",
  keywords: [
    "medical clinic",
    "metabolic health",
    "diabetes care",
    "thyroid treatment",
    "PCOS specialist",
    "obesity management",
    "holistic healthcare",
    "wellness",
  ],
  authors: [{ name: "TF Wellfare Medical Clinic" }],
  creator: "TF Wellfare",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "TF Wellfare Medical Clinic",
    title: "TF Wellfare Medical Clinic | Holistic Healthcare",
    description:
      "End Metabolic Frustration & Reboot Your Health — Book Your Personalized Consultation Today.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TF Wellfare Medical Clinic",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TF Wellfare Medical Clinic | Holistic Healthcare",
    description:
      "End Metabolic Frustration & Reboot Your Health — Book Your Personalized Consultation Today.",
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
