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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  logBlogCreate,
  logBlogUpdate,
  logBlogDelete,
  logBlogPublish,
} from "@/lib/admin-activity-logger";

export function AdminBlogCMS() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { adminUser } = useAdminAuth();

  // Fetch posts from API
  const { data: postsData, isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: () => blogApi.admin.getAll(),
  });

  // Fetch blog categories
  const { data: categoriesData } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: () => blogApi.getCategories(),
  });

  const categories = categoriesData?.data || [];

  const posts: any[] = Array.isArray(postsData?.data) 
    ? postsData.data 
    : (Array.isArray((postsData?.data as any)?.results) ? (postsData?.data as any).results : []);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<(typeof posts)[0] | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<(typeof posts)[0] | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    category: "",
    content: "",
    featured_image: null as File | null,
  });

  const filteredPosts = posts.filter(
    (post) => {
      const categoryName = typeof post.category === "object" ? post.category?.name : String(post.category);
      return post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        categoryName?.toLowerCase().includes(searchQuery.toLowerCase());
    }
  );

  // Mutations for CRUD operations
  const createMutation = useMutation({
    mutationFn: (formDataToSend: FormData) => {
      return blogApi.admin.create(formDataToSend);
    },
    onSuccess: async (response) => {
      // Log activity
      if (adminUser && response.data?.id && response.data?.title) {
        await logBlogCreate(adminUser.id, response.data.id, response.data.title);
      }
      
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
    },
    onError: (error: any) => {
      console.error('Blog creation error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create blog post",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsCreateOpen(false);
      setFormData({ title: "", excerpt: "", category: "", content: "", featured_image: null });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ is_published: boolean }> }) =>
      blogApi.admin.update(id, data),
    onSuccess: async (response, variables) => {
      // Log activity
      if (adminUser) {
        const post = posts.find(p => p.id === variables.id);
        if (post) {
          if (variables.data.is_published) {
            await logBlogPublish(adminUser.id, post.id, post.title);
          } else {
            await logBlogUpdate(adminUser.id, post.id, post.title);
          }
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Blog update error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update blog post",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsEditOpen(false);
      setEditingPost(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogApi.admin.delete(id),
    onSuccess: async (_, postId) => {
      // Log activity
      if (adminUser && postToDelete) {
        await logBlogDelete(adminUser.id, postId, postToDelete.title);
      }
      
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Blog deletion error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete blog post",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeleteConfirmOpen(false);
      setPostToDelete(null);
    },
  });

  const handleCreate = () => {
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Category is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Content is required",
        variant: "destructive",
      });
      return;
    }

    // Generate slug from title
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create FormData with proper field mapping
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("slug", slug);
    formDataToSend.append("category", formData.category); // API extracts this as category_id
    formDataToSend.append("excerpt", formData.excerpt);
    formDataToSend.append("content", formData.content);
    
    if (formData.featured_image) {
      formDataToSend.append("featured_image", formData.featured_image);
    }

    createMutation.mutate(formDataToSend as any);
  };

  const handlePublish = (id: string) => {
    updateMutation.mutate({ id, data: { is_published: true } });
  };

  const handleDeleteClick = (post: (typeof posts)[0]) => {
    setPostToDelete(post);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (postToDelete) {
      deleteMutation.mutate(postToDelete.id);
    }
  };

  const handleEditClick = (post: (typeof posts)[0]) => {
    setEditingPost(post);
    setFormData({
      title: post.title || "",
      excerpt: post.excerpt || "",
      category: post.blog_category?.id || "",
      content: post.content || "",
      featured_image: null,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingPost) return;

    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    const updateData: any = {
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      category_id: formData.category,
    };

    updateMutation.mutate({ id: editingPost.id, data: updateData });
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
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter post title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Write your blog post content here..."
                  rows={10}
                  required
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
                  Create Post
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
                          {post.excerpt || "No excerpt"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{typeof post.category === "object" ? post.category?.name : post.category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          (post.status === "published" || post.is_published) ? "success" : "secondary"
                        }
                      >
                        {post.status || (post.is_published ? "published" : "draft")}
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
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditClick(post)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteClick(post)}
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

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>
              Update the blog post details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                placeholder="Blog post title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-excerpt">Excerpt</Label>
              <Textarea
                id="edit-excerpt"
                placeholder="Brief summary of the post"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Content *</Label>
              <Textarea
                id="edit-content"
                placeholder="Main content of the blog post"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button 
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Post
              </Button>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{postToDelete?.title}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
