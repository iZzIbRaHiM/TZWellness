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
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  logEventCreate,
  logEventUpdate,
  logEventDelete,
} from "@/lib/admin-activity-logger";

export function AdminEventsCMS() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { adminUser } = useAdminAuth();

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
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<(typeof events)[0] | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<(typeof events)[0] | null>(null);

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
    max_attendees: 30,
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
    onSuccess: async (response) => {
      // Log activity
      if (adminUser && response.data?.id && response.data?.title) {
        await logEventCreate(adminUser.id, response.data.id, response.data.title);
      }
      
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
        max_attendees: 30,
        speaker: "",
        image: null,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      eventsApi.admin.update(id, data),
    onSuccess: async (response, variables) => {
      // Log activity
      if (adminUser) {
        const event = events.find(e => e.id === variables.id);
        if (event) {
          await logEventUpdate(adminUser.id, event.id, event.title);
        }
      }
      
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
      setIsEditOpen(false);
      setEditingEvent(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.admin.delete(id),
    onSuccess: async (_, eventId) => {
      // Log activity
      if (adminUser && eventToDelete) {
        await logEventDelete(adminUser.id, eventId, eventToDelete.title);
      }
      
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
      setDeleteConfirmOpen(false);
      setEventToDelete(null);
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
      category_id: formData.category, // Map to category_id
      description: formData.description,
      modality: formData.is_virtual ? 'virtual' : 'in_person',
      start_date: `${formData.date}T${formData.start_time || '09:00'}:00`,
      end_date: `${formData.date}T${formData.end_time || '10:00'}:00`,
      timezone: 'Africa/Dar_es_Salaam',
      location_name: formData.is_virtual ? 'Online' : formData.location,
      location_address: formData.is_virtual ? null : formData.location,
      virtual_link: formData.is_virtual ? formData.location : null,
      max_participants: formData.max_attendees, // Map to max_participants
      what_to_bring: formData.speaker || null,
      is_published: true,
      is_featured: false,
      image: null,
    };

    createMutation.mutate(createData as any);
  };

  const handlePublish = (id: string) => {
    updateMutation.mutate({ id, data: { is_published: true } });
  };

  const handleDeleteClick = (event: (typeof events)[0]) => {
    setEventToDelete(event);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (eventToDelete) {
      deleteMutation.mutate(eventToDelete.id);
    }
  };

  const handleEditClick = (event: (typeof events)[0]) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || "",
      description: event.description || "",
      category: event.event_category?.id || event.category_id || "",
      date: event.date || "",
      start_time: event.start_time || "",
      end_time: event.end_time || "",
      location: event.location || "",
      is_virtual: event.is_virtual || false,
      max_attendees: event.max_attendees || 30,
      speaker: event.speaker || "",
      image: null,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingEvent) return;

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
      description: formData.description,
      category_id: formData.category,
      date: formData.date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      location: formData.location,
      is_virtual: formData.is_virtual,
      max_attendees: formData.max_attendees,
      speaker: formData.speaker,
    };

    updateMutation.mutate({ id: editingEvent.id, data: updateData });
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
                <div className="space-y-2">
                  <Label htmlFor="max_attendees">Max Attendees</Label>
                  <Input
                    id="max_attendees"
                    type="number"
                    value={formData.max_attendees}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_attendees: parseInt(e.target.value),
                      })
                    }
                  />
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
              <p className="text-sm text-gray-500">Total Registrations</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.reduce((sum, e) => sum + (e.registered_count || e.current_attendees || 0), 0)}
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
                  variant={(event.status === "published" || event.status === "upcoming") ? "success" : "secondary"}
                >
                  {event.status}
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
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {event.registered_count || event.current_attendees || 0} / {event.max_attendees} registered
                  </span>
                </div>
              </div>
            </CardContent>
            <div className="p-4 pt-0 flex gap-2">
              {event.status === "draft" && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handlePublish(event.id)}
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
                onClick={() => handleEditClick(event)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteClick(event)}
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

      {/* Edit Dialog - Add after create dialog, similar structure */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update event details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
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
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-start-time">Start Time</Label>
                <Input
                  id="edit-start-time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-end-time">End Time</Label>
                <Input
                  id="edit-end-time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-speaker">Speaker</Label>
                <Input
                  id="edit-speaker"
                  value={formData.speaker}
                  onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-max-attendees">Max Attendees</Label>
                <Input
                  id="edit-max-attendees"
                  type="number"
                  value={formData.max_attendees}
                  onChange={(e) => setFormData({ ...formData, max_attendees: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Event
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
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{eventToDelete?.title}"? This action cannot be undone.
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
