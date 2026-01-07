/**
 * Centralized navigation configuration
 * This file maintains all navigation links used throughout the application
 * including header menus, footer links, and breadcrumbs.
 * 
 * IMPORTANT: When adding new services or resources to the backend:
 * 1. Add the service/resource to the database via Django admin
 * 2. Update the corresponding arrays in this file
 * 3. Ensure slugs match between backend and frontend
 */

export interface NavLink {
  name: string;
  href: string;
}

export interface NavItemWithChildren extends NavLink {
  children?: NavLink[];
}

/**
 * SERVICES CONFIGURATION
 * Update this when adding new services to the backend
 * Must match Service model slugs in backend/apps/services/models.py
 */
export const SERVICES: NavLink[] = [
  { name: "Diabetes Management", href: "/services/diabetes-management" },
  { name: "Thyroid Care", href: "/services/thyroid-care" },
  { name: "PCOS Treatment", href: "/services/pcos-treatment" },
  { name: "Obesity Management", href: "/services/obesity-management" },
  { name: "Metabolic Health Check", href: "/services/metabolic-health-check" },
];

/**
 * RESOURCES CONFIGURATION
 * Update this when adding new resource pages
 * These are frontend-only pages, not database-driven
 */
export const RESOURCES: NavLink[] = [
  { name: "New Patient Guide", href: "/resources#new-patient-guide" },
  { name: "Payment Information", href: "/resources#payment-information" },
  { name: "Telehealth Prep", href: "/resources#telehealth-prep" },
  { name: "Pre-Visit Checklist", href: "/resources#pre-visit-checklist" },
  { name: "FAQs", href: "/resources#faqs" },
];

/**
 * MAIN NAVIGATION
 * Used in the header/navbar
 */
export const MAIN_NAVIGATION: NavItemWithChildren[] = [
  { name: "Home", href: "/" },
  {
    name: "Services",
    href: "/services",
    children: [
      ...SERVICES,
      { name: "View All Services", href: "/services" },
    ],
  },
  { name: "Events", href: "/events" },
  { name: "Blog", href: "/blog" },
  { name: "Resources", href: "/resources" },
  { name: "About", href: "/about" },
];

/**
 * FOOTER NAVIGATION
 * Organized by sections
 */
export const FOOTER_LINKS = {
  services: SERVICES,
  resources: RESOURCES,
  company: [
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Events", href: "/events" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/legal/privacy-policy" },
    { name: "Terms of Use", href: "/legal/terms-of-use" },
    { name: "Refund Policy", href: "/legal/refund-policy" },
    { name: "Telehealth Consent", href: "/legal/telehealth-consent" },
    { name: "HIPAA Notice", href: "/legal/hipaa-notice" },
  ],
} as const;

/**
 * SOCIAL MEDIA LINKS
 */
export const SOCIAL_LINKS = [
  { name: "Facebook", href: "https://facebook.com/tzwellnesshealth" },
  { name: "Twitter", href: "https://twitter.com/tzwellnesshealth" },
  { name: "Instagram", href: "https://instagram.com/tzwellnesshealth" },
  { name: "LinkedIn", href: "https://linkedin.com/company/tzwellnesshealth" },
] as const;

/**
 * CONTACT INFORMATION
 */
export const CONTACT_INFO = {
  phone: "(123) 456-7890",
  phoneHref: "tel:+1234567890",
  email: "info@tzwellnesshealth.com",
  emailHref: "mailto:info@tzwellnesshealth.com",
  address: {
    street: "123 Medical Center Drive",
    suite: "Suite 100",
    city: "Healthcare City, HC 12345",
  },
  hours: "Mon - Fri: 8:00 AM - 6:00 PM",
} as const;
