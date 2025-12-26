"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

// Featured blog posts for homepage
const featuredPosts = [
  {
    id: 1,
    title: "Understanding Blood Sugar: A Complete Guide",
    slug: "understanding-blood-sugar-complete-guide",
    excerpt:
      "Learn how blood sugar works, what affects it, and how to keep it in a healthy range for optimal energy and wellbeing.",
    category: "Health Tips",
    published_at: "2024-01-15",
    read_time: 8,
    featured_image: "/images/blog/blood-sugar.jpg",
  },
  {
    id: 2,
    title: "10 Thyroid-Friendly Foods to Add to Your Diet",
    slug: "thyroid-friendly-foods-diet",
    excerpt:
      "Discover the best foods to support thyroid function and boost your metabolism naturally.",
    category: "Nutrition",
    published_at: "2024-01-12",
    read_time: 6,
    featured_image: "/images/blog/thyroid-foods.jpg",
  },
  {
    id: 3,
    title: "Managing PCOS Naturally: Lifestyle Changes That Work",
    slug: "managing-pcos-naturally-lifestyle",
    excerpt:
      "Evidence-based lifestyle modifications that can help manage PCOS symptoms effectively.",
    category: "Health Tips",
    published_at: "2024-01-10",
    read_time: 10,
    featured_image: "/images/blog/pcos-lifestyle.jpg",
  },
];

export function BlogSection() {
  return (
    <section className="py-20 bg-sand-100">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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

        {/* Blog Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {featuredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
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
                      {post.category}
                    </Badge>
                  </div>

                  {/* Content */}
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl line-clamp-2 hover:text-emerald-700 transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {post.excerpt}
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
                        <span>{post.read_time} min read</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
