import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tfwellfare.com";

  // Static routes
  const routes = [
    "",
    "/services",
    "/blog",
    "/events",
    "/resources",
    "/book",
    "/appointments/lookup",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic service routes
  const services = [
    "diabetes-management",
    "weight-management",
    "thyroid-care",
    "heart-health",
    "preventive-care",
  ].map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Dynamic blog routes
  const blogPosts = [
    "understanding-blood-sugar-complete-guide",
    "healthy-eating-tips",
    "exercise-and-wellness",
  ].map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Dynamic event routes
  const events = [
    "diabetes-awareness-workshop",
    "healthy-cooking-class",
    "wellness-seminar",
  ].map((slug) => ({
    url: `${baseUrl}/events/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...routes, ...services, ...blogPosts, ...events];
}
