"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Clock, Calendar, ArrowRight, User, Loader2, AlertCircle } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { blogApi, BlogPost, BlogCategory, BlogTag } from "@/lib/api";

export function BlogGrid() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Fetch blog posts from API
  const { data: postsData, isLoading, isError } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: () => blogApi.getPosts(),
  });

  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: () => blogApi.getCategories(),
  });

  const blogPosts = postsData?.data?.results || [];
  const apiCategories = categoriesData?.data || [];
  const categories = ["All", ...apiCategories.map((cat: BlogCategory) => cat.name)];

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post: BlogPost) => {
      const matchesCategory =
        activeCategory === "All" || post.category?.name === activeCategory;
      const matchesSearch =
        debouncedSearch === "" ||
        post.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (post.tags && post.tags.some((tag: BlogTag) =>
          tag.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        ));
      return matchesCategory && matchesSearch;
    });
  }, [blogPosts, activeCategory, debouncedSearch]);

  const featuredPosts = filteredPosts.filter((p: BlogPost) => p.is_featured);
  const regularPosts = filteredPosts.filter((p: BlogPost) => !p.is_featured);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mb-3 text-emerald-600" />
        <p>Loading articles...</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-red-600">
        <AlertCircle className="h-12 w-12 mb-3" />
        <p className="font-semibold mb-1">Unable to load articles</p>
        <p className="text-sm text-gray-600">Please try again later</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search blog posts"
          />
        </div>

        {/* Category tabs */}
        <Tabs
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="w-full md:w-auto overflow-auto"
        >
          <TabsList className="flex w-full md:w-auto">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="whitespace-nowrap">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-6">
        Showing {filteredPosts.length} article{filteredPosts.length !== 1 && "s"}
        {debouncedSearch && ` for "${debouncedSearch}"`}
      </p>

      <AnimatePresence mode="popLayout">
        {/* Featured posts */}
        {featuredPosts.length > 0 && (
          <motion.div
            layout
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            {featuredPosts.map((post: BlogPost, index: number) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <BlogCard post={post} featured />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Regular posts - Masonry-style grid */}
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post: BlogPost, index: number) => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <BlogCard post={post} />
            </motion.div>
          ))}
        </motion.div>

        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-500 text-lg">
              No articles found matching your criteria.
            </p>
            <button
              onClick={() => {
                setActiveCategory("All");
                setSearchQuery("");
              }}
              className="text-emerald-600 hover:text-emerald-700 mt-2"
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface BlogCardProps {
  post: any;
  featured?: boolean;
}

function BlogCard({ post, featured = false }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card
        variant="interactive"
        className={cn("h-full overflow-hidden group", featured && "md:flex")}
      >
        {/* Image placeholder */}
        <div
          className={cn(
            "relative bg-gradient-to-br from-emerald-100 to-emerald-50 overflow-hidden",
            featured ? "md:w-2/5 h-48 md:h-auto" : "h-48"
          )}
        >
          <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
            📖
          </div>
          <Badge className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-emerald-800 hover:bg-white/90" variant="secondary">
            {post.category?.name || "Article"}
          </Badge>
        </div>

        <div className={cn("flex flex-col", featured && "md:w-3/5")}>
          <CardHeader className="pb-3">
            <CardTitle
              className={cn("line-clamp-2 group-hover:text-terracotta transition-colors duration-200", featured ? "text-xl" : "text-lg")}
            >
              {post.title}
            </CardTitle>
            <CardDescription className="line-clamp-2 text-emerald-700/70">
              {post.excerpt}
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-emerald-600/70 mb-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.published_at)}</span>
              </div>
              {post.read_time_minutes && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{post.read_time_minutes} min read</span>
                </div>
              )}
            </div>

            {/* Author */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-emerald-700" />
                </div>
                <span className="text-sm font-medium text-emerald-800">
                  {post.author_name || "Admin"}
                </span>
              </div>
              <ArrowRight className="h-5 w-5 text-emerald-600 group-hover:text-terracotta group-hover:translate-x-1 transition-all duration-200" />
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}
