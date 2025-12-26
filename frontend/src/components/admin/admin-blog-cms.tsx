"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  FileText,
  Calendar,
  Clock,
  Loader2,
  Image,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const categories = ["Health Tips", "Nutrition", "Stress", "Motivation"];

export function AdminBlogCMS() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch posts from API
  const { data: postsData, isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: () => blogApi.admin.getAll(),
  });

  const posts = postsData?.data || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<(typeof posts)[0] | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    category: "Health Tips",
    content: "",
    featured_image: null as File | null,
  });

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mutations for CRUD operations
  const createMutation = useMutation({
    mutationFn: (data: { title: string; excerpt: string; content: string; category: string; featured_image?: File | null }) => {
      const formDataToSend = new FormData();
      formDataToSend.append("title", data.title);
      formDataToSend.append("excerpt", data.excerpt);
      formDataToSend.append("content", data.content);
      formDataToSend.append("category", data.category);
      if (data.featured_image) {
        formDataToSend.append("featured_image", data.featured_image);
      }
      return blogApi.admin.create(formDataToSend);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create blog post",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsCreateOpen(false);
      setFormData({ title: "", excerpt: "", category: "Health Tips", content: "", featured_image: null });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ is_published: boolean }> }) =>
      blogApi.admin.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update blog post",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Cleanup happens automatically - toast shown in success/error
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => blogApi.admin.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Cleanup happens automatically - toast shown in success/error
    },
  });

  const handleCreate = () => {
    createMutation.mutate({
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      category: formData.category,
      featured_image: formData.featured_image,
    });
  };

  const handlePublish = (id: number) => {
    updateMutation.mutate({ id, data: { is_published: true } });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading posts...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blog Posts</h2>
          <p className="text-gray-500">Create and manage blog content</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Blog Post</DialogTitle>
              <DialogDescription>
                Write a new article for your health blog
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter post title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder="Brief description of the post"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="featured_image">Featured Image</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="featured_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        featured_image: e.target.files?.[0] || null 
                      })
                    }
                    className="cursor-pointer"
                  />
                  {formData.featured_image && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600">
                      <Image className="h-4 w-4" />
                      {formData.featured_image.name}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Write your blog post content here..."
                  rows={10}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleCreate} 
                  className="flex-1"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Save as Draft
                </Button>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <FileText className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Published</p>
              <p className="text-2xl font-bold text-gray-900">
                {posts.filter((p) => p.status === "published").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Edit className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">
                {posts.filter((p) => p.status === "draft").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Post
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Views
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {post.title}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {post.excerpt}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{post.category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          post.status === "published" ? "success" : "secondary"
                        }
                      >
                        {post.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {post.published_at ? formatDate(post.published_at) : "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{post.views}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {post.status === "draft" && (
                          <Button
                            size="sm"
                            onClick={() => handlePublish(post.id)}
                            disabled={updateMutation.isPending}
                          >
                            {updateMutation.isPending && (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Publish
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(post.id)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
