/**
 * Simplified navigation configuration
 * Essential links only for TZ Wellness platform
 */

export interface NavLink {
  name: string;
  href: string;
}

/**
 * MAIN NAVIGATION
 * Simple, flat navigation structure
 */
export const MAIN_NAVIGATION: NavLink[] = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Book Appointment", href: "/appointments" },
  { name: "Events", href: "/events" },
  { name: "Blog", href: "/blog" },
];

/**
 * FOOTER NAVIGATION
 * Minimal footer links
 */
export const FOOTER_LINKS = {
  main: [
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Book Appointment", href: "/appointments" },
    { name: "Events", href: "/events" },
    { name: "Blog", href: "/blog" },
  ],
  account: [
    { name: "Check Appointment Status", href: "/appointments/lookup" },
    { name: "Admin Login", href: "/admin" },
  ],
} as const;

/**
 * SOCIAL MEDIA LINKS
 */
export const SOCIAL_LINKS = [
  { name: "Facebook", href: "https://www.facebook.com/profile.php?id=61584623106449" },
  { name: "Twitter", href: "https://twitter.com/tzwellness" },
  { name: "Instagram", href: "https://www.instagram.com/tzwellness_centre/" },
  { name: "LinkedIn", href: "https://linkedin.com/company/tzwellness" },
] as const;

/**
 * CONTACT INFORMATION
 */
export const CONTACT_INFO = {
  phone: "(555) 123-4567",
  phoneHref: "tel:+15551234567",
  email: "tzwellnesscentre0@gmail.com",
  emailHref: "mailto:tzwellnesscentre0@gmail.com",
  hours: "Mon - Fri: 9:00 AM - 5:00 PM",
} as const;
