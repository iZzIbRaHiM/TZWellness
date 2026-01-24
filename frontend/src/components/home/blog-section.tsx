"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, ArrowRight, Loader2, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { blogApi, BlogPost } from "@/lib/api";

// Fallback posts (used only if API fails or returns empty)
const fallbackPosts = [
  {
    id: 1,
    title: "Understanding Blood Sugar: A Complete Guide",
    slug: "understanding-blood-sugar-complete-guide",
    excerpt:
      "Learn how blood sugar works, what affects it, and how to keep it in a healthy range for optimal energy and wellbeing.",
    category: { name: "Health Tips" },
    published_at: "2024-01-15",
    read_time_minutes: 8,
    featured_image: null,
  },
  {
    id: 2,
    title: "10 Thyroid-Friendly Foods to Add to Your Diet",
    slug: "thyroid-friendly-foods-diet",
    excerpt:
      "Discover the best foods to support thyroid function and boost your metabolism naturally.",
    category: { name: "Nutrition" },
    published_at: "2024-01-12",
    read_time_minutes: 6,
    featured_image: null,
  },
  {
    id: 3,
    title: "Managing PCOS Naturally: Lifestyle Changes That Work",
    slug: "managing-pcos-naturally-lifestyle",
    excerpt:
      "Evidence-based lifestyle modifications that can help manage PCOS symptoms effectively.",
    category: { name: "Health Tips" },
    published_at: "2024-01-10",
    read_time_minutes: 10,
    featured_image: null,
  },
];

export function BlogSection() {
  // Fetch latest 3 featured blog posts from API
  const { data, isLoading, error } = useQuery({
    queryKey: ["blog-posts-home", "featured"],
    queryFn: async () => {
      const response = await blogApi.getPosts({ featured: true });
      if (!response.success || !response.data) {
        return { posts: [], count: 0 };
      }
      // Get latest 3 featured posts
      const featuredPosts = response.data.slice(0, 3);
      return { posts: featuredPosts, count: featuredPosts.length };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract posts with defensive handling
  const apiPosts = data?.posts || [];
  const hasApiPosts = apiPosts.length > 0;
  
  // Use API posts if available, otherwise use fallback
  const posts = hasApiPosts ? apiPosts : fallbackPosts.slice(0, 3);

  // Helper to get category name safely
  const getCategoryName = (post: any): string => {
    if (typeof post.category === "string") return post.category;
    if (post.category?.name) return post.category.name;
    return "Article";
  };

  // Helper to get read time safely
  const getReadTime = (post: any): number => {
    return post.read_time_minutes || post.read_time || 5;
  };

  return (
    <section className="py-20 bg-sand-100">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">
            Latest Articles
          </Badge>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-emerald-950 mb-4">
            Health Insights & Tips
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Expert advice and actionable insights to help you take control of your
            metabolic health
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        )}

        {/* Empty State - No Featured Blogs */}
        {!isLoading && posts.length === 0 && (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">No featured articles available at the moment.</p>
            <p className="text-gray-400 text-sm mt-2">Check back soon for new content!</p>
          </div>
        )}

        {/* Blog Cards Grid */}
        {!isLoading && posts.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {posts.map((post: any, index: number) => (
              <motion.div
                key={post.id}
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <Card variant="interactive" className="h-full overflow-hidden">
                    {/* Image */}
                    <div className="relative h-48 bg-gray-200">
                      {post.featured_image ? (
                        <Image
                          src={post.featured_image}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-4xl">📝</span>
                        </div>
                      )}
                      <Badge
                        variant="secondary"
                        className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm"
                      >
                        {getCategoryName(post)}
                      </Badge>
                    </div>

                    {/* Content */}
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl line-clamp-2 hover:text-emerald-700 transition-colors">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {post.excerpt || post.title}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(post.published_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{getReadTime(post)} min read</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <Button asChild size="lg" variant="outline">
            <Link href="/blog">
              View All Articles
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
