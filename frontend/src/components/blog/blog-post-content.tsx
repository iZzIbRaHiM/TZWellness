"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  User,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  ArrowLeft,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface BlogPostContentProps {
  post: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    author: {
      name: string;
      bio: string;
      image: string;
    };
    published_at: string;
    updated_at: string;
    read_time: number;
    featured_image: string;
    tags: string[];
  };
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  const shareUrl = `https://tfwellfare.com/blog/${post.slug}`;

  const handleShare = (platform: string) => {
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    };
    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  // Parse markdown-like content into sections
  const parseContent = (content: string) => {
    const sections = content.split("\n\n").filter(Boolean);
    return sections.map((section, i) => {
      if (section.startsWith("## ")) {
        return (
          <h2
            key={i}
            className="font-serif text-2xl font-bold text-emerald-950 mt-8 mb-4"
          >
            {section.replace("## ", "")}
          </h2>
        );
      }
      if (section.startsWith("### ")) {
        return (
          <h3 key={i} className="font-semibold text-lg text-emerald-900 mt-6 mb-3">
            {section.replace("### ", "")}
          </h3>
        );
      }
      if (section.startsWith("- ") || section.includes("\n- ")) {
        const items = section.split("\n").filter((s) => s.startsWith("- "));
        return (
          <ul key={i} className="list-disc list-inside space-y-2 my-4">
            {items.map((item, j) => (
              <li key={j} className="text-gray-700">
                {item.replace("- ", "").replace(/\*\*/g, "")}
              </li>
            ))}
          </ul>
        );
      }
      if (section.match(/^\d\./)) {
        const items = section.split("\n").filter((s) => s.match(/^\d\./));
        return (
          <ol key={i} className="list-decimal list-inside space-y-2 my-4">
            {items.map((item, j) => (
              <li key={j} className="text-gray-700">
                {item.replace(/^\d\.\s*/, "").replace(/\*\*/g, "")}
              </li>
            ))}
          </ol>
        );
      }
      if (section.startsWith("---")) {
        return <Separator key={i} className="my-8" />;
      }
      if (section.startsWith("*") && section.endsWith("*")) {
        return (
          <p key={i} className="text-gray-600 italic my-4">
            {section.replace(/^\*|\*$/g, "").replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => text)}
          </p>
        );
      }
      return (
        <p key={i} className="text-gray-700 leading-relaxed my-4">
          {section.replace(/\*\*([^*]+)\*\*/g, "$1")}
        </p>
      );
    });
  };

  return (
    <article className="max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to all articles
      </Link>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Badge className="mb-4">{post.category}</Badge>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-emerald-950 mb-4">
          {post.title}
        </h1>
        <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center">
              <User className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{post.author.name}</p>
              <p className="text-xs">{post.author.bio}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(post.published_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{post.read_time} min read</span>
          </div>
        </div>
      </motion.header>

      {/* Featured image placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative h-64 sm:h-80 bg-emerald-100 rounded-xl mb-8 flex items-center justify-center"
      >
        <span className="text-8xl">📖</span>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="prose prose-emerald max-w-none"
      >
        {parseContent(post.content)}
      </motion.div>

      {/* Tags */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-2 mt-8 pt-8 border-t"
      >
        {post.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            #{tag}
          </Badge>
        ))}
      </motion.div>

      {/* Share */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-4 mt-8 p-6 bg-white rounded-xl border"
      >
        <Share2 className="h-5 w-5 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Share this article:</span>
        <div className="flex gap-2">
          <button
            onClick={() => handleShare("facebook")}
            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            aria-label="Share on Facebook"
          >
            <Facebook className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleShare("twitter")}
            className="p-2 rounded-lg bg-sky-100 text-sky-600 hover:bg-sky-200 transition-colors"
            aria-label="Share on Twitter"
          >
            <Twitter className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleShare("linkedin")}
            className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
            aria-label="Share on LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </button>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-8 bg-emerald-900 rounded-xl text-white text-center"
      >
        <h3 className="font-serif text-2xl font-bold mb-3">
          Need Personalized Guidance?
        </h3>
        <p className="text-emerald-100 mb-6">
          Our specialists can help you create a customized plan for your health goals.
        </p>
        <Button asChild variant="cta" size="lg">
          <Link href="/book">Book a Consultation</Link>
        </Button>
      </motion.div>
    </article>
  );
}
