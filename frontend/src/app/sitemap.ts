import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tz-wellness-health.vercel.app";
  
  // Create Supabase client with environment variables
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Static routes
  const routes = [
    "",
    "/services",
    "/blog",
    "/events",
    "/appointments",
    "/appointments/lookup",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Fetch dynamic services from database
  const { data: services } = await supabase
    .from("services")
    .select("slug, updated_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const serviceRoutes = (services || []).map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: new Date(service.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Fetch dynamic blog posts from database
  const { data: blogPosts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  const blogRoutes = (blogPosts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Fetch dynamic events from database
  const { data: events } = await supabase
    .from("events")
    .select("slug, updated_at")
    .eq("is_active", true)
    .order("start_date", { ascending: false });

  const eventRoutes = (events || []).map((event) => ({
    url: `${baseUrl}/events/${event.slug}`,
    lastModified: new Date(event.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...routes, ...serviceRoutes, ...blogRoutes, ...eventRoutes];
}
