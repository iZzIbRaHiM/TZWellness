import React from "react";
import Script from "next/script";

interface SchemaProps {
  schema: object;
}

function JsonLdScript({ schema }: SchemaProps) {
  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function MedicalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: "TF Wellfare Medical Clinic",
    description:
      "Holistic medical clinic specializing in metabolic health, diabetes management, thyroid care, PCOS treatment, and obesity management.",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    telephone: "+1-123-456-7890",
    email: "info@tfwellfare.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Medical Center Drive, Suite 100",
      addressLocality: "Healthcare City",
      addressRegion: "HC",
      postalCode: "12345",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 32.7767,
      longitude: -96.797,
    },
    openingHours: "Mo-Fr 08:00-18:00",
    priceRange: "$$",
    image: `${process.env.NEXT_PUBLIC_SITE_URL}/images/clinic.jpg`,
    medicalSpecialty: [
      "Endocrinology",
      "Internal Medicine",
      "Obesity Medicine",
      "Metabolic Medicine",
    ],
    availableService: [
      {
        "@type": "MedicalProcedure",
        name: "Diabetes Management",
        description: "Comprehensive diabetes care with personalized treatment plans",
      },
      {
        "@type": "MedicalProcedure",
        name: "Thyroid Care",
        description: "Expert diagnosis and treatment of thyroid disorders",
      },
      {
        "@type": "MedicalProcedure",
        name: "PCOS Treatment",
        description: "Holistic PCOS management addressing hormonal imbalances",
      },
      {
        "@type": "MedicalProcedure",
        name: "Obesity Management",
        description: "Medical weight loss programs with metabolic optimization",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "2000",
    },
  };

  return <JsonLdScript schema={schema} />;
}

export function PhysicianSchema({
  name,
  specialty,
  image,
  description,
}: {
  name: string;
  specialty: string;
  image?: string;
  description: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name,
    medicalSpecialty: specialty,
    image,
    description,
    worksFor: {
      "@type": "MedicalBusiness",
      name: "TF Wellfare Medical Clinic",
    },
  };

  return <JsonLdScript schema={schema} />;
}

export function ArticleSchema({
  title,
  description,
  image,
  author,
  datePublished,
  dateModified,
  url,
}: {
  title: string;
  description: string;
  image?: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  url: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "TF Wellfare Medical Clinic",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
    datePublished,
    dateModified: dateModified || datePublished,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return <JsonLdScript schema={schema} />;
}

export function EventSchema({
  name,
  description,
  startDate,
  endDate,
  location,
  image,
  isVirtual,
  url,
  price,
}: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
  image?: string;
  isVirtual: boolean;
  url: string;
  price?: number;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    description,
    startDate,
    endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: isVirtual
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    location: isVirtual
      ? {
          "@type": "VirtualLocation",
          url,
        }
      : {
          "@type": "Place",
          name: location,
          address: {
            "@type": "PostalAddress",
            streetAddress: "123 Medical Center Drive",
            addressLocality: "Healthcare City",
          },
        },
    image,
    organizer: {
      "@type": "Organization",
      name: "TF Wellfare Medical Clinic",
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
    offers: price
      ? {
          "@type": "Offer",
          price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url,
        }
      : {
          "@type": "Offer",
          price: 0,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url,
        },
  };

  return <JsonLdScript schema={schema} />;
}

export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return <JsonLdScript schema={schema} />;
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLdScript schema={schema} />;
}
