"use client";

import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsApi, Event } from "@/lib/api";
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
  Users,
  Calendar,
  MapPin,
  Video,
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

export function AdminEventsCMS() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch events from API
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: () => eventsApi.admin.getAll(),
  });

  // Fetch event categories
  const { data: categoriesData } = useQuery({
    queryKey: ["event-categories"],
    queryFn: () => eventsApi.getCategories(),
  });

  const categories = categoriesData?.data || [];

  const events: any[] = Array.isArray(eventsData?.data) 
    ? eventsData.data 
    : (Array.isArray((eventsData?.data as any)?.results) ? (eventsData?.data as any).results : []);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    start_time: "",
    end_time: "",
    location: "",
    is_virtual: false,
    speaker: "",
    image: null as File | null,
  });

  const filteredEvents = events.filter(
    (event) => {
      const categoryName = typeof event.category === "object" ? event.category?.name : String(event.category);
      return event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        categoryName?.toLowerCase().includes(searchQuery.toLowerCase());
    }
  );

  // Mutations for CRUD operations
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown> & { image?: File | null }) => {
      if (data.image) {
        const formDataToSend = new FormData();
        Object.keys(data).forEach((key) => {
          const value = data[key];
          if (key === 'image' && value instanceof File) {
            formDataToSend.append('image', value);
          } else if (value !== null && value !== undefined) {
            formDataToSend.append(key, String(value));
          }
        });
        return eventsApi.admin.create(formDataToSend);
      }
      return eventsApi.admin.create(data as Partial<Event>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    },
    onError: (error: any) => {
      console.error('Event creation error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create event",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsCreateOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "",
        date: "",
        start_time: "",
        end_time: "",
        location: "",
        is_virtual: false,
        speaker: "",
        image: null,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      eventsApi.admin.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Event update error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update event",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Cleanup happens automatically - toast shown in success/error
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.admin.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Event deletion error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete event",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Cleanup happens automatically - toast shown in success/error
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, currentStatus }: { id: string; currentStatus: boolean }) =>
      eventsApi.admin.togglePublish(id, currentStatus),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      const isPublished = response.data?.is_published;
      toast({
        title: "Success",
        description: `Event ${isPublished ? 'published' : 'unpublished'} successfully`,
      });
    },
    onError: (error: any) => {
      console.error('Event publish toggle error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to toggle publish status",
        variant: "destructive",
      });
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

    if (!formData.date) {
      toast({
        title: "Validation Error",
        description: "Date is required",
        variant: "destructive",
      });
      return;
    }

    // Generate slug from title
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Map form data to API structure
    const createData = {
      title: formData.title,
      slug,
      category_id: formData.category, // Map to category_id (correct)
      description: formData.description,
      modality: formData.is_virtual ? 'virtual' : 'in_person',
      start_date: `${formData.date}T${formData.start_time || '09:00'}:00`,
      end_date: `${formData.date}T${formData.end_time || '10:00'}:00`,
      timezone: 'Africa/Dar_es_Salaam',
      location_name: formData.is_virtual ? 'Online' : formData.location,
      location_address: formData.is_virtual ? null : formData.location,
      virtual_link: formData.is_virtual ? formData.location : null,
      what_to_bring: formData.speaker || null, // Keep mapping (what_to_bring is correct field)
      is_published: true,
      is_featured: false,
      image: null,
    };

    createMutation.mutate(createData as any);
  };

  const handleTogglePublish = (id: string, currentStatus: boolean) => {
    togglePublishMutation.mutate({ id, currentStatus });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading events...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Events</h2>
          <p className="text-gray-500">Create and manage workshops and events</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Schedule a workshop, Q&A session, or support group
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the event"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Enter location or Zoom link"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_virtual"
                  checked={formData.is_virtual}
                  onChange={(e) =>
                    setFormData({ ...formData, is_virtual: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="is_virtual">This is a virtual event</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="speaker">Speaker / Host</Label>
                <Input
                  id="speaker"
                  value={formData.speaker}
                  onChange={(e) =>
                    setFormData({ ...formData, speaker: e.target.value })
                  }
                  placeholder="Enter speaker name and title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_image">Event Image</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="event_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        image: e.target.files?.[0] || null 
                      })
                    }
                    className="cursor-pointer"
                  />
                  {formData.image && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600">
                      <Image className="h-4 w-4" />
                      {formData.image.name}
                    </div>
                  )}
                </div>
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
                  Create Event
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
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Video className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Virtual Events</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.filter((e) => e.is_virtual || e.modality === "virtual").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Badge
                  variant={(() => {
                    const categoryName = typeof event.category === "object" ? event.category?.name : String(event.category);
                    if (categoryName === "Workshop") return "default";
                    if (categoryName === "Live Q&A") return "secondary";
                    return "outline";
                  })()}
                >
                  {typeof event.category === "object" ? event.category?.name : event.category}
                </Badge>
                <Badge
                  variant={(event.is_published) ? "success" : "secondary"}
                >
                  {event.is_published ? "published" : "draft"}
                </Badge>
              </div>
              <CardTitle className="text-lg mt-2">{event.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {event.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(event.date || event.start_datetime || "")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {event.start_time || ""} - {event.end_time || ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {(event.is_virtual || event.modality === "virtual") ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  <span>{event.location}</span>
                </div>
              </div>
            </CardContent>
            <div className="p-4 pt-0 flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                variant={event.is_published ? "outline" : "default"}
                onClick={() => handleTogglePublish(event.id, event.is_published)}
                disabled={togglePublishMutation.isPending}
              >
                {togglePublishMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {event.is_published ? "Unpublish" : "Publish"}
              </Button>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(event.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
